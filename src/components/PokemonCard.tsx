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
    <div className="pokemon-card bg-white p-4 rounded-lg border border-primary/20 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
          <img 
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn.speciesId}.png`} 
            alt={getSpeciesName(pkmn.speciesId)}
            className="w-16 h-16 bg-surface rounded-full border-2 border-primary/10"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-display font-bold text-primary flex flex-col xl:flex-row xl:justify-between truncate">
              <span className="truncate">
                {pkmn.nickname} 
                {displayStats?.level !== undefined ? ` (Lv. ${displayStats.level})` : ''}
              </span>
              <span className="text-primary/60 text-sm xl:ml-2 font-sans font-normal">#{pkmn.speciesId} {getSpeciesName(pkmn.speciesId)}</span>
            </h3>
            <p className="text-sm text-primary/80 mt-1 truncate">
              Ability: <span className="text-primary font-bold">{getAbilityName(pkmn.speciesId, pkmn.abilityBit, pkmn.abilityId)}</span>
            </p>
        </div>
      </div>
      
      {displayStats && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-primary/80 font-display font-medium mb-1">
            <span>{displayStats.nature ? `Nature: ${displayStats.nature}` : 'HP:'}</span>
            <span className={displayStats.nature ? "text-success" : ""}>
              {displayStats.hp !== undefined ? `${displayStats.hp} / ${displayStats.maxHp}` : `Max HP: ${displayStats.maxHp}`}
            </span>
          </div>
          {displayStats.hp !== undefined && !displayStats.nature && (
            <div className="w-full bg-surface rounded-full h-2.5 mb-3 overflow-hidden">
              <div 
                className="bg-success h-2.5 rounded-full" 
                style={{ width: `${Math.min(100, Math.max(0, (displayStats.hp / (displayStats.maxHp || 1)) * 100))}%` }}
              ></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm text-primary/80 p-2 bg-surface rounded-lg mt-2">
            <div>Atk: <span className="text-primary font-medium">{displayStats.atk}</span></div>
            <div>Def: <span className="text-primary font-medium">{displayStats.def}</span></div>
            <div>SpA: <span className="text-primary font-medium">{displayStats.spa}</span></div>
            <div>SpD: <span className="text-primary font-medium">{displayStats.spd}</span></div>
            <div>Spe: <span className="text-primary font-medium">{displayStats.spe}</span></div>
            <div>PID: <span className="text-primary/40 truncate font-mono" title={pkmn.pid?.toString()}>{pkmn.pid}</span></div>
          </div>
        </div>
      )}

      {pkmn.ivs && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-primary/60 uppercase font-display font-semibold">IVs</p>
            <span className="bg-surface text-primary border border-primary/10 text-[10px] px-1.5 py-0.5 rounded">
              HP: {calculateHiddenPower(pkmn.ivs)} {calculateHiddenPowerPower(pkmn.ivs)}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1 text-[10px] text-center bg-surface p-1.5 rounded-lg border border-primary/10">
            <div><div className="text-primary/60">HP</div><div className={pkmn.ivs.hp === 31 ? "text-success font-bold" : "text-primary"}>{pkmn.ivs.hp}</div></div>
            <div><div className="text-primary/60">Atk</div><div className={pkmn.ivs.attack === 31 ? "text-success font-bold" : "text-primary"}>{pkmn.ivs.attack}</div></div>
            <div><div className="text-primary/60">Def</div><div className={pkmn.ivs.defense === 31 ? "text-success font-bold" : "text-primary"}>{pkmn.ivs.defense}</div></div>
            <div><div className="text-primary/60">SpA</div><div className={pkmn.ivs.spAttack === 31 ? "text-success font-bold" : "text-primary"}>{pkmn.ivs.spAttack}</div></div>
            <div><div className="text-primary/60">SpD</div><div className={pkmn.ivs.spDefense === 31 ? "text-success font-bold" : "text-primary"}>{pkmn.ivs.spDefense}</div></div>
            <div><div className="text-primary/60">Spe</div><div className={pkmn.ivs.speed === 31 ? "text-success font-bold" : "text-primary"}>{pkmn.ivs.speed}</div></div>
          </div>
        </div>
      )}

      <div className="border-t border-primary/10 pt-3 mt-auto">
        <p className="text-xs text-primary/60 mb-2 uppercase font-display font-semibold">Moves</p>
        <div className="flex flex-wrap gap-2">
          {pkmn.moves?.filter((m: number) => m > 0).map((moveId: number, idx: number) => (
            <span key={idx} className="bg-surface text-primary border border-primary/20 text-xs px-2 py-1 rounded truncate max-w-full">
              {getMoveName(moveId)}
            </span>
          ))}
          {(!pkmn.moves || pkmn.moves.filter((m: number) => m > 0).length === 0) && (
            <span className="text-primary/40 text-xs italic">No moves known</span>
          )}
        </div>
      </div>
    </div>
  );
}
