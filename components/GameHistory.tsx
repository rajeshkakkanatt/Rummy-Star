import React, { useState } from 'react';
import { GameRecord, User, HistoryViewMode, RummySession } from '../types';

interface GameHistoryProps {
  gameHistory: GameRecord[];
  allUsers: User[];
  onDeleteLastGame: () => void;
  outLimit: number;
  compelPoint: number;
  scootPoint: number;
  viewMode?: HistoryViewMode;
  onToggleViewMode?: (mode: HistoryViewMode) => void;
  isLargeScreen?: boolean;
  isSplitView?: boolean;
  sessionData?: RummySession;
}

interface ShareOptions {
  includeRank: boolean;
  includeGap: boolean;
  includePlays: boolean;
  includeStatus: boolean;
  includeDataFile: boolean;
}

const GameHistory: React.FC<GameHistoryProps> = ({ 
  gameHistory, 
  allUsers, 
  onDeleteLastGame, 
  outLimit, 
  compelPoint, 
  scootPoint,
  viewMode = 'standard',
  onToggleViewMode,
  isLargeScreen = false,
  isSplitView = false,
  sessionData
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    includeRank: true,
    includeGap: true,
    includePlays: true,
    includeStatus: true,
    includeDataFile: false, // Unchecked by default as requested
  });

  // Explicitly type the Map to prevent 'any' or 'unknown' inference during stand-alone member access
  const userIdToNameMap = new Map<string, string>(allUsers.map(user => [user.id, user.name]));

  const combinedTotalScores: { [userId: string]: number } = {};
  const activeHistoryUsersIds = Array.from(new Set(gameHistory.flatMap(g => Object.keys(g.scores))));
  const currentlyCheckedIds = allUsers.filter(u => u.isChecked).map(u => u.id);
  const relevantUserIds = Array.from(new Set([...activeHistoryUsersIds, ...currentlyCheckedIds]));
  const relevantUsers = allUsers.filter(u => relevantUserIds.includes(u.id));

  relevantUsers.forEach(user => {
    let currentTotal = user.overrideTotalScoreForIsOut ?? 0;
    const startIndex = user.joinedAtGameIndex ?? 0;
    
    for (let i = startIndex; i < gameHistory.length; i++) {
      const roundScore = gameHistory[i].scores[user.id];
      if (roundScore !== undefined) {
        currentTotal += roundScore;
      }
    }
    combinedTotalScores[user.id] = currentTotal;
  });

  // Explicitly type the map callback arguments to ensure score is recognized as a number
  const sortedTotalScores = Object.entries(combinedTotalScores)
    .map(([userId, score]: [string, number]) => ({
      userId,
      name: userIdToNameMap.get(userId) || 'Unknown Player',
      score,
    }))
    .sort((a, b) => b.score - a.score);

  // Added explicit return type to prevent inference issues which could lead to unknown types in the handleShare loop
  const getSurvivalMetrics = (score: number): {
    isOut: boolean;
    isCompel: boolean;
    pointsRemaining: number;
    fullPlays: number;
    totalPlays: number;
    hasCompelPlay: boolean;
    playDescription: string;
    shortStatus: string;
    gridDetailedStatus: string;
    whatsappPlays: string;
  } => {
    const isOut = score > outLimit;
    const isCompel = !isOut && score >= compelPoint;
    const pointsRemaining = Math.max(0, outLimit - score);
    
    const fullPlays = Math.floor(pointsRemaining / scootPoint);
    const remainder = pointsRemaining % scootPoint;
    const hasCompelPlay = remainder > 0;
    const totalPlays = fullPlays + (hasCompelPlay ? 1 : 0);

    let playDescription = "";
    let shortStatus = "";
    let gridDetailedStatus = "";
    let whatsappPlays = "";

    if (isOut) {
      playDescription = "Eliminated";
      shortStatus = "OUT";
      gridDetailedStatus = "OUT";
      whatsappPlays = "0";
    } else if (fullPlays > 0 && !hasCompelPlay) {
      playDescription = `${fullPlays} more play left`;
      shortStatus = `${fullPlays}P`;
      gridDetailedStatus = `${fullPlays} play`;
      whatsappPlays = `${fullPlays}P+0C`;
    } else if (fullPlays > 0 && hasCompelPlay) {
      playDescription = `${fullPlays} play + 1 compel`;
      shortStatus = `${fullPlays}P + 1C`;
      gridDetailedStatus = `${fullPlays}P + 1C`;
      whatsappPlays = `${fullPlays}P+1C`;
    } else if (fullPlays === 0 && hasCompelPlay) {
      playDescription = `1 compel play left`;
      shortStatus = `1C`;
      gridDetailedStatus = `0P + 1C`;
      whatsappPlays = `0P+1C`;
    } else if (pointsRemaining === 0) {
      playDescription = "Next point is out";
      shortStatus = "Next Pt";
      gridDetailedStatus = "Next Pt OUT";
      whatsappPlays = "NEXT";
    }

    return { 
      isOut, isCompel, pointsRemaining, fullPlays, totalPlays, 
      hasCompelPlay, playDescription, shortStatus, gridDetailedStatus, whatsappPlays 
    };
  };

  const handleShare = async () => {
    const pad = (text: string, length: number) => text.padEnd(length, ' ').slice(0, length);
    
    let message = `🏆 *RUMMY STAR STANDINGS*\n`;
    message += `_Round #${gameHistory.length} | Limit: ${outLimit}_\n\n`;
    message += '```\n';
    
    // Header
    let header = "";
    if (shareOptions.includeRank) header += pad("RK", 3);
    header += pad("PLAYER", 10);
    header += pad("TOT", 5);
    if (shareOptions.includeGap) header += pad("GAP", 5);
    if (shareOptions.includePlays) header += pad("PLAYS", 8);
    if (shareOptions.includeStatus) header += pad("STATUS", 8);
    message += header.trimEnd() + '\n';
    message += '-'.repeat(header.trimEnd().length) + '\n';

    // Body
    sortedTotalScores.forEach((player, index) => {
      const { isOut, isCompel, pointsRemaining, whatsappPlays } = getSurvivalMetrics(player.score);
      let row = "";
      if (shareOptions.includeRank) row += pad((index + 1).toString().padStart(2, '0'), 3);
      row += pad(player.name, 10);
      row += pad(player.score.toString(), 5);
      if (shareOptions.includeGap) row += pad(isOut ? "OUT" : pointsRemaining.toString(), 5);
      if (shareOptions.includePlays) row += pad(isOut ? "0" : whatsappPlays, 8);
      if (shareOptions.includeStatus) {
        const statusText = isOut ? "OUT" : isCompel ? "COMPEL" : "SAFE";
        row += pad(statusText, 8);
      }
      message += row.trimEnd() + '\n';
    });

    message += '```\n';
    message += `_Shared via Rummy Star_`;

    // 1. Handle JSON File Export if enabled
    if (shareOptions.includeDataFile && sessionData) {
      const fileName = `rummy_sync_${new Date().toISOString().split('T')[0]}.json`;
      const dataStr = JSON.stringify(sessionData, null, 2);
      
      // Try Native Share API first (better for mobile WhatsApp sharing)
      if (navigator.canShare && navigator.share) {
        try {
          const file = new File([dataStr], fileName, { type: 'application/json' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Rummy Star Session Data',
              text: 'Import this file into your Rummy Star app to sync tournament progress.',
            });
          } else {
            // Fallback to direct download if files can't be shared
            triggerDownload(dataStr, fileName);
          }
        } catch (e) {
          triggerDownload(dataStr, fileName);
        }
      } else {
        // Fallback to direct download
        triggerDownload(dataStr, fileName);
      }
    }

    // 2. Open WhatsApp Text Share
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsShareModalOpen(false);
  };

  const triggerDownload = (content: string, fileName: string) => {
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(content);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  };

  const renderStandardView = () => (
    <>
      <div className="p-8 bg-gray-900/60 rounded-3xl border border-white/5 mb-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
           <h3 className="text-3xl font-black text-teal-400 uppercase tracking-tighter">Leaderboard</h3>
           <span className="text-[10px] text-gray-600 uppercase font-black tracking-[0.3em] mt-2">Global Ranking & Tactical Data</span>
        </div>
        
        <ul className="space-y-6">
          {sortedTotalScores.length === 0 ? (
             <p className="text-gray-500 text-center font-bold italic py-8">No session data recorded.</p>
          ) : (
            sortedTotalScores.map((player) => {
              const { isOut, isCompel, pointsRemaining, playDescription } = getSurvivalMetrics(player.score);
              const progress = Math.min(100, (player.score / outLimit) * 100);
              const barColor = progress > 90 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : progress > 70 ? 'bg-orange-500' : 'bg-teal-500';

              return (
                <li 
                  key={player.userId} 
                  className={`relative flex flex-col justify-between py-6 px-8 rounded-[2rem] shadow-xl border transition-all duration-500 overflow-hidden ${
                    isOut 
                    ? 'bg-red-950/10 border-red-900/30 opacity-60 grayscale-[0.3]' 
                    : isCompel 
                      ? 'bg-orange-950/20 border-orange-500/30' 
                      : 'bg-gray-800/40 border-white/10'
                  }`}
                >
                  {/* Subtle Background Progress Bar */}
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/5">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${barColor}`} 
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col">
                      <span className={`text-2xl font-black tracking-tighter ${
                        isOut ? 'text-gray-600' : 'text-white'
                      }`}>
                        {player.name}
                      </span>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {!isOut && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            isCompel 
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse' 
                            : 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                          }`}>
                            {pointsRemaining} PT to OUT
                          </span>
                        )}
                        {isOut && (
                          <span className="text-[10px] bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest">Eliminated</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 opacity-60">Total Points</span>
                      <div className={`text-4xl font-mono font-black leading-none ${
                        isOut ? 'text-red-900' : isCompel ? 'text-orange-500' : 'text-teal-400'
                      }`}>
                        {player.score}
                      </div>
                    </div>
                  </div>

                  <div className={`mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10`}>
                    <span className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Strategic Outlook</span>
                    <div className={`text-[11px] font-black px-4 py-1.5 rounded-full border shadow-inner transition-all duration-500 ${
                      isOut 
                      ? 'bg-gray-900 border-gray-700 text-gray-600' 
                      : isCompel 
                        ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' 
                        : 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                    }`}>
                      {playDescription.toUpperCase()}
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="space-y-6 mb-4">
        <div className="flex justify-between items-center mb-8 px-2">
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Activity Logs</h3>
          <button
            onClick={onDeleteLastGame}
            disabled={gameHistory.length === 0}
            className={`py-2.5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 ${
              gameHistory.length === 0
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-transparent'
                : 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white shadow-lg'
            }`}
          >
            Undo Last
          </button>
        </div>
        {gameHistory.slice().reverse().map((game, index) => (
          <div
            key={index}
            className="p-6 bg-gray-950/40 rounded-3xl shadow-xl border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
               <h4 className="text-2xl font-black text-teal-400 tracking-tighter uppercase">{game.name}</h4>
               <span className="text-[10px] text-gray-600 font-black font-mono tracking-widest">ENTRY ID #{gameHistory.length - index}</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              {Object.entries(game.scores).map(([userId, score]) => (
                <li key={userId} className="flex justify-between items-center text-lg border-b border-white/5 pb-2 last:border-0">
                  <span className="font-bold text-gray-400 uppercase text-xs tracking-wider">{userIdToNameMap.get(userId) || 'Anonymous'}</span>
                  <span className={`text-xl font-mono font-black ${score === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                    {score === 0 ? 'WIN' : score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );

  const renderGridView = () => {
    const players = relevantUsers.sort((a, b) => {
        const scoreA = combinedTotalScores[a.id] || 0;
        const scoreB = combinedTotalScores[b.id] || 0;
        return scoreB - scoreA;
    });
    
    return (
      <div className="w-full overflow-hidden flex flex-col animate-in fade-in duration-700">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Strategic Data Grid</h3>
          <button
            onClick={onDeleteLastGame}
            disabled={gameHistory.length === 0}
            className="text-[10px] bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 font-black py-2 px-6 rounded-2xl uppercase tracking-widest transition-all disabled:opacity-30"
          >
            Undo Last
          </button>
        </div>
        
        <div className="overflow-x-auto rounded-[2rem] border border-white/5 shadow-3xl bg-gray-950/40 backdrop-blur-3xl">
          <table className="w-full text-left border-collapse min-w-[800px] table-fixed font-mono">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 sticky left-0 bg-gray-900 z-20 whitespace-nowrap w-44 tracking-widest">Player</th>
                <th className="px-1 py-4 text-[10px] font-black uppercase text-teal-400 border-l border-white/5 text-center bg-gray-900 z-10 w-20 tracking-widest">Total</th>
                <th className="px-1 py-4 text-[10px] font-black uppercase text-gray-500 border-l border-white/5 text-center bg-gray-900 z-10 w-16 tracking-widest">Gap</th>
                <th className="px-1 py-4 text-[10px] font-black uppercase text-gray-600 border-l border-white/5 text-center bg-gray-900 z-10 w-32 tracking-widest">Status</th>
                {gameHistory.map((game, idx) => (
                  <th key={idx} className="px-1 py-4 text-[9px] font-black uppercase text-gray-600 border-l border-white/5 text-center w-14">
                    <div className="truncate">{game.name.replace('Game ', 'G')}</div>
                  </th>
                ))}
                <th className="w-auto"></th>
              </tr>
            </thead>
            <tbody>
              {players.map((user) => {
                const score = combinedTotalScores[user.id] || 0;
                const { isOut, isCompel, pointsRemaining, gridDetailedStatus } = getSurvivalMetrics(score);
                
                return (
                  <tr key={user.id} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${isOut ? 'opacity-40 grayscale-[0.6]' : ''}`}>
                    <td className={`px-6 py-4 text-sm font-black sticky left-0 z-10 border-r border-white/5 transition-colors whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-tighter ${
                      isOut ? 'bg-gray-950 text-gray-600' : 'bg-gray-900 text-white'
                    }`}>
                      {user.name}
                    </td>
                    
                    <td className={`px-1 py-4 text-center border-l border-white/5 ${isOut ? 'bg-red-950/5' : ''}`}>
                        <span className={`text-xl font-black ${isOut ? 'text-red-900' : isCompel ? 'text-orange-500' : 'text-teal-400'}`}>
                            {score}
                        </span>
                    </td>

                    <td className={`px-1 py-4 text-center border-l border-white/5 ${isOut ? 'bg-red-950/5' : ''}`}>
                        <span className={`text-[10px] font-black ${isOut ? 'text-gray-700' : 'text-gray-500'}`}>
                            {isOut ? "OUT" : `${pointsRemaining}`}
                        </span>
                    </td>

                    <td className={`px-1 py-4 text-center border-l border-white/5 ${isOut ? 'bg-red-950/5' : ''}`}>
                        <div className={`inline-flex items-center justify-center px-2 py-1.5 rounded-lg text-[9px] font-black border transition-all whitespace-nowrap leading-none tracking-widest uppercase ${
                            isOut 
                            ? 'bg-gray-800 border-gray-700 text-gray-600' 
                            : isCompel 
                                ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' 
                                : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                        }`}>
                            {gridDetailedStatus}
                        </div>
                    </td>

                    {gameHistory.map((game, idx) => {
                        const roundScore = game.scores[user.id];
                        const isWinner = roundScore === 0;
                        return (
                            <td key={idx} className={`px-1 py-4 text-center border-l border-white/5 w-14 ${isWinner ? 'bg-green-500/[0.03]' : ''}`}>
                                <span className={`text-[12px] font-black ${isWinner ? 'text-green-500' : roundScore === undefined ? 'text-gray-900' : 'text-white/20'}`}>
                                    {roundScore !== undefined ? (isWinner ? 'W' : roundScore) : '-'}
                                </span>
                            </td>
                        );
                    })}
                    <td className="w-auto"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-6 text-[9px] uppercase font-black tracking-[0.2em] text-gray-600 px-4">
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span> Winner</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-red-600 rounded-full"></span> Out</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 border-2 border-orange-500 rounded-full"></span> Compel Warning</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-800/40 backdrop-blur-2xl rounded-[2.5rem] shadow-3xl border border-white/5 w-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6 border-b border-white/5 pb-6">
        <h2 className="text-4xl font-black text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500 uppercase tracking-tighter">History</h2>
        
        <div className="flex items-center gap-3">
          {/* Share Trigger Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            disabled={sortedTotalScores.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg group ${
              sortedTotalScores.length === 0
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-transparent opacity-50'
              : 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.059-1.054-.027-.243-.05-.536-.113-1.012-.312-2.022-.843-3.327-2.896-3.427-3.03-.101-.133-.821-1.091-.821-2.083 0-.992.52-1.479.704-1.681.185-.202.403-.252.537-.252.135 0 .269.001.387.006.124.005.291-.047.456.353.169.41.579 1.413.629 1.514.05.101.084.218.017.352-.067.135-.101.218-.202.336-.101.118-.212.264-.302.353-.101.101-.207.21-.089.413.118.202.523.861 1.123 1.395.772.688 1.42.902 1.622 1.003.202.101.32-.084.437-.218.118-.135.505-.589.639-.791.135-.202.269-.169.454-.101.185.067 1.178.556 1.381.657.202.101.336.151.387.236.05.084.05.488-.094.893z"/>
            </svg>
            Share
          </button>

          {isLargeScreen && isSplitView && onToggleViewMode && (
            <div className="flex bg-gray-950/80 p-1.5 rounded-2xl border border-white/5 shadow-inner">
              <button
                onClick={() => onToggleViewMode('standard')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === 'standard' 
                  ? 'bg-teal-500 text-white shadow-xl scale-105' 
                  : 'text-gray-600 hover:text-gray-300'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => onToggleViewMode('grid')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === 'grid' 
                  ? 'bg-teal-500 text-white shadow-xl scale-105' 
                  : 'text-gray-600 hover:text-gray-300'
                }`}
              >
                Grid
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Customization Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Share Standings</h3>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-8">Customize WhatsApp Message</p>
            
            <div className="space-y-4 mb-8">
              {[
                { id: 'includeRank', label: 'Include Rank' },
                { id: 'includeGap', label: 'Include Gap' },
                { id: 'includePlays', label: 'Include Plays' },
                { id: 'includeStatus', label: 'Include Status' },
              ].map((opt) => (
                <div key={opt.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-sm font-bold text-gray-200 uppercase tracking-wider">{opt.label}</span>
                  <button
                    onClick={() => setShareOptions(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof ShareOptions] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      shareOptions[opt.id as keyof ShareOptions] ? 'bg-teal-500' : 'bg-gray-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shareOptions[opt.id as keyof ShareOptions] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between p-4 bg-teal-500/5 rounded-2xl border border-teal-500/20">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-teal-400 uppercase tracking-widest">Export Data Package (JSON)</span>
                  </div>
                  <button
                    onClick={() => setShareOptions(prev => ({ ...prev, includeDataFile: !prev.includeDataFile }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      shareOptions.includeDataFile ? 'bg-teal-500' : 'bg-gray-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shareOptions.includeDataFile ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <p className="mt-4 px-2 text-[10px] text-gray-500 leading-relaxed italic uppercase font-black tracking-wider">
                  Downloads a digital session file. Other players can import this file via the "Backup" tab to perfectly sync their app with this game state.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="w-full py-4 bg-[#25D366] hover:bg-[#1fb355] text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-[#25D366]/20 flex items-center justify-center gap-2"
              >
                Send to WhatsApp
              </button>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-full py-3 text-gray-500 hover:text-white font-black uppercase tracking-widest transition-colors text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {gameHistory.length === 0 && sortedTotalScores.length === 0 ? (
        <p className="text-gray-600 text-center text-xl font-bold py-24 uppercase tracking-tighter opacity-50">Empty Archive</p>
      ) : (
        viewMode === 'grid' && isLargeScreen && isSplitView ? renderGridView() : renderStandardView()
      )}
    </div>
  );
};

export default GameHistory;