const fs = require('fs');

const data = fs.readFileSync('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav');
const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

const indexBW1 = view.getUint32(0x23FFC, true);
const indexBW2 = view.getUint32(0x24000 + 0x23FFC, true);
const indexB2W2_1 = view.getUint32(0x25FFC, true);
const indexB2W2_2 = view.getUint32(0x26000 + 0x25FFC, true);

console.log('BW1:', indexBW1);
console.log('BW2:', indexBW2);
console.log('B2W2_1:', indexB2W2_1);
console.log('B2W2_2:', indexB2W2_2);
