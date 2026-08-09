import { describe, it, expect } from 'vitest';
import { SaveManager } from '../src/lib/SaveManager';
import { Gen5SaveParser } from '../src/lib/Gen5SaveParser';

describe('SaveManager and Gen5SaveParser', () => {
  it('SaveManager should return Gen5SaveParser for exactly 512KB buffers', () => {
    const buffer = new ArrayBuffer(524288); // 512KB exactly
    const parser = SaveManager.getParser(buffer);
    expect(parser).toBeInstanceOf(Gen5SaveParser);
  });

  it('Gen5SaveParser detectGameVersion should distinguish BW vs B2W2 based on party offsets', () => {
    const parser = new Gen5SaveParser();
    const bwBuffer = new ArrayBuffer(524288);
    const bwView = new DataView(bwBuffer);
    
    // Set party count at BW offset
    bwView.setUint32(0x18E08, 6, true);
    
    const bwResult = parser.parse(bwBuffer);
    expect(bwResult.gameVersion).toBe('Black/White');
    
    const b2w2Buffer = new ArrayBuffer(524288);
    const b2w2View = new DataView(b2w2Buffer);
    
    // Set party count at B2W2 offset
    b2w2View.setUint32(0x18E00, 4, true);
    
    const b2w2Result = parser.parse(b2w2Buffer);
    expect(b2w2Result.gameVersion).toBe('Black 2/White 2');
  });

  it('getActiveSaveSlot should choose higher save index', () => {
    const parser = new Gen5SaveParser();
    const buffer = new ArrayBuffer(524288);
    const view = new DataView(buffer);
    
    // Slot 1 index at 0x23FFC
    view.setUint32(0x23FFC, 10, true);
    // Slot 2 index at 0x47FFC
    view.setUint32(0x47FFC, 25, true);
    
    // Since we need to access private method to test it purely, 
    // we can observe it through parse which extracts the trainer name from the active slot.
    // Let's set Trainer Name in slot 2 (B2W2) -> offset is 0x24000 + 0x19400
    // Wait, let's just make it BW in slot 2 -> offset is 0x24000 + 0x18E08 for Party count
    view.setUint32(0x24000 + 0x18E08, 6, true);
    view.setUint16(0x24000 + 0x19404 + 0, 'P'.charCodeAt(0), true);
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
    
    view.setUint32(0x18E08, 1, true); // 1 Pokemon in party (BW offset)
    
    const pkmnOffset = 0x18E08 + 4;
    
    // PID: 0x00000001
    // shiftIndex = ((1 & 0x3E000) >>> 13) % 24 = 0
    // Permutation 0: ABCD
    view.setUint32(pkmnOffset, 1, true);
    
    // Checksum = 0
    view.setUint16(pkmnOffset + 6, 0, true);
    
    let seed = 0;
    const prngWords = [];
    for (let i = 0; i < 64; i++) {
      seed = (Math.imul(seed, 0x41C64E6D) + 0x6073) >>> 0;
      prngWords.push(seed >>> 16);
    }
    
    view.setUint16(pkmnOffset + 0x08, 25 ^ prngWords[0], true); // Species
    view.setUint16(pkmnOffset + 0x0C, 12345 ^ prngWords[2], true); // OTID
    view.setUint16(pkmnOffset + 0x0E, 54321 ^ prngWords[3], true); // OTSID
    view.setUint16(pkmnOffset + 0x28, 33 ^ prngWords[16], true); // Move 1
    
    view.setUint16(pkmnOffset + 0x48, 'P'.charCodeAt(0) ^ prngWords[32], true);
    view.setUint16(pkmnOffset + 0x4A, 'I'.charCodeAt(0) ^ prngWords[33], true);
    view.setUint16(pkmnOffset + 0x4C, 'K'.charCodeAt(0) ^ prngWords[34], true);
    view.setUint16(pkmnOffset + 0x4E, 'A'.charCodeAt(0) ^ prngWords[35], true);
    view.setUint16(pkmnOffset + 0x50, 0xFFFF ^ prngWords[36], true);
    
    view.setUint8(pkmnOffset + 0x8C, 5); // Level
    
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
    
    view.setUint32(0x18E08, 1, true); 
    const pkmnOffset = 0x18E08 + 4;
    
    // PID=1, otid=1, otsid=1 -> shiny
    view.setUint32(pkmnOffset, 1, true);
    view.setUint16(pkmnOffset + 6, 0, true);
    
    let seed = 0;
    const prngWords = [];
    for (let i = 0; i < 64; i++) {
      seed = (Math.imul(seed, 0x41C64E6D) + 0x6073) >>> 0;
      prngWords.push(seed >>> 16);
    }
    
    view.setUint16(pkmnOffset + 0x0C, 1 ^ prngWords[2], true);
    view.setUint16(pkmnOffset + 0x0E, 1 ^ prngWords[3], true);
    
    const team = parser.parseTeam(buffer);
    expect(team[0].isShiny).toBe(true);
  });
});
