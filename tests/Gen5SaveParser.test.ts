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

  it('should decrypt Pokemon data correctly using LCRNG and block un-shuffling', () => {
    const parser = new Gen5SaveParser();
    const buffer = new ArrayBuffer(524288);
    const view = new DataView(buffer);
    
    view.setUint8(0x18E04, 1); 
    const pkmnOffset = 0x18E08;
    
    view.setUint32(pkmnOffset, 1, true);
    
    let seed = 0;
    const prngWords = [];
    for (let i = 0; i < 64; i++) {
      seed = (Math.imul(seed, 0x41C64E6D) + 0x6073) >>> 0;
      prngWords.push(seed >>> 16);
    }
    
    view.setUint16(pkmnOffset + 0x08, 25 ^ prngWords[0], true);
    view.setUint16(pkmnOffset + 0x0C, 12345 ^ prngWords[2], true);
    view.setUint16(pkmnOffset + 0x0E, 54321 ^ prngWords[3], true);
    view.setUint16(pkmnOffset + 0x28, 33 ^ prngWords[16], true);
    
    view.setUint16(pkmnOffset + 0x48, 'P'.charCodeAt(0) ^ prngWords[32], true);
    view.setUint16(pkmnOffset + 0x4A, 'I'.charCodeAt(0) ^ prngWords[33], true);
    view.setUint16(pkmnOffset + 0x4C, 'K'.charCodeAt(0) ^ prngWords[34], true);
    view.setUint16(pkmnOffset + 0x4E, 'A'.charCodeAt(0) ^ prngWords[35], true);
    view.setUint16(pkmnOffset + 0x50, 0xFFFF ^ prngWords[36], true);
    
    view.setUint8(pkmnOffset + 0x8C, 5); 
    
    let expectedChecksum = 0;
    for (let i = 0; i < 64; i++) {
        expectedChecksum = (expectedChecksum + (view.getUint16(pkmnOffset + 8 + i * 2, true) ^ prngWords[i])) & 0xFFFF;
    }
    view.setUint16(pkmnOffset + 6, expectedChecksum, true);
    
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
    
    view.setUint32(pkmnOffset, 1, true);
    
    let seed = 0;
    const prngWords = [];
    for (let i = 0; i < 64; i++) {
      seed = (Math.imul(seed, 0x41C64E6D) + 0x6073) >>> 0;
      prngWords.push(seed >>> 16);
    }
    
    view.setUint16(pkmnOffset + 0x0C, 1 ^ prngWords[2], true);
    view.setUint16(pkmnOffset + 0x0E, 1 ^ prngWords[3], true);
    
    let expectedChecksum = 0;
    for (let i = 0; i < 64; i++) {
        expectedChecksum = (expectedChecksum + (view.getUint16(pkmnOffset + 8 + i * 2, true) ^ prngWords[i])) & 0xFFFF;
    }
    view.setUint16(pkmnOffset + 6, expectedChecksum, true);
    
    const team = parser.parseTeam(buffer);
    expect(team[0].isShiny).toBe(true);
  });

  it('should parse boxes correctly', () => {
    const parser = new Gen5SaveParser();
    const buffer = new ArrayBuffer(524288);
    const view = new DataView(buffer);
    
    const pkmnOffset = 0x400;
    
    view.setUint32(pkmnOffset, 1, true);
    
    let seed = 0;
    const prngWords = [];
    for (let i = 0; i < 64; i++) {
      seed = (Math.imul(seed, 0x41C64E6D) + 0x6073) >>> 0;
      prngWords.push(seed >>> 16);
    }
    
    view.setUint16(pkmnOffset + 0x08, 151 ^ prngWords[0], true); 
    view.setUint16(pkmnOffset + 0x0C, 999 ^ prngWords[2], true); 
    
    let expectedChecksum = 0;
    for (let i = 0; i < 64; i++) {
        expectedChecksum = (expectedChecksum + (view.getUint16(pkmnOffset + 8 + i * 2, true) ^ prngWords[i])) & 0xFFFF;
    }
    view.setUint16(pkmnOffset + 6, expectedChecksum, true);
    
    const boxes = parser.parseBoxes(buffer);
    expect(boxes.length).toBe(24);
    expect(boxes[0].length).toBeGreaterThan(0);
    expect(boxes[0][0].speciesId).toBe(151);
    expect(boxes[0][0].otid).toBe(999);
  });
});
