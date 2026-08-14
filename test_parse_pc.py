import struct
with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = bytearray(f.read())

activeSlot = 0
boxesStart = activeSlot + 0x400

validPokemon = 0
for box in range(24):
    for slot in range(30):
        offset = boxesStart + (box * 30 * 136) + (slot * 136)
        
        # Check if the slot is completely empty (all 0s)
        if all(x == 0 for x in data[offset:offset+136]):
            continue
            
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
            
        if actualChecksum == expectedChecksum:
            validPokemon += 1
        else:
            print(f'Box {box} Slot {slot} invalid checksum!')

print('validPokemon in PC:', validPokemon)
