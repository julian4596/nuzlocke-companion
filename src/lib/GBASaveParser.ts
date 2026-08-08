export const SECTION_SIZE = 4096;
export const SAVE_B_OFFSET = 0xE000;
export const SECTION_ID_OFFSET = 0x0FF4;
export const SAVE_INDEX_OFFSET = 0x0FFC;
export const FRLG_TEAM_OFFSET = 0x0234;
export const RSE_TEAM_OFFSET = 0x0034;
export const MAX_SAVE_SIZE = 2097152;

export interface SaveData {
  trainerName: string;
}

export interface Pokemon {
  pid: number;
  otid: number;
  speciesId?: number;
  level?: number;
  nickname?: string;
}

const GROWTH_SUBSTRUCTURE_INDEX = [0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 2, 3, 1, 1, 2, 3, 2, 3, 1, 1, 2, 3, 2, 3];
export const LEVEL_OFFSET = 84;
export const SUBSTRUCTURE_START_OFFSET = 32;
export const SUBSTRUCTURE_SIZE = 12;

export class GBASaveParser {
  public validateSize(buffer: ArrayBuffer): void {
    if (buffer.byteLength > MAX_SAVE_SIZE) {
      throw new Error('Invalid save file size. Expected maximum 2MB GBA save.');
    }
  }

  parse(buffer: ArrayBuffer): SaveData {
    this.validateSize(buffer);
    return { trainerName: 'Player' }; // Stub for now
  }

  public findActiveSaveOffset(buffer: ArrayBuffer): number {
    if (buffer.byteLength < SAVE_INDEX_OFFSET + 4) {
      return 0x0000;
    }
    const view = new DataView(buffer);
    let saveAIndex = view.getUint32(SAVE_INDEX_OFFSET, true);
    if (saveAIndex === 0xFFFFFFFF) saveAIndex = -1;

    let saveBIndex = -1;
    if (buffer.byteLength >= SAVE_B_OFFSET + SAVE_INDEX_OFFSET + 4) {
      const idx = view.getUint32(SAVE_B_OFFSET + SAVE_INDEX_OFFSET, true);
      if (idx !== 0xFFFFFFFF) saveBIndex = idx;
    }

    return saveBIndex > saveAIndex ? SAVE_B_OFFSET : 0x0000;
  }

  public parseTeam(buffer: ArrayBuffer): Pokemon[] {
    const activeOffset = this.findActiveSaveOffset(buffer);
    const view = new DataView(buffer);
    
    // Find Section 1 (Team/Items)
    let section1Offset = -1;
    for (let i = 0; i < 14; i++) {
      const sectionStart = activeOffset + (i * SECTION_SIZE);
      if (sectionStart + SECTION_ID_OFFSET + 2 > buffer.byteLength) {
        break;
      }
      const sectionId = view.getUint16(sectionStart + SECTION_ID_OFFSET, true);
      if (sectionId === 1) {
        section1Offset = sectionStart;
        break;
      }
    }
    
    if (section1Offset === -1) return [];

    let teamOffset = -1;
    let partyCount = 0;

    // Check FRLG team count first
    if (section1Offset + FRLG_TEAM_OFFSET + 4 <= buffer.byteLength) {
      const frlgCount = view.getUint32(section1Offset + FRLG_TEAM_OFFSET, true);
      if (frlgCount >= 1 && frlgCount <= 6) {
        teamOffset = FRLG_TEAM_OFFSET;
        partyCount = frlgCount;
      }
    }

    // If FRLG check failed (not between 1 and 6), check RSE team count
    if (teamOffset === -1 && section1Offset + RSE_TEAM_OFFSET + 4 <= buffer.byteLength) {
      const rseCount = view.getUint32(section1Offset + RSE_TEAM_OFFSET, true);
      if (rseCount >= 1 && rseCount <= 6) {
        teamOffset = RSE_TEAM_OFFSET;
        partyCount = rseCount;
      }
    }

    if (teamOffset === -1) return [];

    const teamDataOffset = section1Offset + teamOffset + 4;
    const team: Pokemon[] = [];
    for (let i = 0; i < partyCount; i++) {
      const pkmnOffset = teamDataOffset + (i * 100);
      if (pkmnOffset + 100 > buffer.byteLength) {
        break;
      }
      const pid = view.getUint32(pkmnOffset, true);
      const otid = view.getUint32(pkmnOffset + 4, true);
      
      const level = view.getUint8(pkmnOffset + LEVEL_OFFSET);
      const nickname = 'Unknown';

      const key = pid ^ otid;
      const dataOffset = pkmnOffset + SUBSTRUCTURE_START_OFFSET;
      const growthIndex = GROWTH_SUBSTRUCTURE_INDEX[pid % 24];
      const growthOffset = dataOffset + growthIndex * SUBSTRUCTURE_SIZE;
      
      const encryptedWord = view.getUint32(growthOffset, true);
      const decryptedWord = (encryptedWord ^ key) >>> 0;
      const speciesId = decryptedWord & 0xFFFF;

      team.push({ pid, otid, speciesId, level, nickname });
    }
    
    return team;
  }
}



