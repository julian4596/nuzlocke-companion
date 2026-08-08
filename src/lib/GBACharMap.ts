export function decodeGBAString(buffer: ArrayBuffer, offset: number, length: number): string {
  const view = new DataView(buffer);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const charCode = view.getUint8(offset + i);
    
    if (charCode === 0xFF) {
      break; // Terminator
    }
    
    if (charCode === 0x00) {
      result += ' ';
    } else if (charCode >= 0xAB && charCode <= 0xB4) {
      // Numbers '0' - '9'
      result += String.fromCharCode(charCode - 0xAB + 48);
    } else if (charCode >= 0xBB && charCode <= 0xD4) {
      // Uppercase 'A' - 'Z'
      result += String.fromCharCode(charCode - 0xBB + 65);
    } else if (charCode >= 0xD5 && charCode <= 0xEE) {
      // Lowercase 'a' - 'z'
      result += String.fromCharCode(charCode - 0xD5 + 97);
    } else if (charCode === 0xF0) {
      result += ':';
    } else if (charCode === 0xAD) { // Wait, 0xAD is actually a different char in some maps, but let's map common punctuation if needed
      result += '.';
    } else if (charCode === 0xAE) {
      result += '-';
    } else if (charCode === 0xB8) {
      result += ',';
    } else if (charCode === 0xBA) {
      result += '/';
    } else if (charCode === 0xB5) {
      result += '!';
    } else if (charCode === 0xB6) {
      result += '?';
    } else {
      // For any unmapped character, we just append a placeholder or try to map it
      // if it's outside our basic A-Z, a-z, 0-9 ranges.
      result += '?';
    }
  }
  
  return result;
}
