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
      <h2 className="text-2xl font-display font-bold mb-6 text-primary">Trainers Guide</h2>
      <div className="space-y-8">
        {groups.map((group, groupIndex) => {
          const isExpanded = expandedGroups.has(groupIndex);
          return (
            <div key={groupIndex} className="space-y-4">
              <button 
                onClick={() => toggleGroup(groupIndex)}
                className="w-full text-left flex items-center justify-between text-xl font-display font-bold text-primary pb-2 border-b border-primary/20 hover:text-primary/80 transition-colors cursor-pointer"
              >
                <span>Cap: {group.cap} {group.level ? `(Lv. ${group.level})` : ''}</span>
                <span className="text-sm font-sans">{isExpanded ? '▲ Hide' : '▼ Show'}</span>
              </button>

              {isExpanded && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {group.trainers.map((trainer, index) => (
                <div key={index} className="bg-white rounded-lg p-5 border border-primary/20 shadow-sm">
                  <div className="flex justify-between items-start mb-4 border-b border-primary/10 pb-3">
                    <div>
                      <h4 className="text-lg font-display font-bold text-secondary">{trainer.name || "Unknown Trainer"}</h4>
                      <div className="text-sm text-primary/60 mt-1">
                        {trainer.route} {trainer.location ? `- ${trainer.location}` : ''}
                      </div>
                    </div>
                    {trainer.money && (
                      <div className="text-sm font-medium text-warning bg-warning/5 border border-warning/10 px-2 py-1 rounded">
                        ¥{trainer.money}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {trainer.team.map((pkmn, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-3 rounded border border-primary/10">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-display font-bold text-primary">{pkmn.species}</span>
                            <span className="text-xs font-mono font-bold text-white bg-secondary px-2 py-0.5 rounded-full">
                              Lv. {pkmn.level}
                            </span>
                          </div>
                          {pkmn.hp && (
                            <div className="text-[10px] font-mono text-primary/60 mt-1 mb-2">
                              HP {pkmn.hp} | Atk {pkmn.atk} | Def {pkmn.def} | SpA {pkmn.spa} | SpD {pkmn.spd} | Spe {pkmn.spe}
                            </div>
                          )}
                        </div>
                        
                        {pkmn.moves && pkmn.moves.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2 sm:mt-0">
                            {pkmn.moves.map((move, mi) => (
                              <span key={mi} className="text-[10px] font-mono uppercase tracking-wider bg-white border border-primary/20 text-primary px-2 py-1 rounded">
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

