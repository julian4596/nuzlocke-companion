import { describe, it, expect } from 'vitest';
import { SaveManager } from '../src/lib/SaveManager';
import { Gen5SaveParser } from '../src/lib/Gen5SaveParser';

describe('SaveManager and Gen5SaveParser', () => {
  it('SaveManager should return Gen5SaveParser for exactly 512KB buffers', () => {
    const buffer = new ArrayBuffer(524288);
    const parser = SaveManager.getParser(buffer);
    expect(parser).toBeInstanceOf(Gen5SaveParser);
  });

  it('Gen5SaveParser detectGameVersion should distinguish BW vs B2W2 based on Trainer Name in Slot 2', () => {
    const parser = new Gen5SaveParser();
    const bwBuffer = new ArrayBuffer(524288);
    const bwView = new DataView(bwBuffer);
    
    bwView.setUint16(0x19404, 'R'.charCodeAt(0), true);
    bwView.setUint16(0x19404 + 2, 'E'.charCodeAt(0), true);
    bwView.setUint16(0x19404 + 4, 'D'.charCodeAt(0), true);
    
    bwView.setUint16(0x24000 + 0x19404, 'R'.charCodeAt(0), true);
    bwView.setUint16(0x24000 + 0x19404 + 2, 'E'.charCodeAt(0), true);
    bwView.setUint16(0x24000 + 0x19404 + 4, 'D'.charCodeAt(0), true);
    
    const bwResult = parser.parse(bwBuffer);
    expect(bwResult.gameVersion).toBe('Black/White');
    
    const b2w2Buffer = new ArrayBuffer(524288);
    const b2w2View = new DataView(b2w2Buffer);
    
    b2w2View.setUint16(0x19404, 'R'.charCodeAt(0), true);
    b2w2View.setUint16(0x19404 + 2, 'E'.charCodeAt(0), true);
    b2w2View.setUint16(0x19404 + 4, 'D'.charCodeAt(0), true);
    
    b2w2View.setUint16(0x26000 + 0x19404, 'R'.charCodeAt(0), true);
    b2w2View.setUint16(0x26000 + 0x19404 + 2, 'E'.charCodeAt(0), true);
    b2w2View.setUint16(0x26000 + 0x19404 + 4, 'D'.charCodeAt(0), true);
    
    const b2w2Result = parser.parse(b2w2Buffer);
    expect(b2w2Result.gameVersion).toBe('Black 2/White 2');
  });

  it('getActiveSaveSlot should choose higher save index', () => {
    const parser = new Gen5SaveParser();
    const buffer = new ArrayBuffer(524288);
    const view = new DataView(buffer);
    
    view.setUint32(0x23FFC, 10, true);
    view.setUint32(0x47FFC, 25, true);
    
    view.setUint16(0x24000 + 0x19404, 'P'.charCodeAt(0), true);
    view.setUint16(0x24000 + 0x19404 + 2, 'L'.charCodeAt(0), true);
    view.setUint16(0x24000 + 0x19404 + 4, 'A'.charCodeAt(0), true);
    view.setUint16(0x24000 + 0x19404 + 6, 'Y'.charCodeAt(0), true);
    view.setUint16(0x24000 + 0x19404 + 8, 'E'.charCodeAt(0), true);
    view.setUint16(0x24000 + 0x19404 + 10, 'R'.charCodeAt(0), true);
    view.setUint16(0x24000 + 0x19404 + 12, 0xFFFF, true);
    
    const result = parser.parse(buffer);
    expect(result.trainerName).toBe('PLAYER');
    expect(result.gameVersion).toBe('Black/White');
  });

function writeSyntheticPokemon(
  view: DataView,
  offset: number,
  options: {
    pid: number;
    otid?: number;
    otsid?: number;
    speciesId?: number;
    moves?: number[];
    nickname?: string;
    level?: number;
    isParty?: boolean;
  }
) {
  const { pid, otid = 0, otsid = 0, speciesId = 0, moves = [], nickname = '', level = 5, isParty = false } = options;
  
  view.setUint32(offset, pid, true);
  
  const unshuffled = new Uint8Array(128);
  const unView = new DataView(unshuffled.buffer);
  
  // Block A (offset 0x00)
  unView.setUint16(0x00, speciesId, true);
  unView.setUint16(0x04, otid, true);
  unView.setUint16(0x06, otsid, true);
  
  // Block B (offset 0x20)
  for (let i = 0; i < 4; i++) {
    unView.setUint16(0x20 + i * 2, moves[i] || 0, true);
  }
  
  // Block C (offset 0x40)
  for (let i = 0; i < nickname.length; i++) {
    unView.setUint16(0x40 + i * 2, nickname.charCodeAt(i), true);
  }
  if (nickname.length < 11) {
    unView.setUint16(0x40 + nickname.length * 2, 0xFFFF, true);
  }
  
  // Block order
  const shiftIndex = ((pid & 0x3E000) >>> 13) % 24;
  const PERMUTATIONS = [
    [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1],
    [0, 3, 1, 2], [0, 3, 2, 1], [1, 0, 2, 3], [1, 0, 3, 2],
    [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0],
    [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0],
    [2, 3, 0, 1], [2, 3, 1, 0], [3, 0, 1, 2], [3, 0, 2, 1],
    [3, 1, 0, 2], [3, 1, 2, 0], [3, 2, 0, 1], [3, 2, 1, 0]
  ];
  const blockOrder = PERMUTATIONS[shiftIndex];
  
  // Shuffled data
  const shuffled = new Uint8Array(128);
  for (let i = 0; i < 4; i++) {
    const srcOffset = blockOrder[i] * 32;
    const destOffset = i * 32;
    shuffled.set(unshuffled.subarray(srcOffset, srcOffset + 32), destOffset);
  }
  
  const shufView = new DataView(shuffled.buffer);
  let checksum = 0;
  for (let i = 0; i < 128; i += 2) {
    checksum = (checksum + shufView.getUint16(i, true)) & 0xFFFF;
  }
  view.setUint16(offset + 6, checksum, true);
  
  // Encrypt
  let seed = checksum;
  for (let i = 0; i < 128; i += 2) {
    seed = (Math.imul(seed, 0x41C64E6D) + 0x6073) >>> 0;
    const prngWord = seed >>> 16;
    const decryptedWord = shufView.getUint16(i, true);
    view.setUint16(offset + 8 + i, decryptedWord ^ prngWord, true);
  }
  
  if (isParty) {
    const partyData = new Uint8Array(84);
    const partyView = new DataView(partyData.buffer);
    partyView.setUint8(4, level);
    partyView.setUint16(6, 20, true);
    partyView.setUint16(8, 20, true);
    partyView.setUint16(10, 10, true);
    partyView.setUint16(12, 10, true);
    partyView.setUint16(14, 10, true);
    partyView.setUint16(16, 10, true);
    partyView.setUint16(18, 10, true);
    
    let partySeed = pid;
    for (let i = 0; i < 84; i += 2) {
      partySeed = (Math.imul(partySeed, 0x41C64E6D) + 0x6073) >>> 0;
      const prngWord = partySeed >>> 16;
      const decWord = partyView.getUint16(i, true);
      view.setUint16(offset + 136 + i, decWord ^ prngWord, true);
    }
  }
}

  it('should decrypt Pokemon data correctly using LCRNG and block un-shuffling', () => {
    const parser = new Gen5SaveParser();
    const buffer = new ArrayBuffer(524288);
    const view = new DataView(buffer);
    
    view.setUint8(0x18E04, 1); 
    const pkmnOffset = 0x18E08;
    
    writeSyntheticPokemon(view, pkmnOffset, {
      pid: 1,
      speciesId: 25,
      otid: 12345,
      otsid: 54321,
      moves: [33],
      nickname: 'PIKA',
      level: 5,
      isParty: true
    });
    
    const team = parser.parseTeam(buffer);
    expect(team.length).toBe(1);
    expect(team[0].speciesId).toBe(25);
    expect(team[0].otid).toBe(12345);
    expect(team[0].moves?.[0]).toBe(33);
    expect(team[0].nickname).toBe('PIKA');
    expect(team[0].level).toBe(5);
    expect(team[0].isShiny).toBe(false);
  });

  it('should correctly identify a shiny Pokemon', () => {
    const parser = new Gen5SaveParser();
    const buffer = new ArrayBuffer(524288);
    const view = new DataView(buffer);
    
    view.setUint8(0x18E04, 1); 
    const pkmnOffset = 0x18E08;
    
    writeSyntheticPokemon(view, pkmnOffset, {
      pid: 1,
      speciesId: 25,
      otid: 1,
      otsid: 1,
      level: 5,
      isParty: true
    });
    
    const team = parser.parseTeam(buffer);
    expect(team.length).toBe(1);
    expect(team[0].isShiny).toBe(true);
  });

  it('should parse boxes correctly', () => {
    const parser = new Gen5SaveParser();
    const buffer = new ArrayBuffer(524288);
    const view = new DataView(buffer);
    
    const pkmnOffset = 0x400;
    
    writeSyntheticPokemon(view, pkmnOffset, {
      pid: 1,
      speciesId: 151,
      otid: 999,
      isParty: false
    });
    
    const boxes = parser.parseBoxes(buffer);
    expect(boxes.length).toBe(24);
    expect(boxes[0].length).toBeGreaterThan(0);
    expect(boxes[0][0].speciesId).toBe(151);
    expect(boxes[0][0].otid).toBe(999);
  });
});
