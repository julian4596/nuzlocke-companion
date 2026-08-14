const fs = require('fs');

const data = fs.readFileSync('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav');
const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

// simulate what Gen5SaveParser does
const view = new DataView(buffer);
const activeSlot = 0; // assuming 0

const partyCount = view.getUint8(activeSlot + 0x18E04);
console.log('partyCount:', partyCount);

let validPokemon = 0;
for(let i=0; i<partyCount; i++) {
    const offset = activeSlot + 0x18E08 + (i * 220);
    const expectedChecksum = view.getUint16(offset + 6, true);
    let actualChecksum = 0;
    
    let prngSeed = expectedChecksum;
    const decryptedData = new Uint8Array(128);
    const decView = new DataView(decryptedData.buffer);
    
    for (let j = 0; j < 128; j += 2) {
      prngSeed = (Math.imul(prngSeed, 0x41C64E6D) + 0x6073) >>> 0;
      const prngWord = prngSeed >>> 16;
      const encryptedWord = view.getUint16(offset + 8 + j, true);
      const decryptedWord = encryptedWord ^ prngWord;
      decView.setUint16(j, decryptedWord, true);
    }
    
    for (let j = 0; j < 128; j += 2) {
      actualChecksum = (actualChecksum + decView.getUint16(j, true)) & 0xFFFF;
    }
    
    console.log('Slot ' + i + ' checksum:', 'actual=' + actualChecksum, 'expected=' + expectedChecksum);
    if(actualChecksum === expectedChecksum) {
        validPokemon++;
    }
}
console.log('validPokemon:', validPokemon);
