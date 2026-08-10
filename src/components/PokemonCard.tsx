import { Pokemon } from '@/lib/types';
import pokemonData from '@/data/pokemon.json';
import movesData from '@/data/moves.json';
import abilitiesData from '@/data/abilities.json';
import abilityIdsData from '@/data/ability_ids.json';
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

  const getAbilityName = (id?: number, abilityBit?: number, abilityId?: number) => {
    if (abilityId !== undefined) {
      const name = (abilityIdsData as Record<string, string>)[abilityId.toString()];
      if (name) return name;
    }
    if (!id || abilityBit === undefined) return 'Unknown';
    const abilities = (abilitiesData as Record<string, string[]>)[id.toString()];
    if (!abilities) return 'Unknown';
    return abilities[abilityBit] || abilities[0];
  };

  const dynamicStats = (isBox && pkmn.speciesId && pkmn.experience !== undefined && pkmn.nature !== undefined && pkmn.ivs && pkmn.evs)
    ? calculateStats(pkmn.speciesId, pkmn.experience, pkmn.nature, pkmn.ivs, pkmn.evs)
    : null;

  const displayStats = (isBox && dynamicStats) 
    ? {
        level: dynamicStats.level,
        hp: dynamicStats.maxHp,
        maxHp: dynamicStats.maxHp,
        atk: dynamicStats.atk,
        def: dynamicStats.def,
        spa: dynamicStats.spa,
        spd: dynamicStats.spd,
        spe: dynamicStats.spe,
        nature: dynamicStats.nature
      }
    : (!isBox && pkmn.attack !== undefined)
      ? {
          level: pkmn.level,
          hp: pkmn.hp,
          maxHp: pkmn.maxHp,
          atk: pkmn.attack,
          def: pkmn.defense,
          spa: pkmn.spAttack,
          spd: pkmn.spDefense,
          spe: pkmn.speed,
          nature: null
        }
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
              {displayStats?.level !== undefined ? ` (Lv. ${displayStats.level})` : ''}
            </span>
            <span className="text-gray-400 text-sm xl:ml-2">#{pkmn.speciesId} {getSpeciesName(pkmn.speciesId)}</span>
          </h3>
          <p className="text-sm text-gray-400 mt-1 truncate">
            Ability: <span className="text-blue-300 font-medium">{getAbilityName(pkmn.speciesId, pkmn.abilityBit, pkmn.abilityId)}</span>
          </p>
        </div>
      </div>
      
      {displayStats && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>{displayStats.nature ? `Nature: ${displayStats.nature}` : 'HP:'}</span>
            <span className={displayStats.nature ? "text-green-400" : ""}>
              {displayStats.hp !== undefined ? `${displayStats.hp} / ${displayStats.maxHp}` : `Max HP: ${displayStats.maxHp}`}
            </span>
          </div>
          {displayStats.hp !== undefined && !displayStats.nature && (
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-3">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${Math.min(100, Math.max(0, (displayStats.hp / (displayStats.maxHp || 1)) * 100))}%` }}
              ></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 p-2 bg-gray-900 rounded-lg mt-2">
            <div>Atk: <span className="text-white">{displayStats.atk}</span></div>
            <div>Def: <span className="text-white">{displayStats.def}</span></div>
            <div>SpA: <span className="text-white">{displayStats.spa}</span></div>
            <div>SpD: <span className="text-white">{displayStats.spd}</span></div>
            <div>Spe: <span className="text-white">{displayStats.spe}</span></div>
            <div>PID: <span className="text-gray-500 truncate" title={pkmn.pid?.toString()}>{pkmn.pid}</span></div>
          </div>
        </div>
      )}

      {pkmn.ivs && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">IVs</p>
          <div className="grid grid-cols-6 gap-1 text-[10px] text-center bg-gray-900 p-1.5 rounded-lg border border-gray-700">
            <div><div className="text-gray-500">HP</div><div className={pkmn.ivs.hp === 31 ? "text-green-400 font-bold" : "text-white"}>{pkmn.ivs.hp}</div></div>
            <div><div className="text-gray-500">Atk</div><div className={pkmn.ivs.attack === 31 ? "text-green-400 font-bold" : "text-white"}>{pkmn.ivs.attack}</div></div>
            <div><div className="text-gray-500">Def</div><div className={pkmn.ivs.defense === 31 ? "text-green-400 font-bold" : "text-white"}>{pkmn.ivs.defense}</div></div>
            <div><div className="text-gray-500">SpA</div><div className={pkmn.ivs.spAttack === 31 ? "text-green-400 font-bold" : "text-white"}>{pkmn.ivs.spAttack}</div></div>
            <div><div className="text-gray-500">SpD</div><div className={pkmn.ivs.spDefense === 31 ? "text-green-400 font-bold" : "text-white"}>{pkmn.ivs.spDefense}</div></div>
            <div><div className="text-gray-500">Spe</div><div className={pkmn.ivs.speed === 31 ? "text-green-400 font-bold" : "text-white"}>{pkmn.ivs.speed}</div></div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-700 pt-3 mt-auto">
        <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Moves</p>
        <div className="flex flex-wrap gap-2">
          {pkmn.moves?.filter((m: number) => m > 0).map((moveId: number, idx: number) => (
            <span key={idx} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded truncate max-w-full">
              {getMoveName(moveId)}
            </span>
          ))}
          {(!pkmn.moves || pkmn.moves.filter((m: number) => m > 0).length === 0) && (
            <span className="text-gray-500 text-xs italic">No moves known</span>
          )}
        </div>
      </div>
    </div>
  );
}
