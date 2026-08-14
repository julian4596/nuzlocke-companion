import fs from 'fs';

const buffer = fs.readFileSync('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav');
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);

console.log('File size:', buffer.length);

const countB2W2 = view.getUint32(0x0 + 0x18E00, true);
const countBW = view.getUint32(0x0 + 0x18E08, true);

console.log('countB2W2 at 0x18E00:', countB2W2);
console.log('countBW at 0x18E08:', countBW);

const pidB2W2 = view.getUint32(0x0 + 0x18E04, true);
const pidBW = view.getUint32(0x0 + 0x18E0C, true);

console.log('pidB2W2 at 0x18E04:', pidB2W2);
console.log('pidBW at 0x18E0C:', pidBW);

const validB2W2 = countB2W2 >= 1 && countB2W2 <= 6;
const validBW = countBW >= 1 && countBW <= 6;

const strongB2W2 = validB2W2 && pidB2W2 !== 0;
const strongBW = validBW && pidBW !== 0;

console.log('strongB2W2:', strongB2W2);
console.log('strongBW:', strongBW);

// Look at the indices
const indexBW1 = view.getUint32(0x23FFC, true);
const indexBW2 = view.getUint32(0x24000 + 0x23FFC, true);
console.log('BW indices (0x23FFC, 0x47FFC):', indexBW1, indexBW2);

const indexB2W21 = view.getUint32(0x25FFC, true);
const indexB2W22 = view.getUint32(0x26000 + 0x25FFC, true);
console.log('B2W2 indices (0x25FFC, 0x4BFFC):', indexB2W21, indexB2W22);

// Check Trainer Name BW
let nameBW = '';
for (let i = 0; i < 8; i++) {
  const code = view.getUint16(0x0 + 0x19404 + i * 2, true);
  if (code === 0xFFFF) break;
  nameBW += String.fromCharCode(code);
}
console.log('nameBW (0x19404):', nameBW);

// Check Trainer Name B2W2
let nameB2W2 = '';
for (let i = 0; i < 8; i++) {
  const code = view.getUint16(0x0 + 0x19400 + i * 2, true);
  if (code === 0xFFFF) break;
  nameB2W2 += String.fromCharCode(code);
}
console.log('nameB2W2 (0x19400):', nameB2W2);
