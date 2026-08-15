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
    if (index === 0) return 'bg-[#FDC800] text-surface'; // Gold
    if (index === 1) return 'bg-[#C0C0C0] text-surface'; // Silver
    if (index === 2) return 'bg-[#CD7F32] text-surface'; // Bronze
    return 'bg-surface text-text';
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <h2 className="text-3xl font-display font-black uppercase text-primary drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">
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

      <div className="border-4 border-white shadow-[8px_8px_0_rgba(255,255,255,1)] overflow-x-auto bg-[#1A1A1A]">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-4 border-white bg-surface text-text font-display font-black uppercase text-sm">
              <th className="p-4 border-r-2 border-white w-16 text-center">#</th>
              <th className="p-4 border-r-2 border-white w-24">Status</th>
              <th className="p-4 border-r-2 border-white w-20">Img</th>
              <th className="p-4 border-r-2 border-white">Nickname</th>
              <th className="p-4 border-r-2 border-white">Species</th>
              <th className="p-4 border-r-2 border-white">Met Location</th>
              <th className="p-4 border-r-2 border-white w-28">KOs</th>
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
                <tr key={`${id}-${index}`} className="border-b-2 border-[#333] hover:bg-[#2A2A2A] transition-colors group">
                  <td className={`p-4 border-r-2 border-[#333] font-display font-black text-xl text-center ${getRowBackground(index)}`}>
                    {index + 1}
                  </td>
                  <td className="p-4 border-r-2 border-[#333]">
                    <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)] ${
                      status === 'Alive' ? 'bg-success text-surface' : 'bg-danger text-white'
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="p-4 border-r-2 border-[#333]">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn.speciesId}.png`} 
                      alt={getSpeciesName(pkmn.speciesId)}
                      className="w-12 h-12 pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </td>
                  <td className="p-4 border-r-2 border-[#333] font-display font-bold uppercase text-white">
                    {pkmn.nickname || '-'}
                  </td>
                  <td className="p-4 border-r-2 border-[#333] font-mono text-gray-300">
                    {getSpeciesName(pkmn.speciesId)}
                  </td>
                  <td className="p-4 border-r-2 border-[#333]">
                    <input 
                      type="text" 
                      value={metLocation}
                      onChange={(e) => handleStatChange(id, 'metLocation', e.target.value)}
                      placeholder="e.g. Route 1"
                      className="w-full bg-transparent border-b-2 border-transparent focus:border-primary outline-none font-mono text-white placeholder-gray-600 transition-colors py-1"
                    />
                  </td>
                  <td className="p-4 border-r-2 border-[#333]">
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleStatChange(id, 'kos', Math.max(0, kos - 1))}
                        className="w-6 h-6 bg-surface text-white border-2 border-white font-bold flex items-center justify-center hover:bg-primary hover:text-surface hover:shadow-[2px_2px_0_rgba(255,255,255,1)] transition-all mr-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={kos || ''}
                        onChange={(e) => handleStatChange(id, 'kos', parseInt(e.target.value) || 0)}
                        className="w-12 bg-transparent text-white font-display font-black text-xl outline-none text-center"
                        min="0"
                      />
                      <button 
                        onClick={() => handleStatChange(id, 'kos', kos + 1)}
                        className="w-6 h-6 bg-surface text-white border-2 border-white font-bold flex items-center justify-center hover:bg-primary hover:text-surface hover:shadow-[2px_2px_0_rgba(255,255,255,1)] transition-all ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-between font-mono text-white mb-1">
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
