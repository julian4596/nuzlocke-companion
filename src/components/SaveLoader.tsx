import React from 'react';

interface Props {
  onFileLoad: (buffer: ArrayBuffer, fileName: string, fileHandle?: any) => void;
}

export default function SaveLoader({ onFileLoad }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        onFileLoad(buffer, file.name);
      }
    };
    reader.onerror = () => {
      console.error('Error reading save file');
      alert('Failed to read the save file. Please try again.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePicker = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'Save Files', accept: { '*/*': ['.sav', '.dsv'] } }]
        });
        const file = await handle.getFile();
        const buffer = await file.arrayBuffer();
        onFileLoad(buffer, file.name, handle);
      } catch (e) {
        // user cancelled or error
      }
    }
  };

  return (
    <div className="p-6 bg-surface border-4 border-white shadow-brutal-white w-full">
      <label htmlFor="save-upload" className="block text-sm font-mono font-bold uppercase text-text mb-4">
        Upload Save File (.sav)
      </label>
      <div className="flex flex-col gap-4">
        {('showOpenFilePicker' in window) && (
          <button
            type="button"
            onClick={handlePicker}
            className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-surface border-2 border-white shadow-[2px_2px_0_rgba(255,255,255,1)] text-sm font-display font-black uppercase transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            Select Save File
          </button>
        )}
        {('showOpenFilePicker' in window) && (
          <div className="flex items-center">
            <span className="text-text font-mono font-bold text-sm w-full text-center uppercase">or</span>
          </div>
        )}
        <input 
          id="save-upload"
          type="file" 
          accept=".sav,.dsv" 
          aria-label="Upload Save File"
          onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
          onChange={handleFileChange}
          className="block w-full text-sm text-text font-mono font-bold file:mr-4 file:py-2 file:px-4 file:border-2 file:border-white file:text-sm file:font-display file:font-black file:uppercase file:bg-surface file:text-text hover:file:bg-primary hover:file:text-surface file:shadow-[2px_2px_0_rgba(255,255,255,1)] file:transition-all cursor-pointer" 
        />
      </div>
    </div>
  );
}
