export interface SaveData {
  trainerName: string;
}

export class GBASaveParser {
  parse(buffer: ArrayBuffer): SaveData {
    if (buffer.byteLength !== 131072 && buffer.byteLength !== 65536) { // 128KB or 64KB
      throw new Error('Invalid save file size. Expected 64KB or 128KB GBA save.');
    }
    return { trainerName: 'Player' }; // Stub for now
  }

  public findActiveSaveOffset(buffer: ArrayBuffer): number {
    const view = new DataView(buffer);
    const saveAIndex = view.getUint32(0x0FFC, true);

    let saveBIndex = -1;
    if (buffer.byteLength >= 0xE000 + 0x0FFC + 4) {
      saveBIndex = view.getUint32(0xE000 + 0x0FFC, true);
    }

    return saveBIndex > saveAIndex ? 0xE000 : 0x0000;
  }
}

