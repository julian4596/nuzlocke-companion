import unittest
import os
import json
from scripts.parse_trainers import parse_trainers

class TestParseTrainers(unittest.TestCase):
    def test_parse_trainers_returns_grouped_data(self):
        output_file = 'src/data/trainers.json'
        # Call parse function
        result = parse_trainers()
        
        # Verify result structure
        self.assertIn('FRLG Venusaur', result)
        frlg_data = result['FRLG Venusaur']
        self.assertIsInstance(frlg_data, list)
        self.assertEqual(len(frlg_data), 10)
        
        # Check first cap (Brock)
        brock_group = frlg_data[0]
        self.assertEqual(brock_group['cap'], 'Brock')
        self.assertEqual(brock_group['level'], '14')
        self.assertGreater(len(brock_group['trainers']), 0)
        
        # Check a trainer in Brock group
        first_trainer = brock_group['trainers'][0]
        self.assertIn('name', first_trainer)
        self.assertIn('route', first_trainer)
        self.assertIn('location', first_trainer)
        self.assertIn('money', first_trainer)
        self.assertIn('team', first_trainer)
        
        # Check pokemon stats in team
        first_pokemon = first_trainer['team'][0]
        self.assertIn('species', first_pokemon)
        self.assertIn('level', first_pokemon)
        self.assertIn('moves', first_pokemon)
        self.assertIn('hp', first_pokemon)
        self.assertIn('atk', first_pokemon)
        self.assertIn('def', first_pokemon)
        self.assertIn('spa', first_pokemon)
        self.assertIn('spd', first_pokemon)
        self.assertIn('spe', first_pokemon)
        
        # Verify file updated
        self.assertTrue(os.path.exists(output_file))
        with open(output_file, 'r', encoding='utf-8') as f:
            data_on_disk = json.load(f)
        self.assertIn('FRLG Venusaur', data_on_disk)
        self.assertEqual(len(data_on_disk['FRLG Venusaur']), 10)

if __name__ == '__main__':
    unittest.main()
