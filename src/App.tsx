import { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { SaveManager } from '@/lib/SaveManager';
import { Pokemon, SavedRun } from '@/lib/types';
import { getRuns, saveRun } from '@/lib/db';
import PokemonCard from '@/components/PokemonCard';
import Sidebar from '@/components/Sidebar';
import BoxView from '@/components/BoxView';
import TrainersView, { Trainer, TrainerCapGroup } from '@/components/TrainersView';
import StartScreen from '@/components/StartScreen';
import LoadGameScreen from '@/components/LoadGameScreen';
import trainersDataRaw from '@/data/trainers.json';

const trainersData = trainersDataRaw as Record<string, (TrainerCapGroup | Trainer)[]>;

export default function App() {
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [boxes, setBoxes] = useState<Pokemon[][]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  const [mostRecentRun, setMostRecentRun] = useState<SavedRun | null>(null);
  const [location, setLocation] = useLocation();
  
  // Load runs on mount
  useEffect(() => {
    const fetchRuns = async () => {
      const savedRuns = await getRuns();
      if (savedRuns.length > 0) {
        const sorted = [...savedRuns].sort((a, b) => b.lastPlayed - a.lastPlayed);
        setMostRecentRun(sorted[0]);
        
        // Check if we have an active run to restore
        if (location === '/') {
          const activeRunId = localStorage.getItem('activeRunId');
          if (activeRunId) {
            const activeRun = savedRuns.find(r => r.id === activeRunId);
            if (activeRun) {
              handleLoadRun(activeRun);
            }
          }
        }
      } else {
        setMostRecentRun(null);
      }
    };
    fetchRuns();
  }, [location]); // Re-fetch when view changes back to start/load

  // Handle direct navigation to a run
  useEffect(() => {
    const checkRunData = async () => {
      const match = location.match(/^\/run\/([^/]+)/);
      if (match && team.length === 0) {
        const savedRuns = await getRuns();
        const activeRun = savedRuns.find(r => r.id === match[1]);
        if (activeRun) {
          try {
            const parser = SaveManager.getParser(activeRun.saveBuffer);
            const parsedData = parser.parse(activeRun.saveBuffer);
            setCurrentGame(parsedData.gameVersion);

            const parsedTeam = parser.parseTeam(activeRun.saveBuffer);
            const parsedBoxes = parser.parseBoxes(activeRun.saveBuffer);
            
            if (parsedTeam.length > 0) {
              setTeam(parsedTeam);
              setBoxes(parsedBoxes);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
    checkRunData();
  }, [location, team.length]);

  const handleLoadRun = async (run: SavedRun) => {
    try {
      const parser = SaveManager.getParser(run.saveBuffer);
      const parsedData = parser.parse(run.saveBuffer);
      setCurrentGame(parsedData.gameVersion);

      const parsedTeam = parser.parseTeam(run.saveBuffer);
      const parsedBoxes = parser.parseBoxes(run.saveBuffer);
      
      if (parsedTeam.length === 0) {
        setError(`No valid team data found. The file may be empty or from an unsupported game.`);
        return;
      }
      
      setTeam(parsedTeam);
      setBoxes(parsedBoxes);
      setError(null);
      
      // Update last played
      run.lastPlayed = Date.now();
      await saveRun(run);
      
      localStorage.setItem('activeRunId', run.id);
      setLocation(`/run/${run.id}/party`);
    } catch (e: any) {
      setError(e.message);
      setTeam([]);
      setBoxes([]);
      setCurrentGame(null);
    }
  };

  const renderContent = (currentView: string) => {
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
      let gameTrainers: (TrainerCapGroup | Trainer)[] = [];
      if (currentGame) {
        if (currentGame === 'FRLG') {
          gameTrainers = trainersData['FRLG Venusaur'] || [];
        } else if (currentGame === 'Emerald') {
          gameTrainers = trainersData['Emerald Swampert'] || [];
        } else if (currentGame === 'RubySapphire') {
          gameTrainers = trainersData['RubySapphire Swampert'] || [];
        }
      }
      return <TrainersView trainers={gameTrainers} />;
    }

    return null;
  };

  return (
    <Switch>
      <Route path="/">
        <div className="min-h-screen bg-gray-900 text-white">
          <StartScreen 
            mostRecentRun={mostRecentRun} 
            onContinue={() => mostRecentRun && handleLoadRun(mostRecentRun)} 
            onLoadGameClick={() => setLocation('/load')}
          />
          {error && <div className="absolute top-4 right-4 bg-red-900 text-red-100 px-4 py-2 rounded shadow-lg">{error}</div>}
        </div>
      </Route>
      
      <Route path="/load">
        <LoadGameScreen 
          onBack={() => setLocation('/')} 
          onLoadRun={(run) => handleLoadRun(run)}
        />
      </Route>

      <Route path="/run/:id/:view?">
        {(params) => {
          const runId = params.id;
          const currentView = params.view || 'party';
          
          return (
            <div className="flex h-screen bg-gray-900 overflow-hidden text-gray-200">
              <Sidebar 
                currentView={currentView} 
                runId={runId!}
                currentGame={currentGame} 
                onMainMenu={() => {
                  localStorage.removeItem('activeRunId');
                  setLocation('/');
                }}
              />
              
              <main className="flex-1 overflow-y-auto p-8 bg-gray-900 ml-64">
                <div className="max-w-7xl mx-auto">
                  {renderContent(currentView)}
                </div>
              </main>
            </div>
          );
        }}
      </Route>
    </Switch>
  );
}
