import struct

def search_valid_pokemon(filename):
    with open(filename, 'rb') as f:
        data = f.read()

    # We will search the first 0x24000 bytes (Block 1) for anything that looks like a valid Gen 5 Pokemon.
    # A valid Gen 5 Pokemon is 136 bytes.
    # At offset 0: PID (uint32)
    # At offset 4: unknown (uint16)
    # At offset 6: Checksum (uint16)
    # At offset 8..135: Encrypted data
    
    # We can just iterate through every 4-byte offset in the first 0x24000 bytes
    # and try to validate the checksum.
    
    valid_offsets = []
    
    for offset in range(0, 0x24000 - 136, 4):
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
print(f"Found {len(offsets)} valid Pokemon data structures.")
for offset, pid in offsets[:20]:
    print(f"Valid Pokemon at offset 0x{offset:X} with PID {pid}")
if len(offsets) > 20:
    print("...")

# Let's also check Block 2
def search_valid_pokemon_block2(filename):
    with open(filename, 'rb') as f:
        data = f.read()

    valid_offsets = []
    
    for offset in range(0x24000, 0x48000 - 136, 4):
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

offsets2 = search_valid_pokemon_block2('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav')
print(f"Found {len(offsets2)} valid Pokemon data structures in Block 2.")
for offset, pid in offsets2[:20]:
    print(f"Valid Pokemon at offset 0x{offset:X} with PID {pid}")
