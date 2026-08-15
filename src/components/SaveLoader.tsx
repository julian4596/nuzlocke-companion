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
    <div className="p-4 bg-white rounded-lg shadow-sm border border-primary/20 w-full">
      <label htmlFor="save-upload" className="block text-sm font-display font-medium text-primary/80 mb-2">
        Upload Save File (.sav)
      </label>
      <div className="flex flex-col gap-3">
        {('showOpenFilePicker' in window) && (
          <button
            type="button"
            onClick={handlePicker}
            className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded text-sm font-display font-medium transition-colors"
          >
            Select Save File
          </button>
        )}
        {('showOpenFilePicker' in window) && (
          <div className="flex items-center">
            <span className="text-primary/40 font-display text-xs w-full text-center">or</span>
          </div>
        )}
        <input 
          id="save-upload"
          type="file" 
          accept=".sav,.dsv" 
          aria-label="Upload Save File"
          onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
          onChange={handleFileChange}
          className="block w-full text-sm text-primary/60 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-primary/20 file:text-sm file:font-display file:font-medium file:bg-surface file:text-primary hover:file:bg-primary/5 cursor-pointer" 
        />
      </div>
    </div>
  );
}
