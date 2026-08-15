import { useState, useMemo } from 'react';
import { Pokemon, SavedRun, PokemonCustomData } from '@/lib/types';
import pokemonData from '@/data/pokemon.json';
import { Trophy, Skull, Target } from 'lucide-react';

interface FragsViewProps {
  team: Pokemon[];
  boxes: Pokemon[][];
  activeRun: SavedRun;
  onUpdateRun: (run: SavedRun) => void;
}

export default function FragsView({ team, boxes, activeRun, onUpdateRun }: FragsViewProps) {
  const [filter, setFilter] = useState<'All' | 'Alive' | 'Dead'>('All');

  const allPokemon = useMemo(() => {
    const list: { pkmn: Pokemon; status: 'Alive' | 'Dead'; id: string }[] = [];
    
    team.forEach(p => {
      if (p.speciesId && p.speciesId > 0) {
        list.push({ pkmn: p, status: 'Alive', id: `${p.pid}-${p.otid}` });
      }
    });

    boxes.forEach((box, i) => {
      const isDead = activeRun.graveyardBoxes?.includes(i);
      box.forEach(p => {
        if (p.speciesId && p.speciesId > 0) {
          list.push({ pkmn: p, status: isDead ? 'Dead' : 'Alive', id: `${p.pid}-${p.otid}` });
        }
      });
    });
    return list;
  }, [team, boxes, activeRun]);

  const pokemonStats = activeRun.pokemonStats || {};

  const totalKOs = useMemo(() => {
    return allPokemon.reduce((sum, { id }) => {
      return sum + (pokemonStats[id]?.kos || 0);
    }, 0);
  }, [allPokemon, pokemonStats]);

  const sortedPokemon = useMemo(() => {
    let filtered = allPokemon;
    if (filter !== 'All') {
      filtered = allPokemon.filter(p => p.status === filter);
    }

    return filtered.sort((a, b) => {
      const kosA = pokemonStats[a.id]?.kos || 0;
      const kosB = pokemonStats[b.id]?.kos || 0;
      if (kosB !== kosA) return kosB - kosA;
      // Secondary sort by level
      return (b.pkmn.level || 0) - (a.pkmn.level || 0);
    });
  }, [allPokemon, pokemonStats, filter]);

  const getSpeciesName = (id?: number) => {
    if (!id) return 'Unknown';
    const name = (pokemonData as Record<string, string>)[id.toString()];
    return name || `Unknown (${id})`;
  };

  const handleStatChange = (id: string, field: keyof PokemonCustomData, value: any) => {
    const newStats = { ...pokemonStats };
    if (!newStats[id]) newStats[id] = {};
    
    newStats[id] = { ...newStats[id], [field]: value };
    
    onUpdateRun({
      ...activeRun,
      pokemonStats: newStats
    });
  };

  const getRowBackground = (index: number) => {
    if (index === 0) return 'bg-primary text-surface'; // Gold
    if (index === 1) return 'bg-[#C0C0C0] text-surface'; // Silver
    if (index === 2) return 'bg-[#CD7F32] text-surface'; // Bronze
    return 'bg-surface text-text';
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <h2 className="text-4xl font-display font-black uppercase text-text drop-shadow-[4px_4px_0_rgba(253,200,0,1)]">
          KOs / Frags
        </h2>
        <div className="flex gap-2">
          {['All', 'Alive', 'Dead'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 font-display font-black uppercase border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)] transition-transform hover:-translate-y-1 ${
                filter === f ? 'bg-primary text-surface' : 'bg-surface text-text hover:bg-white hover:text-surface'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface p-4 border-4 border-white shadow-[4px_4px_0_rgba(255,255,255,1)] flex items-center gap-4">
          <Target className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm font-mono font-bold uppercase text-text">Total KOs</p>
            <p className="text-2xl font-display font-black text-text">{totalKOs}</p>
          </div>
        </div>
        <div className="bg-surface p-4 border-4 border-white shadow-[4px_4px_0_rgba(255,255,255,1)] flex items-center gap-4">
          <Trophy className="w-8 h-8 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-mono font-bold uppercase text-text">Top Fragger</p>
            <p className="text-2xl font-display font-black text-text truncate">
              {sortedPokemon.length > 0 && (pokemonStats[sortedPokemon[0].id]?.kos || 0) > 0
                ? sortedPokemon[0].pkmn.nickname || getSpeciesName(sortedPokemon[0].pkmn.speciesId)
                : 'None'}
            </p>
          </div>
        </div>
        <div className="bg-surface p-4 border-4 border-white shadow-[4px_4px_0_rgba(255,255,255,1)] flex items-center gap-4">
          <Skull className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm font-mono font-bold uppercase text-text">Dead KOs</p>
            <p className="text-2xl font-display font-black text-text">
              {allPokemon.filter(p => p.status === 'Dead').reduce((sum, p) => sum + (pokemonStats[p.id]?.kos || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="border-4 border-white shadow-[8px_8px_0_rgba(255,255,255,1)] overflow-x-auto bg-surface">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-4 border-white bg-surface text-text font-display font-black uppercase text-sm">
              <th className="p-4 border-r-4 border-white w-16 text-center">#</th>
              <th className="p-4 border-r-4 border-white w-24">Status</th>
              <th className="p-4 border-r-4 border-white w-20">Img</th>
              <th className="p-4 border-r-4 border-white">Nickname</th>
              <th className="p-4 border-r-4 border-white">Species</th>
              <th className="p-4 border-r-4 border-white">Met Location</th>
              <th className="p-4 border-r-4 border-white w-32">KOs</th>
              <th className="p-4 w-40">KO Share</th>
            </tr>
          </thead>
          <tbody>
            {sortedPokemon.map((entry, index) => {
              const { pkmn, status, id } = entry;
              const kos = pokemonStats[id]?.kos || 0;
              const metLocation = pokemonStats[id]?.metLocation || '';
              const share = totalKOs > 0 ? ((kos / totalKOs) * 100).toFixed(1) : '0.0';

              return (
                <tr key={`${id}-${index}`} className="border-b-4 border-white transition-colors group">
                  <td className={`p-4 border-r-4 border-white font-display font-black text-xl text-center ${getRowBackground(index)}`}>
                    {index + 1}
                  </td>
                  <td className="p-4 border-r-4 border-white">
                    <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)] ${
                      status === 'Alive' ? 'bg-success text-surface' : 'bg-danger text-text'
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="p-4 border-r-4 border-white">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn.speciesId}.png`} 
                      alt={getSpeciesName(pkmn.speciesId)}
                      className="w-12 h-12 pixelated bg-surface border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)]"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </td>
                  <td className="p-4 border-r-4 border-white font-display font-bold uppercase text-text">
                    {pkmn.nickname || '-'}
                  </td>
                  <td className="p-4 border-r-4 border-white font-mono font-bold text-text">
                    {getSpeciesName(pkmn.speciesId)}
                  </td>
                  <td className="p-4 border-r-4 border-white">
                    <input 
                      type="text" 
                      value={metLocation}
                      onChange={(e) => handleStatChange(id, 'metLocation', e.target.value)}
                      placeholder="e.g. Route 1"
                      className="w-full bg-surface border-2 border-white focus:border-primary outline-none font-mono text-text placeholder-gray-500 transition-colors p-2 shadow-[2px_2px_0_rgba(255,255,255,1)] focus:shadow-[4px_4px_0_rgba(253,200,0,1)]"
                    />
                  </td>
                  <td className="p-4 border-r-4 border-white">
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleStatChange(id, 'kos', Math.max(0, kos - 1))}
                        className="w-8 h-8 bg-surface text-text border-2 border-white font-black flex items-center justify-center hover:bg-primary hover:text-surface shadow-[2px_2px_0_rgba(255,255,255,1)] hover:shadow-[4px_4px_0_rgba(255,255,255,1)] transition-all mr-2 hover:-translate-y-0.5 hover:-translate-x-0.5"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={kos || ''}
                        onChange={(e) => handleStatChange(id, 'kos', parseInt(e.target.value) || 0)}
                        className="w-12 bg-surface text-text font-display font-black text-xl outline-none text-center border-b-4 border-white focus:border-primary p-1"
                        min="0"
                      />
                      <button 
                        onClick={() => handleStatChange(id, 'kos', kos + 1)}
                        className="w-8 h-8 bg-surface text-text border-2 border-white font-black flex items-center justify-center hover:bg-primary hover:text-surface shadow-[2px_2px_0_rgba(255,255,255,1)] hover:shadow-[4px_4px_0_rgba(255,255,255,1)] transition-all ml-2 hover:-translate-y-0.5 hover:-translate-x-0.5"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-between font-mono font-bold text-text mb-1">
                      <span>{share}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-surface border border-white">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(100, parseFloat(share))}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortedPokemon.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500 font-mono uppercase">
                  No Pokémon found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
