import { useEffect, useState } from 'react';
import { Trash2, Download, Plus } from 'lucide-react';
import { SavedRun } from '../lib/types';
import { getRuns, saveRun, deleteRun, updateRun } from '../lib/db';
import { SaveManager } from '../lib/SaveManager';
import ImportSaveModal from './ImportSaveModal';

interface LoadGameScreenProps {
  onBack?: () => void;
  onLoadRun: (run: SavedRun) => void;
}

export default function LoadGameScreen({ onBack, onLoadRun }: LoadGameScreenProps) {
  const [runs, setRuns] = useState<SavedRun[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRuns = async () => {
    try {
      const fetchedRuns = await getRuns();
      // Sort by lastPlayed descending
      fetchedRuns.sort((a, b) => b.lastPlayed - a.lastPlayed);
      setRuns(fetchedRuns);
    } catch (error) {
      console.error('Failed to load runs:', error);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this save? This cannot be undone.')) {
      await deleteRun(id);
      await loadRuns();
    }
  };

  const handleUpdateBadges = async (id: string, newBadges: number) => {
    if (newBadges < 0) return;
    await updateRun(id, { badges: newBadges });
    await loadRuns();
  };

  const handleDownload = (run: SavedRun) => {
    const blob = new Blob([run.saveBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${run.name}.sav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (name: string, buffer: ArrayBuffer, fileHandle?: any) => {
    try {
      const parser = SaveManager.getParser(buffer);
      const data = parser.parse(buffer);
      const team = parser.parseTeam(buffer);
      
      const newRun: SavedRun = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2),
        name,
        gameVersion: data.gameVersion || 'Unknown',
        badges: (data as any).badges || 0,
        deaths: 0,
        teamSprites: team.map(p => p.speciesId || 0).filter(id => id > 0),
        saveBuffer: buffer,
        lastPlayed: Date.now(),
        fileHandle
      };
      
      await saveRun(newRun);
      await loadRuns();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to import save:', error);
      alert(`Failed to parse save file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display font-black text-text uppercase drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">Load Game</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-surface border-4 border-white shadow-brutal-white px-4 py-2 font-display font-black uppercase transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Plus size={24} />
            Import saved game
          </button>
        </div>

        <div className="space-y-4">
          {runs.length === 0 ? (
            <div className="text-center py-16 text-text font-mono font-bold bg-surface border-4 border-white shadow-brutal-white">
              No saved games found. Import a save file to get started.
            </div>
          ) : (
            runs.map(run => (
              <div key={run.id} className="bg-surface border-4 border-white shadow-brutal-white flex flex-col md:flex-row items-stretch transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none mb-4">
                <div 
                  className="flex-1 p-6 cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => onLoadRun(run)}
                >
                  <h2 className="text-2xl font-display font-black mb-1 text-primary uppercase">{run.name}</h2>
                  <div className="text-sm text-text font-mono mb-3">
                    {run.gameVersion}
                  </div>
                  
                  <div className="flex items-center gap-6 mb-4 font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-text">Badges:</span>
                      <span className="font-black text-success">{run.badges}</span>
                      <div className="flex gap-1 ml-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateBadges(run.id, run.badges - 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-surface hover:bg-primary text-text hover:text-surface border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none font-black font-mono transition-all"
                          disabled={run.badges <= 0}
                          title="Decrease Badges"
                        >
                          -
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateBadges(run.id, run.badges + 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-surface hover:bg-primary text-text hover:text-surface border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none font-black font-mono transition-all"
                          title="Increase Badges"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text">Deaths:</span>
                      <span className="font-black text-danger">{run.deaths}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {run.teamSprites.map((spriteId, idx) => (
                      <div key={idx} className="w-12 h-12 bg-surface border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)] flex items-center justify-center overflow-hidden">
                        {spriteId > 0 ? (
                           <img 
                             src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`} 
                             alt={`Pokemon ${spriteId}`}
                             className="w-full h-full object-contain drop-shadow-md"
                           />
                        ) : (
                           <div className="w-6 h-6 rounded-full bg-text" />
                        )}
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 6 - run.teamSprites.length) }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="w-12 h-12 bg-surface border-2 border-dashed border-white flex items-center justify-center">
                        <div className="w-4 h-4 bg-text" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center justify-center gap-4 p-4 bg-surface md:border-l-4 md:border-t-0 border-t-4 border-white">
                  <button 
                    onClick={() => handleDelete(run.id)}
                    className="p-3 text-danger border-2 border-transparent hover:border-white hover:bg-danger hover:text-white shadow-none hover:shadow-brutal-white font-bold transition-all hover:-translate-x-1 hover:-translate-y-1"
                    title="Delete Run"
                  >
                    <Trash2 size={24} />
                  </button>
                  <button 
                    onClick={() => handleDownload(run)}
                    className="p-3 text-secondary border-2 border-transparent hover:border-white hover:bg-secondary hover:text-white shadow-none hover:shadow-brutal-white font-bold transition-all hover:-translate-x-1 hover:-translate-y-1"
                    title="Download Save"
                  >
                    <Download size={24} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {onBack && (
          <button 
            onClick={onBack}
            className="mt-8 text-text font-mono font-bold hover:text-primary transition-colors flex items-center gap-2"
          >
            &larr; BACK TO START
          </button>
        )}
      </div>

      <ImportSaveModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
