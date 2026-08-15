import { Pokemon } from '@/lib/types';
import PokemonCard from './PokemonCard';

interface BoxViewProps {
  title: string;
  boxData: Pokemon[];
}

export default function BoxView({ title, boxData }: BoxViewProps) {
  // Filter out empty slots
  const validPokemon = boxData.filter(pkmn => pkmn.pid !== 0 || pkmn.otid !== 0);

  return (
    <div>
      <h2 className="text-3xl font-display font-black uppercase mb-6 text-primary drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">{title}</h2>
      {validPokemon.length === 0 ? (
        <p className="text-text font-mono font-bold uppercase">No Pokémon found here.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {validPokemon.map((pkmn, i) => (
            <PokemonCard key={i} pkmn={pkmn} isBox={true} />
          ))}
        </div>
      )}
    </div>
  );
}
