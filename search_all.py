import struct
import sys

def search_valid_pokemon(filename):
    with open(filename, 'rb') as f:
        data = f.read()

    valid_offsets = []
    file_size = len(data)
    
    for offset in range(0, file_size - 136, 4):
        pid = struct.unpack_from('<I', data, offset)[0]
        if pid == 0:
            continue
            
        expected_checksum = struct.unpack_from('<H', data, offset + 6)[0]
        
        # PRNG initialization
        seed = expected_checksum
        
        decrypted_data = bytearray(128)
        
        # Decrypt
        for i in range(0, 128, 2):
            # LCRNG
            seed = (seed * 0x41C64E6D + 0x6073) & 0xFFFFFFFF
            prng_word = seed >> 16
            
            encrypted_word = struct.unpack_from('<H', data, offset + 8 + i)[0]
            decrypted_word = encrypted_word ^ prng_word
            
            struct.pack_into('<H', decrypted_data, i, decrypted_word)
            
        # Validate checksum
        actual_checksum = sum(struct.unpack('<64H', decrypted_data)) & 0xFFFF
        
        if actual_checksum == expected_checksum:
            valid_offsets.append((offset, pid))
            
    return valid_offsets

offsets = search_valid_pokemon('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav')
print(f"Found {len(offsets)} valid Pokemon data structures in entire file.")

# Group offsets by general regions
regions = {}
for offset, pid in offsets:
    region = offset // 0x1000 * 0x1000
    if region not in regions:
        regions[region] = []
    regions[region].append(offset)

for region, region_offsets in sorted(regions.items()):
    print(f"Region 0x{region:05X}: {len(region_offsets)} valid pokemon (First offset: 0x{region_offsets[0]:05X})")
