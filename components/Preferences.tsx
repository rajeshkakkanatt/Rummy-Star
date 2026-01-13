
import React from 'react';

interface PreferencesProps {
  outLimit: number;
  onOutLimitChange: (val: number) => void;
  compelPoint: number;
  onCompelPointChange: (val: number) => void;
  scootPoint: number;
  onScootPointChange: (val: number) => void;
  hideDefaultUsers: boolean;
  onToggleHideDefault: (val: boolean) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ 
  outLimit,
  onOutLimitChange,
  compelPoint,
  onCompelPointChange,
  scootPoint,
  onScootPointChange,
  hideDefaultUsers,
  onToggleHideDefault
}) => {
  return (
    <div className="flex flex-col gap-8 w-full max-w-xl">
      {/* Player Preferences Section */}
      <div className="p-8 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/50">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
          Player Settings
        </h2>
        
        <div className="flex items-center justify-between p-4 bg-gray-900/80 rounded-xl border border-gray-700/50">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white leading-tight">Hide Default Players</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Rajesh, Vinod, etc.</span>
          </div>
          <button
            onClick={() => onToggleHideDefault(!hideDefaultUsers)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              hideDefaultUsers ? 'bg-teal-500' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                hideDefaultUsers ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Game Rules Section */}
      <div className="p-8 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/50">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-indigo-400">
          Tournament Rules
        </h2>
        
        <p className="text-gray-400 text-sm mb-6 text-center italic leading-relaxed">
          Configure the scoring thresholds for your tournament. These values are mathematically linked to ensure a fair and balanced game flow.
        </p>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Out Limit Point</label>
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 font-black">LETHAL</span>
            </div>
            <input 
              type="number"
              value={outLimit}
              onChange={(e) => onOutLimitChange(parseInt(e.target.value) || 0)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-2xl font-black text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-inner"
            />
            <p className="text-[11px] text-gray-500 px-1 font-medium">Players whose total score exceeds this value are marked as OUT.</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Compel Point</label>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30 font-black">WARNING</span>
            </div>
            <input 
              type="number"
              value={compelPoint}
              onChange={(e) => onCompelPointChange(parseInt(e.target.value) || 0)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-2xl font-black text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-inner"
            />
            <p className="text-[11px] text-gray-500 px-1 font-medium">New players or re-entries are blocked if any active player reaches this score.</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Scoot / Drop Point</label>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30 font-black">BUFFER</span>
            </div>
            <input 
              type="number"
              value={scootPoint}
              onChange={(e) => onScootPointChange(parseInt(e.target.value) || 0)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-2xl font-black text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
            />
            <p className="text-[11px] text-gray-500 px-1 font-medium">The point buffer maintained between the Warning (Compel) and the Lethal (Out) limit.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
