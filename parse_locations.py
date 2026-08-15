import urllib.request
import json
import re

def fetch_wikitext(title):
    url = f"https://bulbapedia.bulbagarden.net/w/api.php?action=query&prop=revisions&rvprop=content&titles={title}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        pages = data['query']['pages']
        for page_id in pages:
            return pages[page_id]['revisions'][0]['*']

def parse_wikitext(wikitext):
    locations = {}
    lines = wikitext.split('\n')
    
    for line in lines:
        line = line.strip()
        if line.startswith('|') and not line.startswith('|-') and not line.startswith('|}'):
            parts = [p.strip() for p in line.split('||')]
            if len(parts) > 0 and parts[0].startswith('|'):
                parts[0] = parts[0][1:].strip()
            
            if len(parts) >= 3:
                dec_val = -1
                if parts[0].isdigit():
                    dec_val = int(parts[0])
                elif parts[1].isdigit():
                    dec_val = int(parts[1])
                elif parts[0].startswith('0x'):
                    dec_val = int(parts[0], 16)
                elif parts[1].startswith('0x'):
                    dec_val = int(parts[1], 16)
                
                if dec_val != -1:
                    name_part = parts[2]
                    
                    name = name_part
                    rt_match = re.search(r'\{\{rt\|([^\|\}]+)', name, re.IGNORECASE)
                    if rt_match:
                        name = f"Route {rt_match.group(1)}"
                    else:
                        name = re.sub(r'\[\[([^\]\|]+)\|([^\]]+)\]\]', r'\2', name)
                        name = re.sub(r'\[\[([^\]]+)\]\]', r'\1', name)
                        name = re.sub(r'\{\{[^\}]+\}\}', '', name)
                    
                    name = re.sub(r'<[^>]+>', '', name)
                    name = name.replace("''", "").strip()
                    
                    if name and name != "—" and "Location" not in name:
                        locations[str(dec_val)] = name
    return locations

def main():
    gen3_wiki = fetch_wikitext("List_of_locations_by_index_number_in_Generation_III")
    gen5_wiki = fetch_wikitext("List_of_locations_by_index_number_in_Generation_V")
    
    gen3_data = parse_wikitext(gen3_wiki)
    gen5_data = parse_wikitext(gen5_wiki)
    
    out = {
        "Gen3": gen3_data,
        "Gen5": gen5_data
    }
    
    with open('src/data/locations.json', 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    main()
