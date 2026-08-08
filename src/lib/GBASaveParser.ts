export interface SaveData {
  trainerName: string;
}

export interface Pokemon {
  pid: number;
  otid: number;
  speciesId?: number;
  level?: number;
}

export class GBASaveParser {
  validateSize(buffer: ArrayBuffer): void {
    if (buffer.byteLength > 131072) {
      throw new Error('Invalid save file size. Expected maximum 128KB GBA save.');
    }
  }

  parse(buffer: ArrayBuffer): SaveData {
    this.validateSize(buffer);
    return { trainerName: 'Player' }; // Stub for now
  }

  public findActiveSaveOffset(buffer: ArrayBuffer): number {
    if (buffer.byteLength < 0x0FFC + 4) {
      return 0x0000;
    }
    const view = new DataView(buffer);
    const saveAIndex = view.getUint32(0x0FFC, true);

    let saveBIndex = -1;
    if (buffer.byteLength >= 0xE000 + 0x0FFC + 4) {
      saveBIndex = view.getUint32(0xE000 + 0x0FFC, true);
    }

    return saveBIndex > saveAIndex ? 0xE000 : 0x0000;
  }

  public parseTeam(buffer: ArrayBuffer): Pokemon[] {
    if (buffer.byteLength < 65536) {
      return [];
    }
    const activeOffset = this.findActiveSaveOffset(buffer);
    const view = new DataView(buffer);
    
    // Find Section 1 (Team/Items)
    let section1Offset = -1;
    for (let i = 0; i < 14; i++) {
      const sectionStart = activeOffset + (i * 4096);
      if (sectionStart + 0x0FF4 + 2 > buffer.byteLength) {
        break;
      }
      const sectionId = view.getUint16(sectionStart + 0x0FF4, true);
      if (sectionId === 1) {
        section1Offset = sectionStart;
        break;
      }
    }
    
    if (section1Offset === -1) return [];
    
    // FireRed/LeafGreen Party offset in Section 1 is 0x0234 (Count) and 0x0238 (Data)
    // Note: Emerald is 0x0234 as well. Ruby/Sapphire is 0x0234.
    if (section1Offset + 0x0234 + 4 > buffer.byteLength) return [];
    const partyCount = view.getUint32(section1Offset + 0x0234, true);
    const safeCount = Math.min(partyCount, 6);
    
    const team: Pokemon[] = [];
    for (let i = 0; i < safeCount; i++) {
      const pkmnOffset = section1Offset + 0x0238 + (i * 100);
      if (pkmnOffset + 8 > buffer.byteLength) {
        break;
      }
      const pid = view.getUint32(pkmnOffset, true);
      const otid = view.getUint32(pkmnOffset + 4, true);
      // Decryption and species mapping will be added in the next task
      team.push({ pid, otid });
    }
    
    return team;
  }
}


