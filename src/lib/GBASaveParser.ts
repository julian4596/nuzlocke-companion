import { decodeGBAString } from './GBACharMap';
import { SaveData, Pokemon } from './types';
import { BaseSaveParser } from './BaseSaveParser';

export const SECTION_SIZE = 4096;
export const SAVE_B_OFFSET = 0xE000;
export const SECTION_ID_OFFSET = 0x0FF4;
export const SAVE_INDEX_OFFSET = 0x0FFC;
export const FRLG_TEAM_OFFSET = 0x0234;
export const RSE_TEAM_OFFSET = 0x0034;
export const MAX_SAVE_SIZE = 2097152;



const GROWTH_SUBSTRUCTURE_INDEX = [0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 2, 3, 1, 1, 2, 3, 2, 3, 1, 1, 2, 3, 2, 3];
const ATTACKS_SUBSTRUCTURE_INDEX =[1, 1, 2, 3, 2, 3, 0, 0, 0, 0, 0, 0, 2, 3, 1, 1, 3, 2, 2, 3, 1, 1, 3, 2];
const EVS_SUBSTRUCTURE_INDEX =    [2, 3, 1, 1, 3, 2, 2, 3, 1, 1, 3, 2, 0, 0, 0, 0, 0, 0, 3, 2, 3, 2, 1, 1];
const MISC_SUBSTRUCTURE_INDEX =   [3, 2, 3, 2, 1, 1, 3, 2, 3, 2, 1, 1, 3, 2, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0];
export const LEVEL_OFFSET = 84;
export const SUBSTRUCTURE_START_OFFSET = 32;
export const SUBSTRUCTURE_SIZE = 12;

export class GBASaveParser extends BaseSaveParser {
  public validateSize(buffer: ArrayBuffer): void {
    if (buffer.byteLength > MAX_SAVE_SIZE) {
      throw new Error('Invalid save file size. Expected maximum 2MB GBA save.');
    }
  }

  public detectGameVersion(buffer: ArrayBuffer, activeOffset: number): string {
    const view = new DataView(buffer);
    let section0Offset = -1;
    
    for (let i = 0; i < 14; i++) {
      const sectionStart = activeOffset + (i * SECTION_SIZE);
      if (sectionStart + SECTION_ID_OFFSET + 2 > buffer.byteLength) break;
      const sectionId = view.getUint16(sectionStart + SECTION_ID_OFFSET, true);
      if (sectionId === 0) {
        section0Offset = sectionStart;
        break;
      }
    }

    if (section0Offset === -1) return 'Unknown';

    const gameCode = view.getUint32(section0Offset + 0x00AC, true);
    if (gameCode === 1) {
      return 'FRLG';
    }

    const securityKeyCopy = view.getUint32(section0Offset + 0x01F4, true);
    if (gameCode === securityKeyCopy && gameCode !== 0) {
      return 'Emerald';
    }

    return 'RubySapphire';
  }

  parse(buffer: ArrayBuffer): SaveData {
    this.validateSize(buffer);
    const activeOffset = this.findActiveSaveOffset(buffer);
    const gameVersion = this.detectGameVersion(buffer, activeOffset);
    return { trainerName: 'Player', gameVersion };
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
      const nickname = decodeGBAString(buffer, pkmnOffset + 8, 10);

      const hp = view.getUint16(pkmnOffset + 86, true);
      const maxHp = view.getUint16(pkmnOffset + 88, true);
      const attack = view.getUint16(pkmnOffset + 90, true);
      const defense = view.getUint16(pkmnOffset + 92, true);
      const speed = view.getUint16(pkmnOffset + 94, true);
      const spAttack = view.getUint16(pkmnOffset + 96, true);
      const spDefense = view.getUint16(pkmnOffset + 98, true);

      const key = pid ^ otid;
      const dataOffset = pkmnOffset + SUBSTRUCTURE_START_OFFSET;
      
      const p24 = pid % 24;
      const growthIndex = GROWTH_SUBSTRUCTURE_INDEX[p24];
      const attacksIndex = ATTACKS_SUBSTRUCTURE_INDEX[p24];
      const evsIndex = EVS_SUBSTRUCTURE_INDEX[p24];
      const miscIndex = MISC_SUBSTRUCTURE_INDEX[p24];
      
      // Decrypt Growth
      const growthOffset = dataOffset + growthIndex * SUBSTRUCTURE_SIZE;
      const encryptedGrowthWord1 = view.getUint32(growthOffset, true);
      const decryptedGrowthWord1 = (encryptedGrowthWord1 ^ key) >>> 0;
      const speciesId = decryptedGrowthWord1 & 0xFFFF;
      const experience = (view.getUint32(growthOffset + 4, true) ^ key) >>> 0;
      const nature = pid % 25;
      
      // Decrypt Attacks
      const attacksOffset = dataOffset + attacksIndex * SUBSTRUCTURE_SIZE;
      const decA1 = (view.getUint32(attacksOffset, true) ^ key) >>> 0;
      const decA2 = (view.getUint32(attacksOffset + 4, true) ^ key) >>> 0;
      const decA3 = (view.getUint32(attacksOffset + 8, true) ^ key) >>> 0;
      const moves = [
        decA1 & 0xFFFF,
        (decA1 >>> 16) & 0xFFFF,
        decA2 & 0xFFFF,
        (decA2 >>> 16) & 0xFFFF
      ];
      const pp = [
        decA3 & 0xFF,
        (decA3 >>> 8) & 0xFF,
        (decA3 >>> 16) & 0xFF,
        (decA3 >>> 24) & 0xFF
      ];

      // Decrypt EVs
      const evsOffset = dataOffset + evsIndex * SUBSTRUCTURE_SIZE;
      const decE1 = (view.getUint32(evsOffset, true) ^ key) >>> 0;
      const decE2 = (view.getUint32(evsOffset + 4, true) ^ key) >>> 0;
      const evs = {
        hp: decE1 & 0xFF,
        attack: (decE1 >>> 8) & 0xFF,
        defense: (decE1 >>> 16) & 0xFF,
        speed: (decE1 >>> 24) & 0xFF,
        spAttack: decE2 & 0xFF,
        spDefense: (decE2 >>> 8) & 0xFF
      };

      // Decrypt Misc
      const miscOffset = dataOffset + miscIndex * SUBSTRUCTURE_SIZE;
      const decM2 = (view.getUint32(miscOffset + 4, true) ^ key) >>> 0;
      const ivs = {
        hp: decM2 & 0x1F,
        attack: (decM2 >>> 5) & 0x1F,
        defense: (decM2 >>> 10) & 0x1F,
        speed: (decM2 >>> 15) & 0x1F,
        spAttack: (decM2 >>> 20) & 0x1F,
        spDefense: (decM2 >>> 25) & 0x1F
      };
      const abilityBit = (decM2 >>> 31) & 1;

      team.push({ 
        pid, otid, speciesId, level, experience, nature, nickname, abilityBit,
        hp, maxHp, attack, defense, speed, spAttack, spDefense,
        moves, pp, evs, ivs
      });
    }
    
    return team;
  }

  public parseBoxes(buffer: ArrayBuffer): Pokemon[][] {
    const activeOffset = this.findActiveSaveOffset(buffer);
    const view = new DataView(buffer);
    
    const pcSections: { id: number, offset: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const sectionStart = activeOffset + (i * SECTION_SIZE);
      if (sectionStart + SECTION_ID_OFFSET + 2 > buffer.byteLength) break;
      
      const sectionId = view.getUint16(sectionStart + SECTION_ID_OFFSET, true);
      if (sectionId >= 5 && sectionId <= 13) {
        pcSections.push({ id: sectionId, offset: sectionStart });
      }
    }
    
    if (pcSections.length !== 9) return [];
    
    pcSections.sort((a, b) => a.id - b.id);
    
    const pcBuffer = new Uint8Array(35712);
    const saveArray = new Uint8Array(buffer);
    for (let i = 0; i < 9; i++) {
      pcBuffer.set(saveArray.subarray(pcSections[i].offset, pcSections[i].offset + 3968), i * 3968);
    }
    
    const pcView = new DataView(pcBuffer.buffer);
    const boxes: Pokemon[][] = Array.from({ length: 14 }, () => []);
    
    for (let box = 0; box < 14; box++) {
      for (let slot = 0; slot < 30; slot++) {
        // The first 4 bytes of the PC Buffer are the current box/header.
        const pkmnOffset = 4 + (box * 30 * 80) + (slot * 80);
        
        const pid = pcView.getUint32(pkmnOffset, true);
        const otid = pcView.getUint32(pkmnOffset + 4, true);
        
        if (pid === 0 && otid === 0) {
          boxes[box].push({ pid: 0, otid: 0 } as Pokemon);
          continue;
        }
        
        const nickname = decodeGBAString(pcBuffer.buffer, pkmnOffset + 8, 10);
        
        const key = pid ^ otid;
        const dataOffset = pkmnOffset + SUBSTRUCTURE_START_OFFSET;
        
        const p24 = pid % 24;
        const growthIndex = GROWTH_SUBSTRUCTURE_INDEX[p24];
        const attacksIndex = ATTACKS_SUBSTRUCTURE_INDEX[p24];
        const evsIndex = EVS_SUBSTRUCTURE_INDEX[p24];
        const miscIndex = MISC_SUBSTRUCTURE_INDEX[p24];
        
        // Decrypt Growth
        const growthOffset = dataOffset + growthIndex * SUBSTRUCTURE_SIZE;
        const speciesId = ((pcView.getUint32(growthOffset, true) ^ key) >>> 0) & 0xFFFF;
        const experience = (pcView.getUint32(growthOffset + 4, true) ^ key) >>> 0;
        const nature = pid % 25;
        
        // Decrypt Attacks
        const attacksOffset = dataOffset + attacksIndex * SUBSTRUCTURE_SIZE;
        const decA1 = (pcView.getUint32(attacksOffset, true) ^ key) >>> 0;
        const decA2 = (pcView.getUint32(attacksOffset + 4, true) ^ key) >>> 0;
        const moves = [
          decA1 & 0xFFFF, (decA1 >>> 16) & 0xFFFF,
          decA2 & 0xFFFF, (decA2 >>> 16) & 0xFFFF
        ];
        
        // Decrypt EVs
        const evsOffset = dataOffset + evsIndex * SUBSTRUCTURE_SIZE;
        const decE1 = (pcView.getUint32(evsOffset, true) ^ key) >>> 0;
        const decE2 = (pcView.getUint32(evsOffset + 4, true) ^ key) >>> 0;
        const evs = {
          hp: decE1 & 0xFF,
          attack: (decE1 >>> 8) & 0xFF,
          defense: (decE1 >>> 16) & 0xFF,
          speed: (decE1 >>> 24) & 0xFF,
          spAttack: decE2 & 0xFF,
          spDefense: (decE2 >>> 8) & 0xFF
        };

        // Decrypt Misc for Ability and IVs
        const miscOffset = dataOffset + miscIndex * SUBSTRUCTURE_SIZE;
        const decM2 = (pcView.getUint32(miscOffset + 4, true) ^ key) >>> 0;
        const ivs = {
          hp: decM2 & 0x1F,
          attack: (decM2 >>> 5) & 0x1F,
          defense: (decM2 >>> 10) & 0x1F,
          speed: (decM2 >>> 15) & 0x1F,
          spAttack: (decM2 >>> 20) & 0x1F,
          spDefense: (decM2 >>> 25) & 0x1F
        };
        const abilityBit = (decM2 >>> 31) & 1;
        
        boxes[box].push({
          pid, otid, speciesId, nickname, abilityBit, moves, experience, nature, evs, ivs
        });
      }
    }
    
    return boxes;
  }
}



