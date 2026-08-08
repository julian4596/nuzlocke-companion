import { describe, it, expect } from 'vitest';
import { GBASaveParser } from '@/lib/GBASaveParser';

describe('GBASaveParser', () => {
  it('should initialize and throw on invalid size over 2MB', () => {
    const parser = new GBASaveParser();
    const badBuffer = new ArrayBuffer(2097153);
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
    
    // Save A: Section 0 at 0x0000, Save Index at 0x0FFC = 5
    view.setUint32(0x0FFC, 5, true); // Little endian
    
    // Save B: Section 0 at 0xE000, Save Index at 0xEFFC = 10 (Most recent)
    view.setUint32(0xE000 + 0x0FFC, 10, true);
    
    const parser = new GBASaveParser();
    const offset = parser.findActiveSaveOffset(buffer);
    
    expect(offset).toBe(0xE000);
  });

  it('should return 0x0000 when Save A has a higher save index', () => {
    const buffer = new ArrayBuffer(65536);
    const view = new DataView(buffer);
    
    // Save A: Section 0 at 0x0000, Save Index at 0x0FFC = 15
    view.setUint32(0x0FFC, 15, true);
    
    // Save B: Section 0 at 0xE000, Save Index at 0xEFFC = 10
    view.setUint32(0xE000 + 0x0FFC, 10, true);
    
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
    view.setUint32(0x0FFC, 10, true);
    
    // Section 1 (Team/Items) ID at 0x1000 + 0x0FF4
    view.setUint16(0x1000 + 0x0FF4, 1, true); // Section ID 1
    
    // Set Party Count
    view.setUint32(0x1000 + 0x0234, 1, true); 
    
    // Set Pokemon 1 PID and OTID
    const pkmnOffset = 0x1000 + 0x0238;
    view.setUint32(pkmnOffset, 0x12345678, true); // PID
    view.setUint32(pkmnOffset + 4, 0x87654321, true); // OTID
    
    const parser = new GBASaveParser();
    const team = parser.parseTeam(buffer);
    
    expect(team.length).toBe(1);
    expect(team[0].pid).toBe(0x12345678);
  });

  it('should return an empty array without throwing RangeError when buffer is smaller than 65536 bytes', () => {
    const parser = new GBASaveParser();
    expect(parser.parseTeam(new ArrayBuffer(0))).toEqual([]);
    expect(parser.parseTeam(new ArrayBuffer(100))).toEqual([]);
    expect(parser.parseTeam(new ArrayBuffer(4096))).toEqual([]);
  });

  it('should return 0x0000 without throwing RangeError when buffer is smaller than 0x1000 bytes', () => {
    const parser = new GBASaveParser();
    expect(parser.findActiveSaveOffset(new ArrayBuffer(10))).toBe(0x0000);
  });
});


