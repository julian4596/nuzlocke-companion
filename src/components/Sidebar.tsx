import { Link } from 'wouter';

interface SidebarProps {
  currentView: string;
  runId: string;
  currentGame?: string | null;
  onMainMenu?: () => void;
}

export default function Sidebar({ currentView, runId, onMainMenu }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Nuzlocke</h2>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Party</h3>
          <Link href={`/run/${runId}/party`} className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'party'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}>
            Your Team
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">PC Storage</h3>
          <Link href={`/run/${runId}/boxes`} className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'boxes'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}>
            PC Boxes (1-13)
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-red-900 uppercase tracking-wider mb-2">Graveyard</h3>
          <Link href={`/run/${runId}/graveyard`} className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border border-transparent ${
              currentView === 'graveyard'
                ? 'bg-red-900/50 border-red-800 text-red-200'
                : 'text-red-400 hover:bg-red-950/30 hover:border-red-900 hover:text-red-300'
            }`}>
            💀 Dead Pokémon
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Guides</h3>
          <Link href={`/run/${runId}/trainers`} className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'trainers'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}>
            Trainers & Caps
          </Link>
        </div>
      </div>
      
      {onMainMenu && (
        <div className="p-4 border-t border-gray-800 mt-auto absolute bottom-0 w-64 bg-gray-900">
          <button
            onClick={onMainMenu}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Main Menu
          </button>
        </div>
      )}
    </div>
  );
}
