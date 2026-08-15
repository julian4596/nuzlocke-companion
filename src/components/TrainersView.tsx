import { useState } from 'react';

export interface TrainerPokemon {
  species: string;
  level: string;
  moves: string[];
  hp?: string;
  atk?: string;
  def?: string;
  spa?: string;
  spd?: string;
  spe?: string;
}

export interface Trainer {
  name: string;
  money: string;
  route: string;
  location: string;
  team: TrainerPokemon[];
}

export interface TrainerCapGroup {
  cap: string;
  level?: string;
  trainers: Trainer[];
}

interface Props {
  trainers: (TrainerCapGroup | Trainer)[];
}

function isCapGroup(item: unknown): item is TrainerCapGroup {
  return item !== null && typeof item === 'object' && 'cap' in item && Array.isArray((item as TrainerCapGroup).trainers);
}

export default function TrainersView({ trainers }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  if (!trainers || trainers.length === 0) {
    return <div className="text-primary/60 font-sans">No trainers found for this game.</div>;
  }

  const groups: TrainerCapGroup[] = isCapGroup(trainers[0])
    ? (trainers as TrainerCapGroup[])
    : [{ cap: 'All Trainers', trainers: trainers as Trainer[] }];

  const toggleGroup = (index: number) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div>
      <h2 className="text-4xl font-display font-black uppercase text-primary drop-shadow-[2px_2px_0_rgba(255,255,255,1)] mb-8">Trainers Guide</h2>
      <div className="space-y-8">
        {groups.map((group, groupIndex) => {
          const isExpanded = expandedGroups.has(groupIndex);
          return (
            <div key={groupIndex} className="space-y-4">
              <button 
                onClick={() => toggleGroup(groupIndex)}
                className="w-full text-left flex items-center justify-between text-2xl font-display font-black uppercase text-text p-4 border-4 border-white bg-surface shadow-brutal-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-primary hover:text-surface transition-all cursor-pointer"
              >
                <span>Cap: {group.cap} {group.level ? `(Lv. ${group.level})` : ''}</span>
                <span className="text-sm font-mono font-bold uppercase">{isExpanded ? '▲ Hide' : '▼ Show'}</span>
              </button>

              {isExpanded && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {group.trainers.map((trainer, index) => (
                <div key={index} className="bg-surface p-5 border-4 border-white shadow-brutal-white">
                  <div className="flex justify-between items-start mb-4 border-b-4 border-white pb-3">
                    <div>
                      <h4 className="text-2xl font-display font-black uppercase text-secondary drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">{trainer.name || "Unknown Trainer"}</h4>
                      <div className="text-sm text-text font-mono font-bold mt-1 uppercase">
                        {trainer.route} {trainer.location ? `- ${trainer.location}` : ''}
                      </div>
                    </div>
                    {trainer.money && (
                      <div className="text-sm font-mono font-black text-surface bg-warning border-2 border-white px-2 py-1 shadow-[2px_2px_0_rgba(255,255,255,1)]">
                        ¥{trainer.money}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {trainer.team.map((pkmn, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-3 border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)]">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-display font-black uppercase text-primary">{pkmn.species}</span>
                            <span className="text-xs font-mono font-black text-surface bg-primary px-2 py-0.5 border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)]">
                              Lv. {pkmn.level}
                            </span>
                          </div>
                          {pkmn.hp && (
                            <div className="text-[10px] font-mono font-bold text-text mt-1 mb-2 uppercase">
                              HP {pkmn.hp} | Atk {pkmn.atk} | Def {pkmn.def} | SpA {pkmn.spa} | SpD {pkmn.spd} | Spe {pkmn.spe}
                            </div>
                          )}
                        </div>
                        
                        {pkmn.moves && pkmn.moves.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                            {pkmn.moves.map((move, mi) => (
                              <span key={mi} className="text-[10px] font-mono uppercase tracking-wider bg-surface border-2 border-white text-text px-2 py-1 shadow-[2px_2px_0_rgba(255,255,255,1)] font-bold">
                                {move}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

