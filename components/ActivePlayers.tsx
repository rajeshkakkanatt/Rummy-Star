import React from 'react';
import { User, GameRecord } from '../types';

interface ActivePlayersProps {
  activeUsers: User[];
  onScoreChange: (id: string, score: number | null) => void;
  gameCounter: number; 
  onSaveGame: (activeUsers: User[]) => void; 
  allUsers: User[]; 
  gameHistory: GameRecord[]; 
  isRummyRound: boolean; 
  setIsRummyRound: (isRummy: boolean) => void; 
  isSplitView?: boolean;
  outLimit: number;
  calculateTotalScore: (user: User, history: GameRecord[]) => number;
}

const MAX_SCORE_DEFAULT = 80;
const MAX_SCORE_IF_RUMMY_HAND = 160;

const ActivePlayers: React.FC<ActivePlayersProps> = ({
  activeUsers,
  onScoreChange,
  gameCounter,
  onSaveGame,
  isRummyRound,
  setIsRummyRound,
  outLimit,
  gameHistory,
  calculateTotalScore
}) => {
  const currentMaxScore = isRummyRound ? MAX_SCORE_IF_RUMMY_HAND : MAX_SCORE_DEFAULT;
  const isNoActivePlayers = activeUsers.length === 0;

  const hasValidScores = activeUsers.every(user => user.score !== null && user.score >= 0 && user.score <= currentMaxScore);
  const zeroScoreCount = activeUsers.filter(user => user.score === 0).length;

  const isSaveDisabled =
    isNoActivePlayers || 
    !hasValidScores || 
    zeroScoreCount !== 1;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="p-8 bg-gray-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 w-full overflow-hidden">
        <h2 className="text-4xl font-black text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500 uppercase tracking-tighter">
          Active Round
        </h2>
        
        <div className={`flex items-center justify-center mb-10 transition-all duration-300 ${isNoActivePlayers ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}>
          <input
            type="checkbox"
            checked={isRummyRound}
            onChange={(e) => setIsRummyRound(e.target.checked)}
            className="hidden" 
            id="global-rummy-checkbox"
            disabled={isNoActivePlayers}
          />
          <label
            htmlFor="global-rummy-checkbox"
            className={`relative flex items-center justify-center w-8 h-8 rounded-xl border-2 transition-all duration-300 ${isNoActivePlayers ? 'cursor-not-allowed' : 'cursor-pointer text-white text-opacity-0 hover:text-opacity-100'} mr-4
              ${isRummyRound && !isNoActivePlayers ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-gray-700 border-gray-600'}
            `}
          >
            {isRummyRound && (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </label>
          <label htmlFor="global-rummy-checkbox" className={`text-lg font-black tracking-tight ${isNoActivePlayers ? 'text-gray-500 cursor-not-allowed' : 'text-gray-200 cursor-pointer hover:text-white transition-colors uppercase'}`}>
            Double Rummy Round
          </label>
        </div>

        {activeUsers.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-600 text-center">
            <span className="text-7xl mb-4 grayscale opacity-40">🎴</span>
            <p className="text-lg font-bold italic px-4 uppercase tracking-tighter">No active participants.<br/>Check players in the list.</p>
          </div>
        ) : (
          <ul className="space-y-6 mb-8">
            {activeUsers.map((user) => {
              const totalScore = calculateTotalScore(user, gameHistory);
              const progress = Math.min(100, (totalScore / outLimit) * 100);
              const barColor = progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-orange-400' : 'bg-teal-500';

              return (
                <li
                  key={user.id}
                  className="relative group p-6 bg-gray-950/40 rounded-2xl shadow-lg border border-white/5 hover:border-teal-500/20 transition-all overflow-hidden"
                >
                  {/* Background Progress Bar */}
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-white/5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${barColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div className="flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-2xl font-black transition-colors ${user.score === 0 ? 'text-green-400' : 'text-white'}`}>
                          {user.name}
                        </span>
                        {user.score === 0 && <span className="text-[10px] font-black uppercase tracking-widest text-green-400 animate-pulse bg-green-500/10 px-2 py-0.5 rounded-full">Winner</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Running Total: {totalScore}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max={currentMaxScore}
                        value={user.score !== null ? user.score : ''}
                        onChange={(e) => {
                          const inputValue = e.target.value.trim();
                          if (inputValue === '') {
                            onScoreChange(user.id, null);
                          } else {
                            const parsedValue = parseInt(inputValue, 10);
                            if (!isNaN(parsedValue)) {
                              const clampedValue = Math.max(0, Math.min(currentMaxScore, parsedValue));
                              onScoreChange(user.id, clampedValue);
                            }
                          }
                        }}
                        className={`w-32 p-3 font-mono rounded-xl bg-gray-900/80 text-white border-2 focus:outline-none transition-all text-center text-2xl font-black
                          ${user.score === 0 ? 'border-green-500 bg-green-950/20' : 'border-white/10 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500'}
                        `}
                        placeholder={`0-${currentMaxScore}`}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!isNoActivePlayers && (
          <div className="mt-12 w-full flex flex-col items-center">
            <div className={`w-full max-sm p-1.5 backdrop-blur-3xl border rounded-[2.5rem] shadow-2xl transition-all duration-500
              ${isSaveDisabled 
                ? 'bg-gray-900/40 border-white/5' 
                : 'bg-gray-950/80 border-green-500/30'}
            `}>
              <button
                onClick={() => onSaveGame(activeUsers)}
                disabled={isSaveDisabled}
                className={`group relative w-full flex items-center justify-between py-5 px-8 font-black text-xl rounded-[2rem] transition-all duration-300 transform active:scale-95
                  ${isSaveDisabled
                    ? 'bg-gray-800/40 text-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 text-white hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-black border transition-all
                    ${isSaveDisabled 
                      ? 'bg-gray-700/50 border-white/5 text-gray-700' 
                      : 'bg-white/10 border-white/20 text-white'}
                  `}>
                    {gameCounter}
                  </div>
                  <div className="flex flex-col items-start leading-none gap-1">
                    <span className={`uppercase text-[10px] tracking-widest font-black opacity-60 ${isSaveDisabled ? 'text-gray-600' : 'text-white'}`}>
                      Record Entry
                    </span>
                    <span className="uppercase text-xl tracking-tighter">Submit Round</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {isSaveDisabled ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10" />
                    </svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-9 w-9 transition-transform duration-500 group-hover:translate-x-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={4}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
            
            {isSaveDisabled && (
              <div className="mt-4 text-center">
                <span className="text-[10px] uppercase tracking-widest text-red-400 font-black bg-red-500/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-red-500/20">
                  {zeroScoreCount !== 1 ? 'Require exactly 1 winner (0)' : 'Complete all points'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivePlayers;