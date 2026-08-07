import { useState } from 'react';
import SaveLoader from './components/SaveLoader';

export default function App() {
  const [saveLoaded, setSaveLoaded] = useState<boolean>(false);
  const [bufferSize, setBufferSize] = useState<number | null>(null);

  const handleFileLoad = (buffer: ArrayBuffer) => {
    setSaveLoaded(true);
    setBufferSize(buffer.byteLength);
    console.log('Save file loaded, size:', buffer.byteLength);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Nuzlocke Save Tracker</h1>
      <SaveLoader onFileLoad={handleFileLoad} />
      {saveLoaded && bufferSize !== null && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-green-400 font-medium">Save file loaded successfully ({bufferSize} bytes)</p>
        </div>
      )}
    </div>
  );
}
