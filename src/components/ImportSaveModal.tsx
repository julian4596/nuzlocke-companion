import React, { useState } from 'react';
import { X } from 'lucide-react';
import SaveLoader from './SaveLoader';

export default function ImportSaveModal(props: { 
  isOpen: boolean; 
  onClose: () => void; 
  onImport: (name: string, buffer: ArrayBuffer, fileHandle?: any) => void 
}) {
  const [name, setName] = useState('');
  const [saveBuffer, setSaveBuffer] = useState<ArrayBuffer | null>(null);
  const [fileHandle, setFileHandle] = useState<any>(null);

  if (!props.isOpen) return null;

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveBuffer && name) {
      props.onImport(name, saveBuffer, fileHandle);
      // Reset state for next time
      setName('');
      setSaveBuffer(null);
      setFileHandle(null);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setName('');
    setSaveBuffer(null);
    setFileHandle(null);
    props.onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm p-4">
      <div className="bg-surface border-4 border-white shadow-brutal-white w-full max-w-md overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b-4 border-white">
          <h2 className="text-2xl font-display font-black uppercase text-primary">Import Saved Game</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-text hover:bg-danger hover:text-white border-2 border-transparent hover:border-white hover:shadow-[2px_2px_0_rgba(255,255,255,1)] font-bold transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>
        
        <div className="p-6">
          {!saveBuffer ? (
            <div className="flex flex-col items-center">
              <p className="text-text font-mono font-bold mb-6 text-center text-sm">
                Select your Nuzlocke companion save file to import your progress.
              </p>
              <SaveLoader onFileLoad={(buffer, _fileName, handle) => {
                setSaveBuffer(buffer);
                setFileHandle(handle);
              }} />
            </div>
          ) : (
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-sm font-mono font-bold text-text uppercase mb-2">
                  Run Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., FireRed Hardcore Nuzlocke"
                  className="w-full bg-surface border-2 border-white px-4 py-3 text-text font-mono font-bold focus:outline-none focus:border-primary shadow-[2px_2px_0_rgba(255,255,255,1)] focus:shadow-[2px_2px_0_rgba(253,200,0,1)] transition-colors"
                />
              </div>
              

              
              <div className="pt-4 flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setSaveBuffer(null)}
                  className="px-6 py-3 text-sm font-bold font-mono text-text bg-surface border-2 border-white hover:bg-text hover:text-surface shadow-[4px_4px_0_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!name}
                  className="px-6 py-3 text-sm font-display font-black text-surface bg-primary border-4 border-white shadow-[4px_4px_0_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase"
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
