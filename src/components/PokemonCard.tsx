import { Pokemon } from '@/lib/GBASaveParser';
import pokemonData from '@/data/pokemon.json';
import movesData from '@/data/moves.json';
import abilitiesData from '@/data/abilities.json';
import { calculateStats } from '@/lib/StatCalculator';

interface PokemonCardProps {
  pkmn: Pokemon;
  isBox?: boolean;
}

export default function PokemonCard({ pkmn, isBox = false }: PokemonCardProps) {
  const getSpeciesName = (id?: number) => {
    if (!id) return 'Unknown';
    const name = (pokemonData as Record<string, string>)[id.toString()];
    return name || `Unknown (${id})`;
  };

  const getMoveName = (id: number) => {
    const name = (movesData as Record<string, string>)[id.toString()];
    return name || `Move ${id}`;
  };

  const getAbilityName = (id?: number, abilityBit?: number) => {
    if (!id || abilityBit === undefined) return 'Unknown';
    const abilities = (abilitiesData as Record<string, string[]>)[id.toString()];
    if (!abilities) return 'Unknown';
    return abilities[abilityBit] || abilities[0];
  };

  const dynamicStats = (isBox && pkmn.speciesId && pkmn.experience !== undefined && pkmn.nature !== undefined && pkmn.ivs && pkmn.evs)
    ? calculateStats(pkmn.speciesId, pkmn.experience, pkmn.nature, pkmn.ivs, pkmn.evs)
    : null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn.speciesId}.png`} 
          alt={getSpeciesName(pkmn.speciesId)}
          className="w-16 h-16 bg-gray-700 rounded-full border-2 border-gray-600"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold flex flex-col xl:flex-row xl:justify-between truncate">
            <span className="truncate">
              {pkmn.nickname} 
              {!isBox && pkmn.level !== undefined ? ` (Lv. ${pkmn.level})` : ''}
              {isBox && dynamicStats ? ` (Lv. ${dynamicStats.level})` : ''}
            </span>
            <span className="text-gray-400 text-sm xl:ml-2">#{pkmn.speciesId} {getSpeciesName(pkmn.speciesId)}</span>
          </h3>
          <p className="text-sm text-gray-400 mt-1 truncate">
            Ability: <span className="text-blue-300 font-medium">{getAbilityName(pkmn.speciesId, pkmn.abilityBit)}</span>
          </p>
        </div>
      </div>
      
      {!isBox && pkmn.hp !== undefined && pkmn.maxHp !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300">
            <span>HP:</span>
            <span>{pkmn.hp} / {pkmn.maxHp}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (pkmn.hp / pkmn.maxHp) * 100))}%` }}></div>
          </div>
        </div>
      )}

      {isBox && dynamicStats && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Nature: <span className="text-white">{dynamicStats.nature}</span></span>
            <span>Max HP: <span className="text-green-400">{dynamicStats.maxHp}</span></span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-2 p-2 bg-gray-900 rounded-lg">
            <div>Atk: <span className="text-white">{dynamicStats.atk}</span></div>
            <div>Def: <span className="text-white">{dynamicStats.def}</span></div>
            <div>SpA: <span className="text-white">{dynamicStats.spa}</span></div>
            <div>SpD: <span className="text-white">{dynamicStats.spd}</span></div>
            <div>Spe: <span className="text-white">{dynamicStats.spe}</span></div>
            <div>PID: <span className="text-gray-500 truncate" title={pkmn.pid?.toString()}>{pkmn.pid}</span></div>
          </div>
        </div>
      )}

      {!isBox && pkmn.attack !== undefined && (
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-4 p-2 bg-gray-900 rounded-lg">
          <div>Atk: <span className="text-white">{pkmn.attack}</span></div>
          <div>Def: <span className="text-white">{pkmn.defense}</span></div>
          <div>SpA: <span className="text-white">{pkmn.spAttack}</span></div>
          <div>SpD: <span className="text-white">{pkmn.spDefense}</span></div>
          <div>Spe: <span className="text-white">{pkmn.speed}</span></div>
          <div>PID: <span className="text-gray-500 truncate" title={pkmn.pid?.toString()}>{pkmn.pid}</span></div>
        </div>
      )}

      <div className="border-t border-gray-700 pt-3 mt-auto">
        <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Moves</p>
        <div className="flex flex-wrap gap-2">
          {pkmn.moves?.filter(m => m > 0).map((moveId, idx) => (
            <span key={idx} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded truncate max-w-full">
              {getMoveName(moveId)}
            </span>
          ))}
          {(!pkmn.moves || pkmn.moves.filter(m => m > 0).length === 0) && (
            <span className="text-gray-500 text-xs italic">No moves known</span>
          )}
        </div>
      </div>
    </div>
  );
}
