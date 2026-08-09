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
});
