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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4 tracking-tight">
          Pokémon NUZLOCKE tracker
        </h1>
        <p className="text-slate-400 text-lg md:text-xl">
          Manage and track your Nuzlocke runs
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {mostRecentRun && (
          <button
            onClick={onContinue}
            className="w-full group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all text-left flex flex-col relative overflow-hidden shadow-lg hover:shadow-blue-900/20"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Play size={64} />
            </div>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Play size={18} className="text-emerald-400" />
                  <h2 className="text-2xl font-bold text-white">Continue</h2>
                </div>
                <div className="text-blue-400 font-semibold text-lg">{mostRecentRun.name}</div>
              </div>
              <div className="text-right text-sm text-slate-400 font-medium bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                <div className="mb-1"><span className="text-emerald-400">{mostRecentRun.badges}</span> Badges</div>
                <div><span className="text-red-400">{mostRecentRun.deaths}</span> Deaths</div>
              </div>
            </div>
            
            {mostRecentRun.teamSprites && mostRecentRun.teamSprites.length > 0 && (
              <div className="relative z-10 flex gap-2">
                {mostRecentRun.teamSprites.slice(0, 6).map((spriteId, index) => (
                  <div key={index} className="w-12 h-12 bg-slate-950/80 rounded-full flex items-center justify-center overflow-hidden border border-slate-800">
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
                      <div className="w-4 h-4 rounded-full bg-slate-800" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </button>
        )}



        <button
          onClick={onLoadGameClick}
          className="w-full flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700 rounded-2xl p-5 font-semibold text-left transition-all hover:shadow-lg"
        >
          <FolderOpen size={20} className="text-blue-400" />
          <span className="text-lg">Load Game</span>
        </button>
      </div>
    </div>
  );
}
