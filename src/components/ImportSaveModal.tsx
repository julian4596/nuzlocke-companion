import React, { useState } from 'react';
import { X } from 'lucide-react';
import SaveLoader from './SaveLoader';

export default function ImportSaveModal(props: { 
  isOpen: boolean; 
  onClose: () => void; 
  onImport: (name: string, buffer: ArrayBuffer) => void 
}) {
  const [name, setName] = useState('');
  const [saveBuffer, setSaveBuffer] = useState<ArrayBuffer | null>(null);

  if (!props.isOpen) return null;

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveBuffer && name) {
      props.onImport(name, saveBuffer);
      // Reset state for next time
      setName('');
      setSaveBuffer(null);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setName('');
    setSaveBuffer(null);
    props.onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Import Saved Game</h2>
          <button 
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {!saveBuffer ? (
            <div className="flex flex-col items-center">
              <p className="text-slate-300 mb-6 text-center text-sm">
                Select your Nuzlocke companion save file to import your progress.
              </p>
              <SaveLoader onFileLoad={(buffer) => setSaveBuffer(buffer)} />
            </div>
          ) : (
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Run Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., FireRed Hardcore Nuzlocke"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              

              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSaveBuffer(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!name}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Run
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
