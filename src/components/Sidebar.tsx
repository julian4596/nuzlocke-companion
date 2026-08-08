import { useState } from 'react';
import levelCapsData from '../data/levelCaps.json';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentGame?: string | null;
}

export default function Sidebar({ currentView, onViewChange, currentGame }: SidebarProps) {
  const pcBoxes = Array.from({ length: 13 }, (_, i) => i + 1);
  const [boxesOpen, setBoxesOpen] = useState(false);

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Nuzlocke</h2>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Party</h3>
          <button
            onClick={() => onViewChange('party')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'party'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Your Team
          </button>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">PC Storage</h3>
          <button
            onClick={() => onViewChange('boxes')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'boxes'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            PC Boxes (1-13)
          </button>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-red-900 uppercase tracking-wider mb-2">Graveyard</h3>
          <button
            onClick={() => onViewChange('graveyard')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border border-transparent ${
              currentView === 'graveyard'
                ? 'bg-red-900/50 border-red-800 text-red-200'
                : 'text-red-400 hover:bg-red-950/30 hover:border-red-900 hover:text-red-300'
            }`}
          >
            💀 Dead Pokémon
          </button>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Guides</h3>
          <button
            onClick={() => onViewChange('trainers')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'trainers'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Trainers & Caps
          </button>
        </div>
        </div>
        
        {currentGame && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">
              Level Caps: {currentGame}
            </h3>
            {(() => {
              const gameData = levelCapsData.find(g => {
                const target = g.game.toLowerCase();
                const current = currentGame.toLowerCase();
                if (target === current) return true;
                
                const searchParts = current.replace('pokemon', '').trim().split(/[\s\-]+/);
                if (searchParts.length === 0 || searchParts[0] === '') return false;
                
                return searchParts.every(part => target.includes(part));
              });
              
              if (!gameData || gameData.caps.length === 0) {
                return <div className="text-sm text-gray-400 px-3 py-2 bg-gray-800/50 rounded-md">No caps found</div>;
              }
              
              return (
                <ul className="space-y-1">
                  {gameData.caps.map((cap, i) => (
                    <li key={i} className="text-xs flex justify-between items-center px-3 py-2 bg-gray-800 rounded-md shadow-sm border border-gray-700">
                      <span className="text-gray-300 truncate mr-2 font-medium" title={cap.name}>{cap.name}</span>
                      <span className="text-blue-400 font-bold bg-blue-900/30 px-2 py-0.5 rounded text-[11px]">Lv. {cap.level}</span>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
        )}
    </div>
  );
}
