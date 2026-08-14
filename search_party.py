with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = f.read()

for i in range(0, len(data) - 4, 4):
    if data[i:i+4] == b'\x06\x00\x00\x00':
        chunk = data[i:i+32]
        print(f'Found at 0x{i:X}: {" ".join(f"{b:02x}" for b in chunk)}')
