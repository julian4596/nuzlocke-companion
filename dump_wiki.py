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

def main():
    gen3_wiki = fetch_wikitext("List_of_locations_by_index_number_in_Generation_III")
    
    with open('gen3.txt', 'w', encoding='utf-8') as f:
        f.write(gen3_wiki)

if __name__ == '__main__':
    main()
