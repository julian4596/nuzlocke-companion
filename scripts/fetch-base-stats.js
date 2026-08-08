const fs = require('fs');

async function main() {
  console.log("Fetching Base Stats and Growth Rates for 386 Pokemon...");
  const statsDict = {};
  
  const promises = [];
  
  for (let i = 1; i <= 386; i++) {
    promises.push(
      Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${i}/`).then(r => r.json()),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}/`).then(r => r.json())
      ]).then(([pkmn, species]) => {
        const hp = pkmn.stats.find(s => s.stat.name === 'hp').base_stat;
        const atk = pkmn.stats.find(s => s.stat.name === 'attack').base_stat;
        const def = pkmn.stats.find(s => s.stat.name === 'defense').base_stat;
        const spa = pkmn.stats.find(s => s.stat.name === 'special-attack').base_stat;
        const spd = pkmn.stats.find(s => s.stat.name === 'special-defense').base_stat;
        const spe = pkmn.stats.find(s => s.stat.name === 'speed').base_stat;
        
        statsDict[i.toString()] = {
          hp, atk, def, spa, spd, spe,
          growthRate: species.growth_rate.name
        };
        console.log(`Fetched #${i} ${pkmn.name}`);
      })
    );
  }
  
  await Promise.all(promises);
  
  fs.writeFileSync('../src/data/baseStats.json', JSON.stringify(statsDict, null, 2));
  console.log("Successfully generated baseStats.json");
}

main().catch(console.error);
