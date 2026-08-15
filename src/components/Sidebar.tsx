import { Link } from 'wouter';

interface SidebarProps {
  currentView: string;
  runId: string;
  currentGame?: string | null;
  onMainMenu?: () => void;
}

export default function Sidebar({ currentView, runId, onMainMenu }: SidebarProps) {
  return (
    <div className="w-64 bg-surface border-r-4 border-white h-screen flex flex-col flex-shrink-0 shadow-[4px_0_0_rgba(255,255,255,1)] relative z-10">
      <div className="p-6 border-b-4 border-white">
        <h1 className="text-2xl font-black font-display text-text uppercase drop-shadow-[2px_2px_0_rgba(253,200,0,1)] tracking-tight">
          Nuzlocke Companion
        </h1>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-text uppercase tracking-widest mb-2 font-mono">Party</h3>
          <Link href={`/run/${runId}/party`} className={`block w-full text-left px-4 py-3 text-sm font-bold uppercase transition-all ${
              currentView === 'party'
                ? 'bg-primary text-surface border-2 border-white shadow-brutal-white translate-x-1 translate-y-1'
                : 'bg-surface text-text border-2 border-transparent hover:border-white hover:bg-primary hover:text-surface hover:shadow-brutal-white hover:-translate-y-1 hover:-translate-x-1'
            }`}>
            Your Team
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-bold text-text uppercase tracking-widest mb-2 font-mono">PC Storage</h3>
          <Link href={`/run/${runId}/boxes`} className={`block w-full text-left px-4 py-3 text-sm font-bold uppercase transition-all ${
              currentView === 'boxes'
                ? 'bg-primary text-surface border-2 border-white shadow-brutal-white translate-x-1 translate-y-1'
                : 'bg-surface text-text border-2 border-transparent hover:border-white hover:bg-primary hover:text-surface hover:shadow-brutal-white hover:-translate-y-1 hover:-translate-x-1'
            }`}>
            PC Boxes (1-13)
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-bold text-danger uppercase tracking-widest mb-2 font-mono">Graveyard</h3>
          <Link href={`/run/${runId}/graveyard`} className={`block w-full text-left px-4 py-3 text-sm font-bold uppercase transition-all ${
              currentView === 'graveyard'
                ? 'bg-danger text-white border-2 border-white shadow-brutal-white translate-x-1 translate-y-1'
                : 'bg-surface text-danger border-2 border-transparent hover:border-white hover:bg-danger hover:text-white hover:shadow-brutal-white hover:-translate-y-1 hover:-translate-x-1'
            }`}>
            💀 Dead Pokémon
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-bold text-text uppercase tracking-widest mb-2 font-mono">Guides</h3>
          <Link href={`/run/${runId}/trainers`} className={`block w-full text-left px-4 py-3 text-sm font-bold uppercase transition-all ${
              currentView === 'trainers'
                ? 'bg-primary text-surface border-2 border-white shadow-brutal-white translate-x-1 translate-y-1'
                : 'bg-surface text-text border-2 border-transparent hover:border-white hover:bg-primary hover:text-surface hover:shadow-brutal-white hover:-translate-y-1 hover:-translate-x-1'
            }`}>
            Trainers & Caps
          </Link>
        </div>
      </div>
      
      {onMainMenu && (
        <div className="p-4 border-t-4 border-white mt-auto absolute bottom-0 w-64 bg-surface">
          <button
            onClick={onMainMenu}
            className="w-full text-left px-4 py-3 text-sm font-bold uppercase text-text hover:bg-white hover:text-surface border-2 border-transparent hover:border-white hover:shadow-brutal-white transition-all flex items-center gap-2 hover:-translate-y-1 hover:-translate-x-1"
          >
            ← Main Menu
          </button>
        </div>
      )}
    </div>
  );
}
