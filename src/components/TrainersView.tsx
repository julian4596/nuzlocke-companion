import React from 'react';

export interface TrainerPokemon {
  species: string;
  level: string;
  moves: string[];
}

export interface Trainer {
  name: string;
  money: string;
  route: string;
  location: string;
  team: TrainerPokemon[];
}

interface Props {
  trainers: Trainer[];
}

export default function TrainersView({ trainers }: Props) {
  if (!trainers || trainers.length === 0) {
    return <div className="text-gray-400">No trainers found for this game.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-white">Trainers Guide</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {trainers.map((trainer, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-5 border border-gray-700 shadow-md">
            <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-blue-400">{trainer.name || "Unknown Trainer"}</h3>
                <div className="text-sm text-gray-400 mt-1">
                  {trainer.route} {trainer.location ? `- ${trainer.location}` : ''}
                </div>
              </div>
              {trainer.money && (
                <div className="text-sm font-medium text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded">
                  ¥{trainer.money}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {trainer.team.map((pkmn, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-900 p-3 rounded border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <span className="font-semibold text-gray-200">{pkmn.species}</span>
                    <span className="text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full">
                      Lv. {pkmn.level}
                    </span>
                  </div>
                  
                  {pkmn.moves.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pkmn.moves.map((move, mi) => (
                        <span key={mi} className="text-[10px] uppercase tracking-wider bg-gray-700 text-gray-300 px-2 py-1 rounded">
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
    </div>
  );
}
