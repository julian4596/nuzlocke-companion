import { Link } from 'wouter';

interface SidebarProps {
  currentView: string;
  runId: string;
  currentGame?: string | null;
  onMainMenu?: () => void;
}

export default function Sidebar({ currentView, runId, onMainMenu }: SidebarProps) {
  return (
    <div className="w-64 border-r border-primary/10 h-screen overflow-y-auto flex-shrink-0 bg-surface">
      <div className="p-4 border-b border-primary/10">
        <h2 className="text-xl font-display font-bold text-primary">Nuzlocke</h2>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-primary/60 uppercase tracking-wider mb-2">Party</h3>
          <Link href={`/run/${runId}/party`} className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'party'
                ? 'bg-primary/5 text-primary'
                : 'text-text hover:bg-primary/5 hover:text-primary'
            }`}>
            Your Team
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-primary/60 uppercase tracking-wider mb-2">PC Storage</h3>
          <Link href={`/run/${runId}/boxes`} className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'boxes'
                ? 'bg-primary/5 text-primary'
                : 'text-text hover:bg-primary/5 hover:text-primary'
            }`}>
            PC Boxes (1-13)
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-danger uppercase tracking-wider mb-2">Graveyard</h3>
          <Link href={`/run/${runId}/graveyard`} className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
              currentView === 'graveyard'
                ? 'bg-danger/5 border-danger/20 text-danger'
                : 'border-transparent text-danger hover:bg-danger/5 hover:border-danger/20'
            }`}>
            💀 Dead Pokémon
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-primary/60 uppercase tracking-wider mb-2">Guides</h3>
          <Link href={`/run/${runId}/trainers`} className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'trainers'
                ? 'bg-primary/5 text-primary'
                : 'text-text hover:bg-primary/5 hover:text-primary'
            }`}>
            Trainers & Caps
          </Link>
        </div>
      </div>
      
      {onMainMenu && (
        <div className="p-4 border-t border-primary/10 mt-auto absolute bottom-0 w-64 bg-surface">
          <button
            onClick={onMainMenu}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-primary/60 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2"
          >
            ← Main Menu
          </button>
        </div>
      )}
    </div>
  );
}
