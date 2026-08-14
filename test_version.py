with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = f.read()

print('0x00000:', data[0:16].hex())
print('0x24000:', data[0x24000:0x24010].hex())
print('0x26000:', data[0x26000:0x26010].hex())
