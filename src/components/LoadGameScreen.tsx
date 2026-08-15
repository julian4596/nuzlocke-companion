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
          <h1 className="text-3xl font-display font-bold text-primary">Load Game</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-display transition-colors"
          >
            <Plus size={20} />
            Import saved game
          </button>
        </div>

        <div className="space-y-4">
          {runs.length === 0 ? (
            <div className="text-center py-12 text-primary/60 bg-white rounded-lg border border-primary/20">
              No saved games found. Import a save file to get started.
            </div>
          ) : (
            runs.map(run => (
              <div key={run.id} className="bg-white rounded-lg flex flex-col md:flex-row items-stretch border border-primary/20 hover:border-primary transition-colors overflow-hidden">
                <div 
                  className="flex-1 p-6 cursor-pointer hover:bg-surface transition-colors"
                  onClick={() => onLoadRun(run)}
                >
                  <h2 className="text-xl font-display font-bold mb-1 text-primary">{run.name}</h2>
                  <div className="text-sm text-primary/60 mb-3">
                    {run.gameVersion}
                  </div>
                  
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-primary/60">Badges:</span>
                      <span className="font-semibold text-primary">{run.badges}</span>
                      <div className="flex gap-1 ml-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateBadges(run.id, run.badges - 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-surface hover:bg-primary/5 border border-primary/10 rounded text-primary"
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
                          className="w-6 h-6 flex items-center justify-center bg-surface hover:bg-primary/5 border border-primary/10 rounded text-primary"
                          title="Increase Badges"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary/60">Deaths:</span>
                      <span className="font-semibold text-primary">{run.deaths}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {run.teamSprites.map((spriteId, idx) => (
                      <div key={idx} className="w-10 h-10 bg-surface border border-primary/10 rounded flex items-center justify-center overflow-hidden">
                        {spriteId > 0 ? (
                           <img 
                             src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`} 
                             alt={`Pokemon ${spriteId}`}
                             className="w-full h-full object-contain"
                           />
                        ) : (
                           <div className="w-6 h-6 rounded-full bg-primary/10" />
                        )}
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 6 - run.teamSprites.length) }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="w-10 h-10 bg-primary/5 rounded flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-primary/10" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center justify-center gap-3 p-4 bg-surface md:border-l md:border-t-0 border-t border-primary/10">
                  <button 
                    onClick={() => handleDelete(run.id)}
                    className="p-3 text-primary/60 hover:text-danger hover:bg-danger/5 rounded-full transition-colors"
                    title="Delete Run"
                  >
                    <Trash2 size={24} />
                  </button>
                  <button 
                    onClick={() => handleDownload(run)}
                    className="p-3 text-primary/60 hover:text-secondary hover:bg-secondary/5 rounded-full transition-colors"
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
            className="mt-8 text-primary/60 hover:text-primary font-display transition-colors flex items-center gap-2"
          >
            &larr; Back to Start
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
