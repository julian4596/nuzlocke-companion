import { useState } from 'react';
import SaveLoader from '@/components/SaveLoader';
import { GBASaveParser, Pokemon } from '@/lib/GBASaveParser';

export default function App() {
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileLoad = (buffer: ArrayBuffer) => {
    try {
      const parser = new GBASaveParser();
      parser.validateSize(buffer);
      const parsedTeam = parser.parseTeam(buffer);
      setTeam(parsedTeam);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setTeam([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Nuzlocke Companion</h1>
      <SaveLoader onFileLoad={handleFileLoad} />
      
      {error && <div className="text-red-500 mt-4">{error}</div>}
      
      {team.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((pkmn, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow">
                <p className="text-lg">Slot {i + 1}</p>
                <p className="text-sm text-gray-400">PID: {pkmn.pid}</p>
                <p className="text-sm text-gray-400">OTID: {pkmn.otid}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

