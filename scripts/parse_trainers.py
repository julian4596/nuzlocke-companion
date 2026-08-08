import json
import os

def parse_trainers(md_path='docs/trainers_data.md', caps_path='src/data/levelCaps.json', output_path='src/data/trainers.json'):
    # Load level caps
    with open(caps_path, 'r', encoding='utf-8') as f:
        caps_data = json.load(f)

    frlg_caps = None
    for item in caps_data:
        if item['game'] in ['Pokemon Fire Red/Leaf Green', 'Pokemon FireRed/LeafGreen', 'Pokemon FireRed/Leaf Green']:
            frlg_caps = item['caps']
            break

    if not frlg_caps:
        raise ValueError("Could not find FireRed/LeafGreen level caps in levelCaps.json")

    # Read trainers_data.md
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    start_idx = -1
    end_idx = len(lines)
    for i, line in enumerate(lines):
        if line.startswith('## FRLG Venusaur'):
            start_idx = i
        elif line.startswith('## ') and start_idx != -1 and i > start_idx:
            end_idx = i
            break

    if start_idx == -1:
        raise ValueError("Could not find '## FRLG Venusaur' section in markdown file")

    section_lines = lines[start_idx:end_idx]

    trainers = []
    curr_trainer = None

    for line in section_lines:
        line_str = line.strip()
        if not line_str or line_str.startswith('##') or line_str.startswith('| ---') or 'Opponent' in line_str:
            continue
        
        parts = [p.strip() for p in line_str.split('|')[1:-1]]
        if len(parts) < 17:
            continue
        
        opp, money, route, loc, pokemon, level, a1, a2, a3, a4, exp, hp, atk, df, spa, spd, spe = parts[:17]
        
        if opp:
            if curr_trainer and len(curr_trainer['team']) > 0:
                trainers.append(curr_trainer)
            curr_trainer = {
                'name': opp,
                'money': money,
                'route': route,
                'location': loc,
                'team': []
            }
        
        if pokemon and curr_trainer:
            moves = [m for m in [a1, a2, a3, a4] if m]
            curr_trainer['team'].append({
                'species': pokemon,
                'level': level,
                'moves': moves,
                'hp': hp,
                'atk': atk,
                'def': df,
                'spa': spa,
                'spd': spd,
                'spe': spe
            })

    if curr_trainer and len(curr_trainer['team']) > 0:
        trainers.append(curr_trainer)

    # Group trainers into level caps
    groups = []
    for c in frlg_caps:
        groups.append({
            'cap': c['name'],
            'level': c['level'],
            'trainers': []
        })

    transition_bosses = [
        'Leader Brock',
        'Leader Misty',
        'Leader Surge',
        'Leader Erika',
        'Leader Koga',
        'Leader Blaine',
        'Leader Giovanni',
        'Champ 1(Bulbasaur)',
        'Gideon'
    ]

    current_cap_idx = 0
    for t in trainers:
        groups[current_cap_idx]['trainers'].append(t)
        
        if current_cap_idx < len(groups) - 1 and current_cap_idx < len(transition_bosses):
            boss_trigger = transition_bosses[current_cap_idx]
            if t['name'] == boss_trigger:
                current_cap_idx += 1

    # Load existing trainers.json if present
    data = {}
    if os.path.exists(output_path):
        with open(output_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

    data['FRLG Venusaur'] = groups

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    return data

if __name__ == '__main__':
    parse_trainers()
