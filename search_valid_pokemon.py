import struct

with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = f.read()

class PRNG:
    def __init__(self, seed):
        self.seed = seed
    def next(self):
        self.seed = (self.seed * 0x41C64E6D + 0x6073) & 0xFFFFFFFF
        return (self.seed >> 16) & 0xFFFF

def get_checksum(pkm_data):
    chk = 0
    for i in range(8, 136, 2):
        chk = (chk + struct.unpack('<H', pkm_data[i:i+2])[0]) & 0xFFFF
    return chk

for offset in range(0, len(data) - 136, 2):
    pkm = bytearray(data[offset:offset+136])
    pid = struct.unpack('<I', pkm[0:4])[0]
    stored_chk = struct.unpack('<H', pkm[6:8])[0]
    
    # Decrypt
    prng = PRNG(stored_chk)
    for i in range(8, 136, 2):
        val = struct.unpack('<H', pkm[i:i+2])[0]
        val = (val ^ prng.next()) & 0xFFFF
        struct.pack_into('<H', pkm, i, val)
        
    calc_chk = get_checksum(pkm)
    
    if stored_chk == calc_chk and calc_chk != 0 and stored_chk != 0:
        if pid != 0:
            print(f"Valid Pokemon found at 0x{offset:X} with PID 0x{pid:08X}")
