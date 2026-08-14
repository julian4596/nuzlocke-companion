import struct

with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = f.read()

def get_checksum(pkm_data):
    chk = 0
    for i in range(8, 136, 2):
        chk = (chk + struct.unpack('<H', pkm_data[i:i+2])[0]) & 0xFFFF
    return chk

for offset in range(0, len(data) - 136, 2):
    pkm_data = data[offset:offset+136]
    stored_chk = struct.unpack('<H', pkm_data[6:8])[0]
    calc_chk = get_checksum(pkm_data)
    if stored_chk == calc_chk and calc_chk != 0 and stored_chk != 0:
        pid = struct.unpack('<I', pkm_data[0:4])[0]
        if pid != 0:
            print(f"Valid Pokemon found at 0x{offset:X} with PID 0x{pid:X}")
