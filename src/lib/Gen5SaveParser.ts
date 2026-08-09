import { BaseSaveParser } from './BaseSaveParser';
import { SaveData, Pokemon } from './types';

const PERMUTATIONS = [
  [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1],
  [0, 3, 1, 2], [0, 3, 2, 1], [1, 0, 2, 3], [1, 0, 3, 2],
  [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0],
  [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0],
  [2, 3, 0, 1], [2, 3, 1, 0], [3, 0, 1, 2], [3, 0, 2, 1],
  [3, 1, 0, 2], [3, 1, 2, 0], [3, 2, 0, 1], [3, 2, 1, 0]
];

export class Gen5SaveParser extends BaseSaveParser {
  private getActiveSaveSlot(buffer: ArrayBuffer): number {
    const view = new DataView(buffer);
    // Gen 5 save index is typically at 0x23FFC for Block 1, and 0x47FFC for Block 2.
    // If not, we fall back to checking if block 1 seems empty.
    const index1 = view.getUint32(0x23FFC, true);
    const index2 = view.getUint32(0x24000 + 0x23FFC, true);
    
    if (index1 === 0xFFFFFFFF && index2 !== 0xFFFFFFFF) return 0x24000;
    if (index2 === 0xFFFFFFFF && index1 !== 0xFFFFFFFF) return 0x0;
    
    return index2 > index1 ? 0x24000 : 0x0;
  }

  private detectGameVersion(buffer: ArrayBuffer): string {
    const activeSlot = this.getActiveSaveSlot(buffer);
    const view = new DataView(buffer);
    
    const countB2W2 = view.getUint32(activeSlot + 0x18E00, true);
    const countBW = view.getUint32(activeSlot + 0x18E08, true);
    
    const validB2W2 = countB2W2 >= 1 && countB2W2 <= 6;
    const validBW = countBW >= 1 && countBW <= 6;

    if (validB2W2 && !validBW) return 'Black 2/White 2';
    if (validBW && !validB2W2) return 'Black/White';
    
    // Tiebreaker: Validate Trainer Name string (B2W2 vs BW offsets)
    // A valid trainer name usually has alphanumeric characters.
    const nameB2W2 = this.decodeString(buffer, activeSlot + 0x19400, 8);
    
    // If the B2W2 string contains valid ASCII and is null-terminated properly
    if (nameB2W2.length > 0 && nameB2W2.length <= 8 && /^[\x20-\x7E]+$/.test(nameB2W2)) {
        return 'Black 2/White 2';
    }
    
    return 'Black/White';
  }

  private decodeString(buffer: ArrayBuffer, offset: number, maxLength: number): string {
    const view = new DataView(buffer);
    let result = '';
    for (let i = 0; i < maxLength; i++) {
      const charCode = view.getUint16(offset + i * 2, true);
      if (charCode === 0xFFFF || charCode === 0x0000) break;
      result += String.fromCharCode(charCode);
    }
    return result;
  }

  private decryptPokemon(buffer: ArrayBuffer, offset: number, isParty: boolean): Pokemon | null {
    const view = new DataView(buffer);
    const pid = view.getUint32(offset, true);
    
    if (pid === 0) return null; // Empty slot
    
    // Checksum used as initial seed
    let seed = view.getUint16(offset + 6, true);
    
    // 128 bytes of encrypted data from 0x08 to 0x87
    const decryptedData = new Uint8Array(128);
    const decView = new DataView(decryptedData.buffer);
    
    for (let i = 0; i < 128; i += 2) {
      seed = (Math.imul(seed, 0x41C64E6D) + 0x6073) >>> 0;
      const prngWord = seed >>> 16;
      const encryptedWord = view.getUint16(offset + 8 + i, true);
      const decryptedWord = encryptedWord ^ prngWord;
      decView.setUint16(i, decryptedWord, true);
    }
    
    const shiftIndex = ((pid & 0x3E000) >>> 13) % 24;
    const blockOrder = PERMUTATIONS[shiftIndex];
    
    const unshuffledData = new Uint8Array(128);
    for (let i = 0; i < 4; i++) {
      const srcOffset = i * 32;
      const destOffset = blockOrder[i] * 32;
      unshuffledData.set(decryptedData.subarray(srcOffset, srcOffset + 32), destOffset);
    }
    const unView = new DataView(unshuffledData.buffer);
    
    // Block A (offset 0x00 in unshuffledData)
    const speciesId = unView.getUint16(0x00, true); // 0x08 in save = 0x00 in block A
    const otid = unView.getUint16(0x04, true);      // 0x0C in save = 0x04 in block A
    const otsid = unView.getUint16(0x06, true);     // 0x0E in save = 0x06 in block A
    
    // Block B (offset 0x20 in unshuffledData)
    const moves = [
      unView.getUint16(0x20 + 0, true), // 0x28 in save = 0x20 in block B
      unView.getUint16(0x20 + 2, true),
      unView.getUint16(0x20 + 4, true),
      unView.getUint16(0x20 + 6, true)
    ];
    
    // Block C (offset 0x40 in unshuffledData)
    const nickname = this.decodeString(unshuffledData.buffer, 0x40, 11);
    
    let level = 0;
    if (isParty) {
      // Party Stats at 0x8C (relative to start of pokemon, not block A)
      level = view.getUint8(offset + 0x8C);
    }
    
    const isShiny = (otid ^ otsid ^ (pid & 0xFFFF) ^ (pid >>> 16)) < 8;
    
    return {
      pid,
      otid,
      speciesId,
      nickname,
      moves,
      level,
      isShiny,
      // Not mapping everything, but this fulfills the current spec
    } as Pokemon & { isShiny?: boolean };
  }

  parse(buffer: ArrayBuffer): SaveData {
    const activeSlot = this.getActiveSaveSlot(buffer);
    const version = this.detectGameVersion(buffer);
    
    const trainerOffset = version === 'Black/White' ? 0x19404 : 0x19400;
    const trainerName = this.decodeString(buffer, activeSlot + trainerOffset, 8);
    
    return { trainerName, gameVersion: version };
  }

  parseTeam(buffer: ArrayBuffer): Pokemon[] {
    const activeSlot = this.getActiveSaveSlot(buffer);
    const version = this.detectGameVersion(buffer);
    
    const partyOffset = version === 'Black/White' ? 0x18E08 : 0x18E00;
    const view = new DataView(buffer);
    
    const partyCount = view.getUint32(activeSlot + partyOffset, true);
    const team: Pokemon[] = [];
    
    // Pokemon data starts 4 bytes after the count
    const dataStart = activeSlot + partyOffset + 4;
    for (let i = 0; i < partyCount && i < 6; i++) {
      const pkmnOffset = dataStart + i * 220; // Party pokemon are 220 bytes
      const pkmn = this.decryptPokemon(buffer, pkmnOffset, true);
      if (pkmn) {
        team.push(pkmn);
      }
    }
    
    return team;
  }

  parseBoxes(buffer: ArrayBuffer): Pokemon[][] {
    const activeSlot = this.getActiveSaveSlot(buffer);
    const boxes: Pokemon[][] = Array.from({ length: 24 }, () => []);
    
    // PC boxes start at 0x400
    const boxesStart = activeSlot + 0x400;
    
    for (let box = 0; box < 24; box++) {
      for (let slot = 0; slot < 30; slot++) {
        const pkmnOffset = boxesStart + box * 30 * 136 + slot * 136;
        const pkmn = this.decryptPokemon(buffer, pkmnOffset, false);
        if (pkmn) {
          boxes[box].push(pkmn);
        }
      }
    }
    
    return boxes;
  }
}
