import { Pokemon } from '@/lib/types';
import pokemonData from '@/data/pokemon.json';
import movesData from '@/data/moves.json';
import abilitiesData from '@/data/abilities.json';
import abilityIdsData from '@/data/ability_ids.json';
import { calculateStats, NATURES } from '@/lib/StatCalculator';
import { calculateHiddenPower, calculateHiddenPowerPower } from '@/lib/HiddenPower';

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
          nature: (pkmn.nature !== undefined && NATURES[pkmn.nature]) ? NATURES[pkmn.nature].name : null
        }
      : null;

  return (
    <div className="pokemon-card bg-surface p-4 border-4 border-white shadow-[4px_4px_0_rgba(255,255,255,1)] flex flex-col h-full transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_rgba(253,200,0,1)] hover:border-primary">
      <div className="flex items-center gap-4 mb-4">
          <img 
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn.speciesId}.png`} 
            alt={getSpeciesName(pkmn.speciesId)}
            className="w-16 h-16 bg-surface rounded-none border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)]"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-display font-black uppercase text-text flex flex-col xl:flex-row xl:justify-between">
              <span className="truncate">
                {pkmn.nickname} 
                {displayStats?.level !== undefined ? ` (Lv. ${displayStats.level})` : ''}
              </span>
              <span className="text-text text-sm xl:ml-2 font-mono font-bold mt-1 xl:mt-0 truncate">#{pkmn.speciesId} {getSpeciesName(pkmn.speciesId)}</span>
            </h3>
            <p className="text-sm text-text font-mono mt-1 truncate uppercase">
              Ability: <span className="text-text font-black">{getAbilityName(pkmn.speciesId, pkmn.abilityBit, pkmn.abilityId)}</span>
            </p>
        </div>
      </div>
      
      {displayStats && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-text font-mono font-bold uppercase mb-1">
            <span>{displayStats.nature ? `Nature: ${displayStats.nature}` : 'HP:'}</span>
            <span className={displayStats.nature ? "text-success font-black" : ""}>
              {displayStats.hp !== undefined ? `${displayStats.hp} / ${displayStats.maxHp}` : `Max HP: ${displayStats.maxHp}`}
            </span>
          </div>
          {displayStats.hp !== undefined && !displayStats.nature && (
            <div className="w-full bg-surface border-2 border-white h-4 mb-3 rounded-none overflow-hidden">
              <div 
                className="bg-success h-full rounded-none" 
                style={{ width: `${Math.min(100, Math.max(0, (displayStats.hp / (displayStats.maxHp || 1)) * 100))}%` }}
              ></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm text-text font-mono font-bold p-3 border-2 border-white bg-surface rounded-none mt-2 shadow-[2px_2px_0_rgba(255,255,255,1)]">
            <div>Atk: <span className="text-text font-black">{displayStats.atk}</span></div>
            <div>Def: <span className="text-text font-black">{displayStats.def}</span></div>
            <div>SpA: <span className="text-text font-black">{displayStats.spa}</span></div>
            <div>SpD: <span className="text-text font-black">{displayStats.spd}</span></div>
            <div>Spe: <span className="text-text font-black">{displayStats.spe}</span></div>
            <div>PID: <span className="text-text truncate font-mono font-bold" title={pkmn.pid?.toString()}>{pkmn.pid}</span></div>
          </div>
        </div>
      )}

      {pkmn.ivs && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-text uppercase font-mono font-bold">IVs</p>
            <span className="bg-primary text-surface border-2 border-white text-xs px-2 py-0.5 font-black uppercase shadow-[2px_2px_0_rgba(255,255,255,1)]">
              HP: {calculateHiddenPower(pkmn.ivs)} {calculateHiddenPowerPower(pkmn.ivs)}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-0 text-[10px] sm:text-xs text-center border-2 border-white bg-surface mt-2 font-mono font-bold shadow-[2px_2px_0_rgba(255,255,255,1)]">
            <div className="border-r-2 border-white last:border-r-0"><div className="text-text border-b-2 border-white p-0.5 sm:p-1">HP</div><div className={`p-0.5 sm:p-1 ${pkmn.ivs.hp === 31 ? "text-success font-black" : "text-text"}`}>{pkmn.ivs.hp}</div></div>
            <div className="border-r-2 border-white last:border-r-0"><div className="text-text border-b-2 border-white p-0.5 sm:p-1">Atk</div><div className={`p-0.5 sm:p-1 ${pkmn.ivs.attack === 31 ? "text-success font-black" : "text-text"}`}>{pkmn.ivs.attack}</div></div>
            <div className="border-r-2 border-white last:border-r-0"><div className="text-text border-b-2 border-white p-0.5 sm:p-1">Def</div><div className={`p-0.5 sm:p-1 ${pkmn.ivs.defense === 31 ? "text-success font-black" : "text-text"}`}>{pkmn.ivs.defense}</div></div>
            <div className="border-r-2 border-white last:border-r-0"><div className="text-text border-b-2 border-white p-0.5 sm:p-1">SpA</div><div className={`p-0.5 sm:p-1 ${pkmn.ivs.spAttack === 31 ? "text-success font-black" : "text-text"}`}>{pkmn.ivs.spAttack}</div></div>
            <div className="border-r-2 border-white last:border-r-0"><div className="text-text border-b-2 border-white p-0.5 sm:p-1">SpD</div><div className={`p-0.5 sm:p-1 ${pkmn.ivs.spDefense === 31 ? "text-success font-black" : "text-text"}`}>{pkmn.ivs.spDefense}</div></div>
            <div className="border-r-0 border-white last:border-r-0"><div className="text-text border-b-2 border-white p-0.5 sm:p-1">Spe</div><div className={`p-0.5 sm:p-1 ${pkmn.ivs.speed === 31 ? "text-success font-black" : "text-text"}`}>{pkmn.ivs.speed}</div></div>
          </div>
        </div>
      )}

      <div className="border-t-2 border-white pt-3 mt-auto">
        <p className="text-sm text-text mb-2 uppercase font-mono font-bold">Moves</p>
        <div className="flex flex-wrap gap-2">
          {pkmn.moves?.filter((m: number) => m > 0).map((moveId: number, idx: number) => (
            <span key={idx} className="bg-surface text-text font-mono font-bold uppercase border-2 border-white text-[10px] sm:text-xs px-2 py-1 shadow-[2px_2px_0_rgba(255,255,255,1)] truncate max-w-full">
              {getMoveName(moveId)}
            </span>
          ))}
          {(!pkmn.moves || pkmn.moves.filter((m: number) => m > 0).length === 0) && (
            <span className="text-text text-xs font-mono font-bold uppercase">No moves known</span>
          )}
        </div>
      </div>
    </div>
  );
}
