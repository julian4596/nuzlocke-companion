import { SavedRun } from '../lib/types';
import { Play, FolderOpen } from 'lucide-react';

interface StartScreenProps {
  mostRecentRun: SavedRun | null;
  onContinue: () => void;
  onLoadGameClick: () => void;
}

export default function StartScreen({
  mostRecentRun,
  onContinue,
  onLoadGameClick,
}: StartScreenProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-display font-extrabold text-primary mb-4 tracking-tight">
          Pokémon NUZLOCKE tracker
        </h1>
        <p className="text-primary/60 text-lg md:text-xl font-sans">
          Manage and track your Nuzlocke runs
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {mostRecentRun && (
          <button
            onClick={onContinue}
            className="w-full group bg-white hover:bg-surface border border-primary/20 hover:border-primary rounded-2xl p-6 transition-all text-left flex flex-col relative overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Play size={64} />
            </div>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Play size={18} className="text-success" />
                  <h2 className="text-2xl font-display font-bold text-primary">Continue</h2>
                </div>
                <div className="text-secondary font-display font-semibold text-lg">{mostRecentRun.name}</div>
              </div>
              <div className="text-right text-sm text-primary/60 font-medium bg-surface px-3 py-1.5 rounded-lg border border-primary/10">
                <div className="mb-1"><span className="text-success">{mostRecentRun.badges}</span> Badges</div>
                <div><span className="text-danger">{mostRecentRun.deaths}</span> Deaths</div>
              </div>
            </div>
            
            {mostRecentRun.teamSprites && mostRecentRun.teamSprites.length > 0 && (
              <div className="relative z-10 flex gap-2">
                {mostRecentRun.teamSprites.slice(0, 6).map((spriteId, index) => (
                  <div key={index} className="w-12 h-12 bg-surface rounded-full flex items-center justify-center overflow-hidden border border-primary/10">
                    {spriteId ? (
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`}
                        alt={`Pokemon ${spriteId}`}
                        className="w-10 h-10 object-contain drop-shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-primary/5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </button>
        )}



        <button
          onClick={onLoadGameClick}
          className="w-full flex items-center gap-3 bg-white hover:bg-surface text-primary border border-primary/20 hover:border-primary rounded-2xl p-5 font-display font-semibold text-left transition-all hover:shadow-sm"
        >
          <FolderOpen size={20} className="text-secondary" />
          <span className="text-lg">Load Game</span>
        </button>
      </div>
    </div>
  );
}
