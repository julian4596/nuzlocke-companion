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
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h2 className="text-3xl font-bold mb-4 text-white">Set Up Your Graveyard</h2>
        <p className="text-gray-400 mb-8 max-w-lg text-center leading-relaxed">
          Select which PC boxes you are using for your dead Pokémon. The deaths counter will automatically update based on the contents of these boxes.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8 w-full max-w-4xl">
          {boxes.map((_, i) => (
            <button
              key={i}
              onClick={() => toggleBox(i)}
              className={`p-3 rounded-lg border-2 font-medium transition-colors flex items-center justify-center gap-2 ${
                selectedBoxes.includes(i) 
                  ? 'border-red-500 bg-red-500/20 text-white' 
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-500'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border ${selectedBoxes.includes(i) ? 'bg-red-500 border-red-500' : 'border-neutral-500'}`} />
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
              className="px-6 py-2 rounded-md font-medium bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={selectedBoxes.length === 0}
            className="px-6 py-2 rounded-md font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Graveyard
          </button>
        </div>
      </div>
    );
  }

  const graveyardData = (activeRun.graveyardBoxes || []).map(idx => boxes[idx] || []).flat();

  console.log('--- GRAVEYARD DEBUG ---');
  console.log('activeRun.graveyardBoxes:', activeRun.graveyardBoxes);
  console.log('graveyardData.length:', graveyardData.length);
  console.log('boxes array length:', boxes.length);
  console.log('First selected box contents:', activeRun.graveyardBoxes?.[0] !== undefined ? boxes[activeRun.graveyardBoxes[0]] : 'None');
  console.log('-----------------------');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">💀 Graveyard</h2>
        <button 
          onClick={() => setEditingMode(true)}
          className="text-sm bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-md transition-colors"
        >
          Change Boxes
        </button>
      </div>
      <BoxView title="" boxData={graveyardData} />
    </div>
  );
}
