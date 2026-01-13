
import React, { useRef } from 'react';
import { RummySession } from '../types';

interface DataManagementProps {
  onResetApp: () => void;
  onImportSession: (session: RummySession) => void;
  sessionData: RummySession;
}

const DataManagement: React.FC<DataManagementProps> = ({ onResetApp, onImportSession, sessionData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(sessionData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `rummy_star_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as RummySession;
        
        // Basic validation of the JSON structure
        if (parsed && parsed.users && parsed.gameHistory && Array.isArray(parsed.users)) {
          onImportSession(parsed);
        } else {
          alert('Invalid backup file format. Please select a valid Rummy Star session file.');
        }
      } catch (err) {
        alert('Error reading the backup file. Please ensure it is a valid JSON document.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input to allow re-selection of the same file
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-xl">
      {/* Backup Section */}
      <div className="p-8 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/50">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-indigo-400">
          Data Backup & Recovery
        </h2>
        
        <p className="text-gray-300 mb-8 text-center text-sm leading-relaxed">
          The app automatically saves your progress. Use these tools for manual backups or to move your game to another phone or computer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            className="flex flex-col items-center justify-center p-6 bg-gray-900 border border-teal-500/30 rounded-2xl hover:bg-teal-500/10 transition-all group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📥</span>
            <span className="text-teal-400 font-bold">Download Backup</span>
            <span className="text-[10px] text-gray-500 mt-1 uppercase">Save to File</span>
          </button>

          <button
            onClick={handleImportClick}
            className="flex flex-col items-center justify-center p-6 bg-gray-900 border border-indigo-500/30 rounded-2xl hover:bg-indigo-500/10 transition-all group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📤</span>
            <span className="text-indigo-400 font-bold">Restore Session</span>
            <span className="text-[10px] text-gray-500 mt-1 uppercase">Upload File</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="*/*" 
            className="hidden" 
          />
        </div>
        <p className="mt-4 text-[10px] text-gray-500 text-center uppercase tracking-tighter">
          On Android: If prompted, select "Files" or "Documents" to find your .json backup.
        </p>
      </div>

      {/* Danger Zone Section */}
      <div className="p-8 bg-red-900 bg-opacity-20 backdrop-blur-md rounded-2xl shadow-xl border border-red-900/50 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h2>
        <p className="text-sm text-red-200/70 mb-6">
          Wipe all data to start a completely new tournament. This action is instantaneous.
        </p>
        <button
          onClick={onResetApp}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          Reset All Tournament Data
        </button>
      </div>

      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-mono uppercase tracking-widest border border-green-500/30">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Auto-Save Active
        </span>
      </div>
    </div>
  );
};

export default DataManagement;
