import json
import zipfile
import xml.etree.ElementTree as ET

def get_docx_text(path):
    z = zipfile.ZipFile(path)
    xml_content = z.read('word/document.xml')
    root = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    text = '\n'.join([node.text for node in root.findall('.//w:t', ns) if node.text])
    return text

data = get_docx_text('docs/Pokemon Level Caps.docx')

result = []
current_game = None
for line in data.split('\n'):
    line = line.strip()
    if not line:
        continue
    if '-' in line or ':' in line:
        if '-' in line:
            parts = line.split('-', 1)
        else:
            parts = line.split(':', 1)
        name = parts[0].strip()
        lvl = parts[1].strip()
        if 'Lv.' in lvl or 'Lv' in lvl:
            lvl = lvl.replace('Lv.', '').replace('Lv', '').strip()
        if current_game:
            result[-1]['caps'].append({'name': name, 'level': lvl})
    else:
        # It's a game title or a subtitle
        if line.startswith('Levels are formatted') or line.startswith('Easy') or line.startswith('You can choose'):
            continue
        current_game = line
        result.append({'game': current_game, 'caps': []})

with open('src/data/levelCaps.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2)
