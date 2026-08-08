import { useState } from 'react';
import SaveLoader from '@/components/SaveLoader';
import { GBASaveParser, Pokemon } from '@/lib/GBASaveParser';
import PokemonCard from '@/components/PokemonCard';
import Sidebar from '@/components/Sidebar';
import BoxView from '@/components/BoxView';
import TrainersView, { Trainer } from '@/components/TrainersView';
import trainersDataRaw from '@/data/trainers.json';

const trainersData = trainersDataRaw as Record<string, Trainer[]>;

export default function App() {
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [boxes, setBoxes] = useState<Pokemon[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>('party');
  const [saveLoaded, setSaveLoaded] = useState<boolean>(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  const handleFileLoad = (buffer: ArrayBuffer, fileName: string) => {
    try {
      const gameName = fileName.replace(/\.sav$/i, '').replace(/\.dsv$/i, '');
      setCurrentGame(gameName);

      const parser = new GBASaveParser();
      parser.validateSize(buffer);
      const parsedTeam = parser.parseTeam(buffer);
      const parsedBoxes = parser.parseBoxes(buffer);
      
      if (parsedTeam.length === 0) {
        setError("No valid team data found. Make sure this is a valid Gen 3 GBA save file.");
        setTeam([]);
        setBoxes([]);
        setSaveLoaded(false);
        setCurrentGame(null);
      } else {
        setTeam(parsedTeam);
        setBoxes(parsedBoxes);
        setError(null);
        setSaveLoaded(true);
        setCurrentView('party');
      }
    } catch (e: any) {
      setError(e.message);
      setTeam([]);
      setBoxes([]);
      setSaveLoaded(false);
      setCurrentGame(null);
    }
  };

  const renderContent = () => {
    if (currentView === 'party') {
      return (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Your Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((pkmn, i) => (
              <PokemonCard key={i} pkmn={pkmn} isBox={false} />
            ))}
          </div>
        </div>
      );
    }

    if (currentView === 'boxes') {
      const allBoxData = boxes.slice(0, 13).flat();
      return <BoxView title="PC Storage (Boxes 1-13)" boxData={allBoxData} />;
    }

    if (currentView === 'graveyard') {
      const graveyardData = boxes[13] || [];
      return <BoxView title="💀 Graveyard (Box 14)" boxData={graveyardData} />;
    }

    if (currentView === 'trainers') {
      let gameTrainers: Trainer[] = [];
      if (currentGame) {
        const current = currentGame.toLowerCase();
        const searchParts = current.replace('pokemon', '').trim().split(/[\s\-]+/);
        if (searchParts.length > 0 && searchParts[0] !== '') {
          const matchingKey = Object.keys(trainersData).find(key => {
            const target = key.toLowerCase();
            if (target === current) return true;
            return searchParts.every(part => target.includes(part));
          });
          if (matchingKey) {
            gameTrainers = trainersData[matchingKey];
          }
        }
      }
      return <TrainersView trainers={gameTrainers} />;
    }

    return null;
  };

  if (!saveLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Nuzlocke Companion</h1>
        <SaveLoader onFileLoad={handleFileLoad} />
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden text-gray-200">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} currentGame={currentGame} />
      
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

