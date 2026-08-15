import { useState } from 'react';
import { Pokemon, SavedRun } from '@/lib/types';
import BoxView from './BoxView';

interface GraveyardViewProps {
  boxes: Pokemon[][];
  activeRun: SavedRun;
  onUpdateRun: (updatedRun: SavedRun) => void;
}

export default function GraveyardView({ boxes, activeRun, onUpdateRun }: GraveyardViewProps) {
  const isEditing = !activeRun.graveyardBoxes || activeRun.graveyardBoxes.length === 0;
  const [editingMode, setEditingMode] = useState(isEditing);
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>(activeRun.graveyardBoxes || []);

  const handleSave = () => {
    let deaths = 0;
    for (const idx of selectedBoxes) {
      if (boxes[idx]) {
        deaths += boxes[idx].filter(p => p.speciesId && p.speciesId > 0).length;
      }
    }
    onUpdateRun({
      ...activeRun,
      graveyardBoxes: selectedBoxes,
      deaths
    });
    setEditingMode(false);
  };

  const toggleBox = (index: number) => {
    if (selectedBoxes.includes(index)) {
      setSelectedBoxes(selectedBoxes.filter(i => i !== index));
    } else {
      setSelectedBoxes([...selectedBoxes, index].sort((a, b) => a - b));
    }
  };

  if (editingMode) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-surface">
        <h2 className="text-4xl font-display font-black uppercase text-danger drop-shadow-[2px_2px_0_rgba(255,255,255,1)] mb-6">Set Up Your Graveyard</h2>
        <p className="text-text font-mono font-bold mb-8 max-w-lg text-center leading-relaxed">
          Select which PC boxes you are using for your dead Pokémon. The deaths counter will automatically update based on the contents of these boxes.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8 w-full max-w-4xl">
          {boxes.map((_, i) => (
            <button
              key={i}
              onClick={() => toggleBox(i)}
              className={`p-4 rounded-none border-2 font-black font-mono uppercase transition-all flex items-center justify-center gap-3 ${
                selectedBoxes.includes(i) 
                  ? 'border-white bg-danger text-white shadow-none translate-x-1 translate-y-1' 
                  : 'border-white bg-surface text-text shadow-[4px_4px_0_rgba(255,255,255,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-none hover:bg-text hover:text-surface'
              }`}
            >
              <div className={`w-4 h-4 rounded-none border-2 ${selectedBoxes.includes(i) ? 'bg-white border-white' : 'border-white bg-surface'}`} />
              Box {i + 1}
            </button>
          ))}
        </div>
        <div className="flex gap-4">
          {!isEditing && (
            <button 
              onClick={() => {
                setSelectedBoxes(activeRun.graveyardBoxes || []);
                setEditingMode(false);
              }}
              className="px-6 py-3 rounded-none font-bold font-mono uppercase bg-surface border-2 border-white hover:bg-text hover:text-surface shadow-[4px_4px_0_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none text-text transition-all"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={selectedBoxes.length === 0}
            className="px-6 py-3 rounded-none font-display font-black uppercase bg-danger border-2 border-white text-white shadow-[4px_4px_0_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Graveyard
          </button>
        </div>
      </div>
    );
  }

  const graveyardData = (activeRun.graveyardBoxes || []).map(idx => boxes[idx] || []).flat();


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-display font-black uppercase text-danger drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">💀 Graveyard</h2>
        <button 
          onClick={() => setEditingMode(true)}
          className="text-sm bg-surface border-2 border-white text-text px-4 py-2 rounded-none font-bold font-mono uppercase shadow-[2px_2px_0_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none hover:bg-text hover:text-surface transition-all"
        >
          Change Boxes
        </button>
      </div>
      <BoxView title="" boxData={graveyardData} />
    </div>
  );
}
