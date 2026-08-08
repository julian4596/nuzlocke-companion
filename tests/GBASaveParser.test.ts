import { describe, it, expect } from 'vitest';
import {
  GBASaveParser,
  SECTION_SIZE,
  SAVE_B_OFFSET,
  SECTION_ID_OFFSET,
  SAVE_INDEX_OFFSET,
  FRLG_TEAM_OFFSET,
  RSE_TEAM_OFFSET,
  MAX_SAVE_SIZE,
} from '@/lib/GBASaveParser';

describe('GBASaveParser', () => {
  it('should initialize and throw on invalid size over 2MB', () => {
    const parser = new GBASaveParser();
    const badBuffer = new ArrayBuffer(MAX_SAVE_SIZE + 1);
    expect(() => parser.parse(badBuffer)).toThrow('Invalid save file size');
  });

  it('should accept valid 128KB save file', () => {
    const parser = new GBASaveParser();
    const valid128kBuffer = new ArrayBuffer(131072);
    const result = parser.parse(valid128kBuffer);
    expect(result).toBeDefined();
    expect(result.trainerName).toBe('Player');
  });

  it('should accept valid 64KB save file', () => {
    const parser = new GBASaveParser();
    const valid64kBuffer = new ArrayBuffer(65536);
    const result = parser.parse(valid64kBuffer);
    expect(result).toBeDefined();
    expect(result.trainerName).toBe('Player');
  });
});

describe('GBASaveParser Save Slot Detection', () => {
  it('should identify the correct active save offset', () => {
    // Create a mock 64KB buffer
    const buffer = new ArrayBuffer(65536);
    const view = new DataView(buffer);
    
    // Save A: Section 0 at 0x0000, Save Index at SAVE_INDEX_OFFSET = 5
    view.setUint32(SAVE_INDEX_OFFSET, 5, true); // Little endian
    
    // Save B: Section 0 at SAVE_B_OFFSET, Save Index at SAVE_B_OFFSET + SAVE_INDEX_OFFSET = 10 (Most recent)
    view.setUint32(SAVE_B_OFFSET + SAVE_INDEX_OFFSET, 10, true);
    
    const parser = new GBASaveParser();
    const offset = parser.findActiveSaveOffset(buffer);
    
    expect(offset).toBe(SAVE_B_OFFSET);
  });

  it('should return 0x0000 when Save A has a higher save index', () => {
    const buffer = new ArrayBuffer(65536);
    const view = new DataView(buffer);
    
    // Save A: Section 0 at 0x0000, Save Index at SAVE_INDEX_OFFSET = 15
    view.setUint32(SAVE_INDEX_OFFSET, 15, true);
    
    // Save B: Section 0 at SAVE_B_OFFSET, Save Index at SAVE_B_OFFSET + SAVE_INDEX_OFFSET = 10
    view.setUint32(SAVE_B_OFFSET + SAVE_INDEX_OFFSET, 10, true);
    
    const parser = new GBASaveParser();
    const offset = parser.findActiveSaveOffset(buffer);
    
    expect(offset).toBe(0x0000);
  });
});

describe('GBASaveParser Team Extraction', () => {
  it('should parse and decrypt a pokemon team', () => {
    const buffer = new ArrayBuffer(65536);
    const view = new DataView(buffer);
    
    // Mock Save A as active
    view.setUint32(SAVE_INDEX_OFFSET, 10, true);
    
    // Section 1 (Team/Items) ID at SECTION_SIZE + SECTION_ID_OFFSET
    view.setUint16(SECTION_SIZE + SECTION_ID_OFFSET, 1, true); // Section ID 1
    
    // Set Party Count
    view.setUint32(SECTION_SIZE + FRLG_TEAM_OFFSET, 1, true); 
    
    // Set Pokemon 1 PID and OTID
    const pkmnOffset = SECTION_SIZE + FRLG_TEAM_OFFSET + 4;
    view.setUint32(pkmnOffset, 0x12345678, true); // PID
    view.setUint32(pkmnOffset + 4, 0x87654321, true); // OTID
    
    const parser = new GBASaveParser();
    const team = parser.parseTeam(buffer);
    
    expect(team.length).toBe(1);
    expect(team[0].pid).toBe(0x12345678);
  });

  it('should parse a pokemon team from RSE offset when FRLG offset is 0', () => {
    const buffer = new ArrayBuffer(65536);
    const view = new DataView(buffer);
    
    // Mock Save A as active
    view.setUint32(SAVE_INDEX_OFFSET, 10, true);
    
    // Section 1 (Team/Items) ID at SECTION_SIZE + SECTION_ID_OFFSET
    view.setUint16(SECTION_SIZE + SECTION_ID_OFFSET, 1, true); // Section ID 1
    
    // FRLG offset (0x0234) is 0 (e.g. empty slot #6 in RSE save with 1-5 Pokemon)
    view.setUint32(SECTION_SIZE + FRLG_TEAM_OFFSET, 0, true);
    
    // Set RSE Party Count at RSE_TEAM_OFFSET
    view.setUint32(SECTION_SIZE + RSE_TEAM_OFFSET, 2, true);
    
    // Set Pokemon 1 PID and OTID at SECTION_SIZE + RSE_TEAM_OFFSET + 4
    const pkmn1Offset = SECTION_SIZE + RSE_TEAM_OFFSET + 4;
    view.setUint32(pkmn1Offset, 0xAABBCCDD, true);
    view.setUint32(pkmn1Offset + 4, 0x11223344, true);

    // Set Pokemon 2 PID and OTID at SECTION_SIZE + RSE_TEAM_OFFSET + 4 + 100
    const pkmn2Offset = pkmn1Offset + 100;
    view.setUint32(pkmn2Offset, 0x55667788, true);
    view.setUint32(pkmn2Offset + 4, 0x99AABBCC, true);
    
    const parser = new GBASaveParser();
    const team = parser.parseTeam(buffer);
    
    expect(team.length).toBe(2);
    expect(team[0].pid).toBe(0xAABBCCDD);
    expect(team[0].otid).toBe(0x11223344);
    expect(team[1].pid).toBe(0x55667788);
    expect(team[1].otid).toBe(0x99AABBCC);
  });

  it('should return an empty array without throwing RangeError when buffer is smaller than 65536 bytes', () => {
    const parser = new GBASaveParser();
    expect(parser.parseTeam(new ArrayBuffer(0))).toEqual([]);
    expect(parser.parseTeam(new ArrayBuffer(100))).toEqual([]);
    expect(parser.parseTeam(new ArrayBuffer(4096))).toEqual([]);
  });

  it('should return 0x0000 without throwing RangeError when buffer is smaller than SECTION_SIZE bytes', () => {
    const parser = new GBASaveParser();
    expect(parser.findActiveSaveOffset(new ArrayBuffer(10))).toBe(0x0000);
  });

  it('should extract Level and Decrypt Species ID', () => {
    const buffer = new ArrayBuffer(65536);
    const view = new DataView(buffer);
    
    // Mock Save A as active
    view.setUint32(SAVE_INDEX_OFFSET, 10, true);
    view.setUint16(SECTION_SIZE + SECTION_ID_OFFSET, 1, true); 
    view.setUint32(SECTION_SIZE + FRLG_TEAM_OFFSET, 1, true); 
    
    const pkmnOffset = SECTION_SIZE + FRLG_TEAM_OFFSET + 4;
    
    const pid = 0; // pid % 24 = 0 (GAEM)
    const otid = 0x87654321;
    view.setUint32(pkmnOffset, pid, true);
    view.setUint32(pkmnOffset + 4, otid, true);
    
    // Set level (offset 84)
    view.setUint8(pkmnOffset + 84, 15);
    
    // Set Species ID in Growth block
    const key = pid ^ otid;
    const speciesId = 25; // Pikachu
    const item = 0;
    const growthWord1 = speciesId | (item << 16);
    const encryptedGrowthWord1 = (growthWord1 ^ key) >>> 0;
    
    // Since PID=0, Growth block is at index 0 (offset 32)
    view.setUint32(pkmnOffset + 32, encryptedGrowthWord1, true);

    const parser = new GBASaveParser();
    const team = parser.parseTeam(buffer);
    
    expect(team.length).toBe(1);
    expect(team[0].level).toBe(15);
    expect(team[0].speciesId).toBe(25);
    expect(team[0].nickname).toBe('Unknown');
  });
});



