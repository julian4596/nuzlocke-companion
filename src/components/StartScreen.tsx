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
      <div className="max-w-2xl w-full flex flex-col items-center justify-center space-y-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-7xl font-display font-black uppercase text-text drop-shadow-[4px_4px_0_rgba(253,200,0,1)] mb-6 tracking-tight break-words">
            Nuzlocke Companion
          </h1>
        <p className="text-text text-lg md:text-2xl font-bold font-mono">
          Manage and track your Nuzlocke runs
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {mostRecentRun && (
          <button
            onClick={onContinue}
            className="w-full group bg-secondary border-4 border-white p-4 sm:p-6 transition-all text-left flex flex-col relative overflow-hidden shadow-brutal-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Play size={64} className="text-surface" />
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start mb-6 w-full gap-4 sm:gap-0">
              <div className="w-full sm:w-auto">
                <div className="flex items-center gap-2 mb-1">
                  <Play size={24} className="text-surface fill-surface sm:w-6 sm:h-6 w-5 h-5" />
                  <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-surface">Continue</h2>
                </div>
                <div className="text-surface font-display font-bold text-lg sm:text-xl break-words">{mostRecentRun.name}</div>
              </div>
              <div className="text-left sm:text-right text-xs sm:text-sm font-mono font-bold bg-surface px-3 py-2 border-2 border-white text-text shadow-[2px_2px_0_rgba(255,255,255,1)] flex sm:block gap-4">
                <div className="mb-0 sm:mb-1"><span className="text-success">{mostRecentRun.badges}</span> Badges</div>
                <div><span className="text-danger">{mostRecentRun.deaths}</span> Deaths</div>
              </div>
            </div>
            
            {mostRecentRun.teamSprites && mostRecentRun.teamSprites.length > 0 && (
              <div className="relative z-10 flex flex-wrap gap-2">
                {mostRecentRun.teamSprites.slice(0, 6).map((spriteId, index) => (
                  <div key={index} className="w-10 h-10 sm:w-12 sm:h-12 bg-surface flex items-center justify-center overflow-hidden border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)]">
                    {spriteId ? (
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`}
                        alt={`Pokemon ${spriteId}`}
                        className="w-10 h-10 object-contain drop-shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-4 h-4 bg-text" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </button>
        )}



        <button
          onClick={onLoadGameClick}
          className="w-full flex items-center justify-center gap-3 bg-primary text-surface border-4 border-white p-6 font-display font-black uppercase text-2xl transition-all shadow-brutal-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          <FolderOpen size={28} className="text-surface" />
          <span>Load Game</span>
        </button>
      </div>
    </div>
    </div>
  );
}
