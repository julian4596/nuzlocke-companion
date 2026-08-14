import fs from 'fs';
import { SaveManager } from './src/lib/SaveManager.ts';
import { Gen5SaveParser } from './src/lib/Gen5SaveParser.ts';

const buffer = fs.readFileSync('tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav').buffer;

const parser = new Gen5SaveParser();
const boxes = parser.parseBoxes(buffer);

let total = 0;
boxes.forEach((box, i) => {
  total += box.length;
  if (box.length > 0) {
    console.log(`Box ${i}: ${box.length} pokemon (first: ${box[0].nickname}, PID: ${box[0].pid})`);
  }
});
console.log(`Total Pokemon in boxes: ${total}`);
