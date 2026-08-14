import struct

with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = f.read()

# Let's assume the Pokemon starts at 0x18E10
pkm = bytearray(data[0x18E10:0x18E10+220])
pid = struct.unpack('<I', pkm[0:4])[0]
chk = struct.unpack('<H', pkm[6:8])[0]

print(f"PID: {pid:08X}")
print(f"CHK: {chk:04X}")

# Gen 5 PRNG
class PRNG:
    def __init__(self, seed):
        self.seed = seed
    def next(self):
        self.seed = (self.seed * 0x41C64E6D + 0x6073) & 0xFFFFFFFF
        return (self.seed >> 16) & 0xFFFF

prng = PRNG(chk)

# Decrypt blocks A,B,C,D (bytes 8 to 136)
for i in range(8, 136, 2):
    val = struct.unpack('<H', pkm[i:i+2])[0]
    val = (val ^ prng.next()) & 0xFFFF
    struct.pack_into('<H', pkm, i, val)

# Unshuffle
shift = ((pid & 0x3E000) >> 13) % 24
print(f"Shift value: {shift}")

# We don't even need to unshuffle to see species. Species is the first 2 bytes of Block A!
# Let's just find Block A.
# The shift table defines which block is Block A.
# 0: ABCD -> Block A is at offset 8
# ... Let's just print all 4 blocks first 2 bytes to see if one is a valid species!
block0 = struct.unpack('<H', pkm[8:10])[0]
block1 = struct.unpack('<H', pkm[8+32:8+34])[0]
block2 = struct.unpack('<H', pkm[8+64:8+66])[0]
block3 = struct.unpack('<H', pkm[8+96:8+98])[0]

print(f"Block 0 (Species?): {block0}")
print(f"Block 1 (Species?): {block1}")
print(f"Block 2 (Species?): {block2}")
print(f"Block 3 (Species?): {block3}")

