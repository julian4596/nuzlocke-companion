import { Link } from 'wouter';

interface SidebarProps {
  currentView: string;
  runId: string;
  currentGame?: string | null;
  onMainMenu?: () => void;
  onResumeSync?: () => void;
}

export default function Sidebar({ currentView, runId, currentGame, onMainMenu, onResumeSync }: SidebarProps) {
  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b-4 border-white flex items-center justify-between px-4 z-50 shadow-[0_4px_0_rgba(255,255,255,1)]">
        <h1 className="text-xl font-black font-display text-text uppercase drop-shadow-[2px_2px_0_rgba(253,200,0,1)] tracking-tight truncate flex-1">
          Nuzlocke
        </h1>
        <div className="flex gap-2 items-center">
          {onResumeSync && (
            <button
              onClick={onResumeSync}
              className="text-xs font-bold uppercase text-primary bg-surface px-3 py-2 border-2 border-primary shadow-brutal-white active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            >
              Sync
            </button>
          )}
          {onMainMenu && (
            <button
              onClick={onMainMenu}
              className="text-xs font-bold uppercase text-text bg-surface px-3 py-2 border-2 border-white shadow-brutal-white active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            >
              Menu
            </button>
          )}
        </div>
      </div>

      {/* Desktop Sidebar / Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-16 md:h-screen w-full md:w-64 bg-surface md:border-r-4 md:border-t-0 border-t-4 border-white flex flex-row md:flex-col flex-shrink-0 shadow-[0_-4px_0_rgba(255,255,255,1)] md:shadow-[4px_0_0_rgba(255,255,255,1)] md:relative z-40 overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Desktop Header */}
        <div className="hidden md:block p-6 border-b-4 border-white shrink-0">
          <h1 className="text-2xl font-black font-display text-text uppercase drop-shadow-[2px_2px_0_rgba(253,200,0,1)] tracking-tight">
            Nuzlocke Companion
          </h1>
        </div>
        
        {/* Nav Links */}
        <div className="flex flex-row md:flex-col md:p-4 md:space-y-6 flex-1 items-center md:items-stretch overflow-x-auto px-2 md:px-0 gap-2 md:gap-0 h-full md:h-auto">
          
          <div className="flex flex-row md:flex-col gap-2 md:gap-0 shrink-0">
            <h3 className="hidden md:block text-xs font-bold text-text uppercase tracking-widest mb-2 font-mono">Party</h3>
            <Link href={`/run/${runId}/party`} className={`shrink-0 flex items-center justify-center md:block md:w-full text-center md:text-left px-3 py-2 md:px-4 md:py-3 text-sm font-bold uppercase transition-all md:mb-2 ${
                currentView === 'party'
                  ? 'bg-primary text-surface border-2 border-white shadow-brutal-white md:translate-x-1 md:translate-y-1'
                  : 'bg-surface text-text border-2 border-transparent md:hover:border-white md:hover:bg-primary md:hover:text-surface md:hover:shadow-brutal-white md:hover:-translate-y-1 md:hover:-translate-x-1'
              }`}>
              <span className="md:hidden">Team</span>
              <span className="hidden md:inline">Your Team</span>
            </Link>
            <Link href={`/run/${runId}/frags`} className={`shrink-0 flex items-center justify-center md:block md:w-full text-center md:text-left px-3 py-2 md:px-4 md:py-3 text-sm font-bold uppercase transition-all ${
                currentView === 'frags'
                  ? 'bg-primary text-surface border-2 border-white shadow-brutal-white md:translate-x-1 md:translate-y-1'
                  : 'bg-surface text-text border-2 border-transparent md:hover:border-white md:hover:bg-primary md:hover:text-surface md:hover:shadow-brutal-white md:hover:-translate-y-1 md:hover:-translate-x-1'
              }`}>
              <span className="md:hidden">⚔️ Frags</span>
              <span className="hidden md:inline">⚔️ KOs / Frags</span>
            </Link>
          </div>

          <div className="flex flex-row md:flex-col shrink-0">
            <h3 className="hidden md:block text-xs font-bold text-text uppercase tracking-widest mb-2 font-mono">PC Storage</h3>
            <Link href={`/run/${runId}/boxes`} className={`shrink-0 flex items-center justify-center md:block md:w-full text-center md:text-left px-3 py-2 md:px-4 md:py-3 text-sm font-bold uppercase transition-all ${
                currentView === 'boxes'
                  ? 'bg-primary text-surface border-2 border-white shadow-brutal-white md:translate-x-1 md:translate-y-1'
                  : 'bg-surface text-text border-2 border-transparent md:hover:border-white md:hover:bg-primary md:hover:text-surface md:hover:shadow-brutal-white md:hover:-translate-y-1 md:hover:-translate-x-1'
              }`}>
              <span className="md:hidden">Boxes</span>
              <span className="hidden md:inline">PC Boxes (1-13)</span>
            </Link>
          </div>

          <div className="flex flex-row md:flex-col shrink-0">
            <h3 className="hidden md:block text-xs font-bold text-danger uppercase tracking-widest mb-2 font-mono">Graveyard</h3>
            <Link href={`/run/${runId}/graveyard`} className={`shrink-0 flex items-center justify-center md:block md:w-full text-center md:text-left px-3 py-2 md:px-4 md:py-3 text-sm font-bold uppercase transition-all ${
                currentView === 'graveyard'
                  ? 'bg-danger text-white border-2 border-white shadow-brutal-white md:translate-x-1 md:translate-y-1'
                  : 'bg-surface text-danger border-2 border-transparent md:hover:border-white md:hover:bg-danger md:hover:text-white md:hover:shadow-brutal-white md:hover:-translate-y-1 md:hover:-translate-x-1'
              }`}>
              <span className="md:hidden">💀 Dead</span>
              <span className="hidden md:inline">💀 Dead Pokémon</span>
            </Link>
          </div>

          <div className="flex flex-row md:flex-col shrink-0">
            <h3 className="hidden md:block text-xs font-bold text-text uppercase tracking-widest mb-2 font-mono">Guides</h3>
            <Link href={`/run/${runId}/trainers`} className={`shrink-0 flex items-center justify-center md:block md:w-full text-center md:text-left px-3 py-2 md:px-4 md:py-3 text-sm font-bold uppercase transition-all ${
                currentView === 'trainers'
                  ? 'bg-primary text-surface border-2 border-white shadow-brutal-white md:translate-x-1 md:translate-y-1'
                  : 'bg-surface text-text border-2 border-transparent md:hover:border-white md:hover:bg-primary md:hover:text-surface md:hover:shadow-brutal-white md:hover:-translate-y-1 md:hover:-translate-x-1'
              }`}>
              <span className="md:hidden">Caps</span>
              <span className="hidden md:inline">Trainers & Caps</span>
            </Link>
          </div>
        </div>
        
        {/* Desktop Main Menu Button & Sync */}
        <div className="hidden md:flex flex-col gap-2 p-4 border-t-4 border-white mt-auto absolute bottom-0 w-64 bg-surface">
          {onResumeSync && (
            <button
              onClick={onResumeSync}
              className="w-full text-center px-4 py-3 text-sm font-bold uppercase text-primary border-2 border-primary hover:bg-primary hover:text-surface hover:shadow-brutal-white transition-all flex items-center justify-center gap-2 hover:-translate-y-1 hover:-translate-x-1"
            >
              Resume Auto-Sync
            </button>
          )}
          {onMainMenu && (
            <button
              onClick={onMainMenu}
              className="w-full text-left px-4 py-3 text-sm font-bold uppercase text-text hover:bg-white hover:text-surface border-2 border-transparent hover:border-white hover:shadow-brutal-white transition-all flex items-center gap-2 hover:-translate-y-1 hover:-translate-x-1"
            >
              ← Main Menu
            </button>
          )}
        </div>
      </div>
    </>
  );
}
