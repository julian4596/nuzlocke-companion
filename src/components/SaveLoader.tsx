import React from 'react';

interface Props {
  onFileLoad: (buffer: ArrayBuffer, fileName: string) => void;
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

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700">
      <label htmlFor="save-upload" className="block text-sm font-medium text-gray-300 mb-2">
        Upload Save File (.sav)
      </label>
      <input 
        id="save-upload"
        type="file" 
        accept=".sav,.dsv" 
        aria-label="Upload Save File"
        onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
      />
    </div>
  );
}
