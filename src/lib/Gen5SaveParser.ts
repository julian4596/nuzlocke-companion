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
  private detectGameVersion(buffer: ArrayBuffer): 'Black/White' | 'Black 2/White 2' {
    const view = new DataView(buffer);
    
    // Check block indices
    const indexBW1 = view.getUint32(0x23FFC, true);
    const indexBW2 = view.getUint32(0x24000 + 0x23FFC, true);
    const indexB2W2_1 = view.getUint32(0x25FFC, true);
    const indexB2W2_2 = view.getUint32(0x26000 + 0x25FFC, true);

    const hasBWIndex = indexBW1 !== 0xFFFFFFFF || indexBW2 !== 0xFFFFFFFF;
    const hasB2W2Index = indexB2W2_1 !== 0xFFFFFFFF || indexB2W2_2 !== 0xFFFFFFFF;

    if (hasB2W2Index && !hasBWIndex) return 'Black 2/White 2';
    if (hasBWIndex && !hasB2W2Index) return 'Black/White';
    
    // If ambiguous, default to BW
    return 'Black/White';
  }

  private getActiveSaveSlot(buffer: ArrayBuffer, version: string): number {
    const view = new DataView(buffer);
    const blockSize = version === 'Black 2/White 2' ? 0x26000 : 0x24000;
    const indexOffset = blockSize - 4;
    
    const index1 = view.getUint32(indexOffset, true);
    const index2 = view.getUint32(blockSize + indexOffset, true);
    
    if (index1 === 0xFFFFFFFF && index2 !== 0xFFFFFFFF) return blockSize;
    if (index2 === 0xFFFFFFFF && index1 !== 0xFFFFFFFF) return 0x0;
    
    return index2 > index1 ? blockSize : 0x0;
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
    
    // Verify checksum
    const expectedChecksum = view.getUint16(offset + 6, true);
    let actualChecksum = 0;
    for (let i = 0; i < 128; i += 2) {
      actualChecksum = (actualChecksum + decView.getUint16(i, true)) & 0xFFFF;
    }
    if (actualChecksum !== expectedChecksum) {
      return null; // Invalid checksum, probably empty/corrupt slot
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
    
    const iv32 = unView.getUint32(0x30, true);
    const ivs = {
      hp: (iv32 >> 0) & 0x1F,
      attack: (iv32 >> 5) & 0x1F,
      defense: (iv32 >> 10) & 0x1F,
      speed: (iv32 >> 15) & 0x1F,
      spAttack: (iv32 >> 20) & 0x1F,
      spDefense: (iv32 >> 25) & 0x1F,
    };
    
    // Block C (offset 0x40 in unshuffledData)
    const nickname = this.decodeString(unshuffledData.buffer, 0x40, 11);
    
    let level = 0;
    let hp, maxHp, attack, defense, speed, spAttack, spDefense;
    
    if (isParty) {
      const partyData = new Uint8Array(84);
      const partyView = new DataView(partyData.buffer);
      let partySeed = pid;
      
      for (let i = 0; i < 84; i += 2) {
        partySeed = (Math.imul(partySeed, 0x41C64E6D) + 0x6073) >>> 0;
        const prngWord = partySeed >>> 16;
        const encryptedWord = view.getUint16(offset + 136 + i, true);
        const decryptedWord = encryptedWord ^ prngWord;
        partyView.setUint16(i, decryptedWord, true);
      }
      
      level = partyView.getUint8(4); // 140 - 136 = 4
      hp = partyView.getUint16(6, true);
      maxHp = partyView.getUint16(8, true);
      attack = partyView.getUint16(10, true);
      defense = partyView.getUint16(12, true);
      speed = partyView.getUint16(14, true);
      spAttack = partyView.getUint16(16, true);
      spDefense = partyView.getUint16(18, true);
    }
    
    const isShiny = (otid ^ otsid ^ (pid & 0xFFFF) ^ (pid >>> 16)) < 8;
    const abilityId = unView.getUint8(0x0D);
    
    return {
      pid,
      otid,
      speciesId,
      nickname,
      moves,
      level,
      hp,
      maxHp,
      attack,
      defense,
      speed,
      spAttack,
      spDefense,
      isShiny,
      abilityId,
      ivs,
      // Not mapping everything, but this fulfills the current spec
    } as Pokemon & { isShiny?: boolean };
  }

  parse(buffer: ArrayBuffer): SaveData {
    const version = this.detectGameVersion(buffer);
    const activeSlot = this.getActiveSaveSlot(buffer, version);
    
    // Trainer Name offset is at 0x19404
    const trainerOffset = 0x19404;
    const trainerName = this.decodeString(buffer, activeSlot + trainerOffset, 8);
    
    return { trainerName, gameVersion: version };
  }

  parseTeam(buffer: ArrayBuffer): Pokemon[] {
    const version = this.detectGameVersion(buffer);
    const activeSlot = this.getActiveSaveSlot(buffer, version);
    
    const view = new DataView(buffer);
    
    // Party Count is a single byte at 0x18E04 for both games
    const partyCount = view.getUint8(activeSlot + 0x18E04);
    const team: Pokemon[] = [];
    
    // Pokemon data starts at 0x18E08 for both games
    const dataStart = activeSlot + 0x18E08;
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
    const version = this.detectGameVersion(buffer);
    const activeSlot = this.getActiveSaveSlot(buffer, version);
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
