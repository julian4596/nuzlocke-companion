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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm p-4">
      <div className="bg-surface border border-primary/20 rounded-xl shadow-md w-full max-w-md overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b border-primary/10">
          <h2 className="text-xl font-display font-bold text-primary">Import Saved Game</h2>
          <button 
            onClick={handleClose}
            className="p-1 rounded-full text-primary/60 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {!saveBuffer ? (
            <div className="flex flex-col items-center">
              <p className="text-primary/80 mb-6 text-center text-sm">
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
                <label className="block text-sm font-display font-medium text-primary/80 mb-1">
                  Run Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., FireRed Hardcore Nuzlocke"
                  className="w-full bg-white border border-primary/20 rounded-lg px-4 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              

              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSaveBuffer(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-primary bg-white border border-primary/20 hover:bg-surface transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!name}
                  className="px-4 py-2 rounded-lg text-sm font-display font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
