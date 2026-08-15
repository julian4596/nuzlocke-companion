import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { Gen5SaveParser } from '../src/lib/Gen5SaveParser';

describe('Blaze Black Save Files Fixtures E2E Parser Tests', () => {
  const fixturesDir = path.resolve(__dirname, 'fixtures');
  const parser = new Gen5SaveParser();

  it('correctly parses Julian save (Pokemon Blaze Black v3.1 - Complete.sav)', () => {
    const file = 'Pokemon Blaze Black v3.1 - Complete.sav';
    const filePath = path.join(fixturesDir, file);
    const buffer = fs.readFileSync(filePath);
    const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const header = parser.parse(ab);
    expect(header.gameVersion).toBe('Black/White');
    expect(header.trainerName).toBe('JULIAN');

    const team = parser.parseTeam(ab);
    expect(team.length).toBe(6);
    expect(team[0].nickname).toBe('TEWOTT');
    expect(team[0].speciesId).toBe(498);
    expect(team[0].level).toBe(10);

    const boxes = parser.parseBoxes(ab);
    expect(boxes.length).toBe(24);
    
    // Box 1 has 1 Pokemon (Sentret)
    expect(boxes[0].length).toBe(1);
    const sentret = boxes[0][0];
    expect(sentret.speciesId).toBe(161);
    expect(sentret.nickname).toBe('Sentret');
    expect(sentret.experience).toBe(64);
    expect(sentret.nature).toBe(4); // Naughty
    expect(sentret.abilityId).toBe(51); // Keen Eye
    expect(sentret.ivs).toBeDefined();
    expect(sentret.evs).toBeDefined();
  });

  it('correctly parses Ricky 1 save (Pokemon Blaze Black v3.1 - Complete Ricky.sav)', () => {
    const file = 'Pokemon Blaze Black v3.1 - Complete Ricky.sav';
    const filePath = path.join(fixturesDir, file);
    const buffer = fs.readFileSync(filePath);
    const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const header = parser.parse(ab);
    expect(header.gameVersion).toBe('Black/White');
    expect(header.trainerName).toBe('RICKY');

    const team = parser.parseTeam(ab);
    expect(team.length).toBe(3);
    expect(team[0].nickname).toBe('PANPAN');
    expect(team[1].nickname).toBe('STARTRET');
    expect(team[2].nickname).toBe('PATO');

    const boxes = parser.parseBoxes(ab);
    expect(boxes.length).toBe(24);
    
    // Box 8 (index 7) has 1 dead Pokemon (TEWOTT)
    expect(boxes[7].length).toBe(1);
    const deadTewott = boxes[7][0];
    expect(deadTewott.speciesId).toBe(501);
    expect(deadTewott.nickname).toBe('TEWOTT');
    expect(deadTewott.experience).toBe(1312);
    expect(deadTewott.nature).toBe(5); // Bold
    expect(deadTewott.abilityId).toBe(72); // Torrent
  });

  it('correctly parses Ricky 2 save (Pokemon Blaze Black v3.1 - Complete Ricky 2.sav)', () => {
    const file = 'Pokemon Blaze Black v3.1 - Complete Ricky 2.sav';
    const filePath = path.join(fixturesDir, file);
    const buffer = fs.readFileSync(filePath);
    const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const header = parser.parse(ab);
    expect(header.gameVersion).toBe('Black/White');
    expect(header.trainerName).toBe('RICKY');

    const team = parser.parseTeam(ab);
    expect(team.length).toBe(3);
    expect(team[0].nickname).toBe('PANPAN');
    expect(team[1].nickname).toBe('STARTRET');
    expect(team[2].nickname).toBe('ZUUWOO');

    const boxes = parser.parseBoxes(ab);
    expect(boxes.length).toBe(24);
    
    // Box 8 (index 7) has 2 dead Pokemon (TEWOTT, PATO)
    expect(boxes[7].length).toBe(2);
    const deadTewott = boxes[7][0];
    expect(deadTewott.speciesId).toBe(501);
    expect(deadTewott.nickname).toBe('TEWOTT');
    expect(deadTewott.experience).toBe(1312);
    expect(deadTewott.nature).toBe(5);

    const deadPato = boxes[7][1];
    expect(deadPato.speciesId).toBe(504);
    expect(deadPato.nickname).toBe('PATO');
    expect(deadPato.experience).toBe(4316);
    expect(deadPato.nature).toBe(6); // Docile
    expect(deadPato.abilityId).toBe(148);
  });
});
