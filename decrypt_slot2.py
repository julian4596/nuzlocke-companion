import struct
import codecs
import sys
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = f.read()

class PRNG:
    def __init__(self, seed):
        self.seed = seed
    def next(self):
        self.seed = (self.seed * 0x41C64E6D + 0x6073) & 0xFFFFFFFF
        return (self.seed >> 16) & 0xFFFF

# Active Slot is 0x24000, Party Block is 0x18E00, Pokemon start at 0x18E08
party_offset = 0x24000 + 0x18E00 + 8

def decrypt_pkm(offset):
    pkm = bytearray(data[offset:offset+220])
    pid = struct.unpack('<I', pkm[0:4])[0]
    stored_chk = struct.unpack('<H', pkm[6:8])[0]
    
    if pid == 0:
        return None
        
    prng = PRNG(stored_chk)
    for i in range(8, 136, 2):
        val = struct.unpack('<H', pkm[i:i+2])[0]
        val = (val ^ prng.next()) & 0xFFFF
        struct.pack_into('<H', pkm, i, val)
        
    shift = ((pid & 0x3E000) >> 13) % 24
    
    # We can just read species from block A, assuming block A is at 0x08
    # Actually, we should just unshuffle it.
    permutations = [
      [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1],
      [0, 3, 1, 2], [0, 3, 2, 1], [1, 0, 2, 3], [1, 0, 3, 2],
      [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0],
      [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0],
      [2, 3, 0, 1], [2, 3, 1, 0], [3, 0, 1, 2], [3, 0, 2, 1],
      [3, 1, 0, 2], [3, 1, 2, 0], [3, 2, 0, 1], [3, 2, 1, 0]
    ]
    order = permutations[shift]
    
    unshuffled = bytearray(128)
    for i in range(4):
        src = i * 32
        dst = order[i] * 32
        unshuffled[dst:dst+32] = pkm[8+src:8+src+32]
        
    species = struct.unpack('<H', unshuffled[0:2])[0]
    
    # Nickname
    nick = ''
    for i in range(11):
        char = struct.unpack('<H', unshuffled[0x40 + i*2 : 0x40 + i*2 + 2])[0]
        if char == 0xFFFF or char == 0x0000: break
        if 0x20 <= char <= 0x7E or 0x4E00 <= char <= 0x9FFF or 0x3040 <= char <= 0x309F or 0x30A0 <= char <= 0x30FF:
            nick += chr(char)
        else:
            nick += '?'
            
    return species, nick

for i in range(6):
    res = decrypt_pkm(party_offset + i*220)
    if res:
        print(f"Slot {i}: Species {res[0]}, Nickname: {res[1]}")
    else:
        print(f"Slot {i}: Empty")
