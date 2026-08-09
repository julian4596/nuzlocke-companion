import { SaveData, Pokemon } from './types';

export abstract class BaseSaveParser {
  abstract parse(buffer: ArrayBuffer): SaveData;
  abstract parseTeam(buffer: ArrayBuffer): Pokemon[];
  abstract parseBoxes(buffer: ArrayBuffer): Pokemon[][];
}
