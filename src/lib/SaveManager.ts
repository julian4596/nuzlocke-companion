import { BaseSaveParser } from './BaseSaveParser';
import { GBASaveParser } from './GBASaveParser';
// import { Gen5SaveParser } from './Gen5SaveParser'; // To be added in Task 4

export class SaveManager {
  static getParser(buffer: ArrayBuffer): BaseSaveParser {
    // 524288 bytes is exactly 512KB (Gen 5 NDS saves)
    if (buffer.byteLength === 524288) {
       throw new Error("Gen 5 parser not yet implemented");
    }
    
    // Default to GBA parser for everything else
    // GBASaveParser handles its own size validation
    return new GBASaveParser();
  }
}
