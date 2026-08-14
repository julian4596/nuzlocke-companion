import struct
with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = bytearray(f.read())

activeSlot = 0

partyCount = data[activeSlot + 0x18E04]
print('partyCount:', partyCount)

validPokemon = 0
for i in range(partyCount):
    offset = activeSlot + 0x18E08 + (i * 220)
    expectedChecksum = struct.unpack('<H', data[offset+6:offset+8])[0]
    
    prngSeed = expectedChecksum
    decryptedData = bytearray(128)
    
    for j in range(0, 128, 2):
        prngSeed = (prngSeed * 0x41C64E6D + 0x6073) & 0xFFFFFFFF
        prngWord = prngSeed >> 16
        encryptedWord = struct.unpack('<H', data[offset+8+j:offset+8+j+2])[0]
        decryptedWord = encryptedWord ^ prngWord
        struct.pack_into('<H', decryptedData, j, decryptedWord)
        
    actualChecksum = 0
    for j in range(0, 128, 2):
        actualChecksum = (actualChecksum + struct.unpack('<H', decryptedData[j:j+2])[0]) & 0xFFFF
        
    print(f'Slot {i} checksum: actual={actualChecksum} expected={expectedChecksum}')
    if actualChecksum == expectedChecksum:
        validPokemon += 1
        
print('validPokemon:', validPokemon)
