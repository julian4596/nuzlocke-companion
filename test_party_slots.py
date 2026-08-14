import struct

with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = f.read()

def get_checksum(pkm_data):
    chk = 0
    for i in range(8, 136, 2):
        chk = (chk + struct.unpack('<H', pkm_data[i:i+2])[0]) & 0xFFFF
    return chk

party_offset = 0x18E08

for slot in range(6):
    offset = party_offset + slot * 220
    pkm_data = data[offset:offset+220]
    pid = struct.unpack('<I', pkm_data[0:4])[0]
    stored_chk = struct.unpack('<H', pkm_data[6:8])[0]
    calc_chk = get_checksum(pkm_data)
    print(f"Slot {slot} (0x{offset:X}): PID={pid:08X}, StoredCHK={stored_chk:04X}, CalcCHK={calc_chk:04X}")
