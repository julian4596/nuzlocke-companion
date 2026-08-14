import string
with open('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav', 'rb') as f:
    data = f.read()

def decode_gen5_string(data):
    s = ''
    for i in range(0, len(data), 2):
        if i + 1 >= len(data): break
        code = data[i] | (data[i+1] << 8)
        if code == 0xFFFF: break
        if 0x20 <= code <= 0x7E:
            s += chr(code)
        else:
            return "" # if any invalid char, discard
    return s

with open('strings.txt', 'w') as out:
    for offset in range(0, len(data) - 16, 2):
        s = decode_gen5_string(data[offset:offset+16])
        if len(s) >= 5:
            out.write(f'Found string "{s}" at 0x{offset:X}\n')
