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
}
