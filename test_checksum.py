import struct

with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = f.read()

def get_checksum(pkm_data):
    chk = 0
    for i in range(8, 136, 2):
        chk = (chk + struct.unpack('<H', pkm_data[i:i+2])[0]) & 0xFFFF
    return chk

# Test offset 0x18E08
pkm1 = data[0x18E08:0x18E08+220]
print(f"Offset 0x18E08 Checksum in file: {struct.unpack('<H', pkm1[6:8])[0]:04X}")
print(f"Offset 0x18E08 Calculated: {get_checksum(pkm1):04X}")

# Test offset 0x18E10
pkm2 = data[0x18E10:0x18E10+220]
print(f"Offset 0x18E10 Checksum in file: {struct.unpack('<H', pkm2[6:8])[0]:04X}")
print(f"Offset 0x18E10 Calculated: {get_checksum(pkm2):04X}")

