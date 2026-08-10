import { BaseSaveParser } from './BaseSaveParser';
import { GBASaveParser } from './GBASaveParser';
import { Gen5SaveParser } from './Gen5SaveParser';

export class SaveManager {
  static getParser(buffer: ArrayBuffer): BaseSaveParser {
    // NDS saves are typically 512KB (524288 bytes) or larger (e.g. 1MB or .dsv with footer)
    // GBA saves are strictly <= 128KB
    if (buffer.byteLength >= 524288) {
       return new Gen5SaveParser();
    }
    
    // Default to GBA parser for smaller saves
    return new GBASaveParser();
  }
}
