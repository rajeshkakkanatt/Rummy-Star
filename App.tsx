import React, { useState, useEffect, useCallback } from 'react';
import { User, GameRecord, RummySession, ThemeName, HistoryViewMode } from './types'; 
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import ActivePlayers from './components/ActivePlayers';
import GameHistory from './components/GameHistory'; 
import DataManagement from './components/DataManagement'; 
import InfoSection from './components/InfoSection'; 
import Preferences from './components/Preferences';

const APP_VERSION = 'v17.0.0';

const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Rajesh', isDefault: true, isChecked: false, score: null, isOut: false, overrideTotalScoreForIsOut: null, joinedAtGameIndex: 0 },
  { id: '2', name: 'Vinod', isDefault: true, isChecked: false, score: null, isOut: false, overrideTotalScoreForIsOut: null, joinedAtGameIndex: 0 },
  { id: '3', name: 'Shine', isDefault: true, isChecked: false, score: null, isOut: false, overrideTotalScoreForIsOut: null, joinedAtGameIndex: 0 },
  { id: '4', name: 'Keerthy', isDefault: true, isChecked: false, score: null, isOut: false, overrideTotalScoreForIsOut: null, joinedAtGameIndex: 0 },
  { id: '5', name: 'Ratheesh', isDefault: true, isChecked: false, score: null, isOut: false, overrideTotalScoreForIsOut: null, joinedAtGameIndex: 0 },
  { id: '6', name: 'Shiju', isDefault: true, isChecked: false, score: null, isOut: false, overrideTotalScoreForIsOut: null, joinedAtGameIndex: 0 },
  { id: '7', name: 'Kilu', isDefault: true, isChecked: false, score: null, isOut: false, overrideTotalScoreForIsOut: null, joinedAtGameIndex: 0 }, 
];

const MAX_SCORE_DEFAULT = 80;
const MAX_SCORE_IF_RUMMY_HAND = 160;

const THEME_CONFIGS: Record<ThemeName, { bg: string, accent: string }> = {
  classic: { bg: 'from-gray-900 via-gray-950 to-black', accent: 'from-teal-300 via-indigo-400 to-purple-500' },
  ocean: { bg: 'from-slate-900 via-blue-950 to-cyan-950', accent: 'from-cyan-300 via-blue-400 to-indigo-500' },
  midnight: { bg: 'from-purple-950 via-gray-950 to-fuchsia-950', accent: 'from-fuchsia-300 via-purple-400 to-pink-500' },
  forest: { bg: 'from-emerald-950 via-gray-950 to-green-950', accent: 'from-lime-300 via-emerald-400 to-teal-500' },
  sunset: { bg: 'from-orange-950 via-red-950 to-stone-950', accent: 'from-yellow-300 via-orange-400 to-red-500' }
};

function App() {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem('rummyStarTheme');
    return (savedTheme as ThemeName) || 'classic';
  });

  const [hideDefaultUsers, setHideDefaultUsers] = useState<boolean>(() => {
    const saved = localStorage.getItem('rummyStarHideDefault');
    return saved ? JSON.parse(saved) : true;
  });

  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(window.innerWidth >= 1024);
  const [isSplitView, setIsSplitView] = useState<boolean>(() => {
    const saved = localStorage.getItem('rummyStarSplitView');
    return saved ? JSON.parse(saved) : true;
  });

  const [historyViewMode, setHistoryViewMode] = useState<HistoryViewMode>(() => {
    const saved = localStorage.getItem('rummyStarHistoryViewMode');
    if (saved) return saved as HistoryViewMode;
    return isSplitView ? 'grid' : 'standard';
  });

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('rummyStarSplitView', JSON.stringify(isSplitView));
    setHistoryViewMode(isSplitView ? 'grid' : 'standard');
  }, [isSplitView]);

  useEffect(() => {
    localStorage.setItem('rummyStarHistoryViewMode', historyViewMode);
  }, [historyViewMode]);

  const [outLimit, setOutLimit] = useState<number>(() => {
    const saved = localStorage.getItem('rummyStarOutLimit');
    return saved ? parseInt(saved, 10) : 220;
  });
  const [compelPoint, setCompelPoint] = useState<number>(() => {
    const saved = localStorage.getItem('rummyStarCompelPoint');
    return saved ? parseInt(saved, 10) : 196;
  });
  const [scootPoint, setScootPoint] = useState<number>(() => {
    const saved = localStorage.getItem('rummyStarScootPoint');
    return saved ? parseInt(saved, 10) : 25;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('rummyStarUsers');
    if (savedUsers) {
      const parsedUsers: User[] = JSON.parse(savedUsers);
      const nonDefaultSavedUsers = parsedUsers.filter(user => !user.isDefault);
      const combinedUsers = [...DEFAULT_USERS, ...nonDefaultSavedUsers];
      const uniqueUsers = Array.from(new Map(combinedUsers.map(user => [user.id, user])).values());
      return uniqueUsers.map(user => ({
        ...user,
        isOut: user.isOut ?? false,
        overrideTotalScoreForIsOut: user.overrideTotalScoreForIsOut ?? null,
        joinedAtGameIndex: user.joinedAtGameIndex ?? 0,
      }));
    }
    return DEFAULT_USERS;
  });
  
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'manage-players' | 'active-players' | 'game-history' | 'data' | 'prefs' | 'info'>('manage-players'); 
  const [gameCounter, setGameCounter] = useState<number>(() => {
    const savedGameCounter = localStorage.getItem('rummyStarGameCounter');
    return savedGameCounter ? parseInt(savedGameCounter, 10) : 1;
  });
  const [gameHistory, setGameHistory] = useState<GameRecord[]>(() => {
    const savedGameHistory = localStorage.getItem('rummyStarGameHistory');
    return savedGameHistory ? JSON.parse(savedGameHistory) as GameRecord[] : [];
  });
  const [isRummyRound, setIsRummyRound] = useState<boolean>(() => {
    const savedRummyRound = localStorage.getItem('rummyStarIsRummyRound');
    return savedRummyRound ? JSON.parse(savedRummyRound) : false;
  });
  const [isEntryProhibitedGlobally, setIsEntryProhibitedGlobally] = useState<boolean>(() => {
    const savedProhibitedState = localStorage.getItem('rummyStarEntryProhibited');
    return savedProhibitedState ? JSON.parse(savedProhibitedState) : false;
  });

  useEffect(() => {
    localStorage.setItem('rummyStarUsers', JSON.stringify(users));
    localStorage.setItem('rummyStarGameCounter', gameCounter.toString());
    localStorage.setItem('rummyStarGameHistory', JSON.stringify(gameHistory));
    localStorage.setItem('rummyStarIsRummyRound', JSON.stringify(isRummyRound));
    localStorage.setItem('rummyStarEntryProhibited', JSON.stringify(isEntryProhibitedGlobally));
    localStorage.setItem('rummyStarTheme', theme);
    localStorage.setItem('rummyStarHideDefault', JSON.stringify(hideDefaultUsers));
    localStorage.setItem('rummyStarOutLimit', outLimit.toString());
    localStorage.setItem('rummyStarCompelPoint', compelPoint.toString());
    localStorage.setItem('rummyStarScootPoint', scootPoint.toString());
  }, [users, gameCounter, gameHistory, isRummyRound, isEntryProhibitedGlobally, theme, hideDefaultUsers, outLimit, compelPoint, scootPoint]);

  const calculateTotalScoreForUser = useCallback((user: User, history: GameRecord[]) => {
    let score = user.overrideTotalScoreForIsOut ?? 0;
    const startIndex = user.joinedAtGameIndex ?? 0;
    for (let i = startIndex; i < history.length; i++) {
      const roundScore = history[i].scores[user.id];
      if (roundScore !== undefined) {
        score += roundScore;
      }
    }
    return score;
  }, []);

  useEffect(() => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        const currentCalculatedTotalScore = calculateTotalScoreForUser(user, gameHistory);
        const newIsOut = currentCalculatedTotalScore > outLimit;
        
        let updatedUser = { ...user };
        if (newIsOut && user.isChecked) {
          updatedUser = { ...updatedUser, isChecked: false, score: null, isOut: true };
        } 
        else if (!newIsOut && user.isOut) {
          updatedUser = { ...updatedUser, isOut: false };
        }
        else if (updatedUser.isOut !== newIsOut) {
            updatedUser = { ...updatedUser, isOut: newIsOut };
        }
        return updatedUser;
      });
    });
  }, [gameHistory, calculateTotalScoreForUser, outLimit]); 

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentUserName(event.target.value);
  };

  const handleSave = () => {
    if (currentUserName.trim() === '') {
      alert('Player name cannot be empty!');
      return;
    }

    if (editingUser) {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === editingUser.id ? { ...user, name: currentUserName.trim() } : user
        )
      );
      setEditingUser(null);
    } else {
      let potentialReEntryScore = 0;
      let canAutoCheck = true;
      
      const activePlayers = users.filter(u => u.isChecked && !u.isOut);
      if (activePlayers.length > 0) {
        activePlayers.forEach(u => {
          const s = calculateTotalScoreForUser(u, gameHistory);
          if (s > potentialReEntryScore) potentialReEntryScore = s;
        });
      }

      if (isEntryProhibitedGlobally || (activePlayers.length > 0 && potentialReEntryScore >= compelPoint)) {
        canAutoCheck = false;
        if (potentialReEntryScore >= compelPoint) {
          setIsEntryProhibitedGlobally(true);
        }
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        name: currentUserName.trim(),
        isDefault: false,
        isChecked: canAutoCheck,
        score: null,
        isOut: false,
        overrideTotalScoreForIsOut: canAutoCheck ? (gameHistory.length > 0 ? potentialReEntryScore : 0) : null,
        joinedAtGameIndex: gameHistory.length,
      };

      setUsers(prevUsers => [...prevUsers, newUser]);
      
      if (!canAutoCheck) {
        alert(`Player "${newUser.name}" added but could not be automatically checked because the current highest score (${potentialReEntryScore}) is at or above the Compel Point (${compelPoint}).`);
      }
    }
    setCurrentUserName('');
  };

  const handleClear = () => {
    setCurrentUserName('');
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setCurrentUserName(user.name);
    setEditingUser(user);
    setActiveTab('manage-players');
  };

  const handleDelete = (id: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    handleClear();
  };

  const handleToggleCheck = useCallback((id: string) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === id) {
          if (user.isChecked) {
            return { ...user, isChecked: false, score: null, overrideTotalScoreForIsOut: null };
          }
          else {
            if (isEntryProhibitedGlobally) {
              alert('Entry to the game is currently prohibited due to previous high scores.');
              return user;
            }
            const calculateCurrentMaxScore = () => {
              let maxScore = 0;
              prevUsers.forEach(otherUser => {
                if (otherUser.id !== user.id && otherUser.isChecked && !otherUser.isOut) {
                  const score = calculateTotalScoreForUser(otherUser, gameHistory);
                  maxScore = Math.max(maxScore, score);
                }
              });
              return maxScore;
            };
            const potentialReEntryScore = calculateCurrentMaxScore();
            if (potentialReEntryScore >= compelPoint) {
              alert(`Entry not allowed. The highest active player score (${potentialReEntryScore}) is equal to or above the Compel Point (${compelPoint}).`);
              setIsEntryProhibitedGlobally(true);
              return user;
            }
            return {
              ...user,
              isChecked: true,
              score: null,
              isOut: false,
              overrideTotalScoreForIsOut: potentialReEntryScore,
              joinedAtGameIndex: gameHistory.length,
            };
          }
        }
        return user;
      });
    });
  }, [gameHistory, isEntryProhibitedGlobally, calculateTotalScoreForUser, compelPoint]);

  const handleScoreChange = (id: string, newScore: number | null) => {
    setUsers(prevUsers => {
      let updatedUsers = prevUsers.map(user =>
        user.id === id ? { ...user, score: newScore } : user
      );
      const activePlayers = updatedUsers.filter(user => user.isChecked && !user.isOut);
      const hasExplicitZero = activePlayers.some(player => player.score === 0);
      const scoredPlayersCount = activePlayers.filter(player => player.score !== null).length;
      if (!hasExplicitZero && activePlayers.length > 1 && scoredPlayersCount === activePlayers.length - 1) {
        const playerToMakeWinner = activePlayers.find(player => player.score === null);
        if (playerToMakeWinner) {
          updatedUsers = updatedUsers.map(user =>
            user.id === playerToMakeWinner.id ? { ...user, score: 0 } : user
          );
        }
      }
      return updatedUsers;
    });
  };

  const handleSaveGame = (currentActivePlayers: User[]) => {
    let allScoresValid = true;
    let hasZeroScore = false;
    const currentMaxScore = isRummyRound ? MAX_SCORE_IF_RUMMY_HAND : MAX_SCORE_DEFAULT;
    if (currentActivePlayers.length === 0) {
      alert('No active players to save scores for.');
      return;
    }
    currentActivePlayers.forEach(player => {
      if (player.isOut || player.score === null || player.score < 0 || player.score > currentMaxScore) {
        allScoresValid = false;
      } else if (player.score === 0) {
        hasZeroScore = true;
      }
    });
    if (!allScoresValid) {
        alert(`Please ensure all active players have valid scores between 0 and ${currentMaxScore} before saving.`);
        return;
    }
    if (!hasZeroScore) {
      alert('At least one player must have a score of 0 (winner) to save the game.');
      return;
    }
    const scoresMap: { [userId: string]: number } = {};
    currentActivePlayers.forEach(player => {
        scoresMap[player.id] = player.score!;
    });
    const gameRecord: GameRecord = {
      name: `Game ${gameCounter}`,
      scores: scoresMap,
    };
    setGameHistory(prevHistory => [...prevHistory, gameRecord]);
    setGameCounter(prevCounter => prevCounter + 1);
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.isChecked ? { ...user, score: null } : user
      )
    );
    setIsRummyRound(false);
  };

  const handleDeleteLastGame = useCallback(() => {
    if (gameHistory.length > 0) {
      const newHistory = gameHistory.slice(0, gameHistory.length - 1);
      const newHistoryLength = newHistory.length;

      setGameHistory(newHistory);
      setGameCounter(prevCounter => prevCounter - 1);

      setUsers(prevUsers => {
        const updatedUsers = prevUsers.map(user => {
          if (user.joinedAtGameIndex !== null && user.joinedAtGameIndex !== undefined && user.joinedAtGameIndex >= newHistoryLength) {
            return {
              ...user,
              isChecked: false,
              score: null,
              overrideTotalScoreForIsOut: null,
              isOut: false 
            };
          }
          return user;
        });

        let stillProhibited = false;
        updatedUsers.forEach(u => {
          if (u.isChecked && !u.isOut) {
            const currentTotal = calculateTotalScoreForUser(u, newHistory);
            if (currentTotal >= compelPoint) {
              stillProhibited = true;
            }
          }
        });
        setIsEntryProhibitedGlobally(stillProhibited);

        return updatedUsers;
      });

      alert('Last game round deleted!');
    } else {
      alert('No game history to delete.');
    }
  }, [gameHistory, calculateTotalScoreForUser, compelPoint]);

  const handleResetApp = useCallback(() => {
    setGameHistory([]);
    setGameCounter(1);
    setUsers(DEFAULT_USERS.map(user => ({...user, isChecked: false, score: null, isOut: false, overrideTotalScoreForIsOut: null, joinedAtGameIndex: 0})));
    setIsRummyRound(false);
    setIsEntryProhibitedGlobally(false);
    setTheme('classic');
    setHideDefaultUsers(true);
    setOutLimit(220);
    setCompelPoint(196);
    setScootPoint(25);
    localStorage.clear();
    alert('Application has been reset!');
    setActiveTab('manage-players');
  }, []);

  const handleImportSession = (session: RummySession) => {
    setUsers(session.users);
    setGameHistory(session.gameHistory);
    setGameCounter(session.gameCounter);
    setIsRummyRound(session.isRummyRound);
    setIsEntryProhibitedGlobally(session.isEntryProhibitedGlobally);
    if (session.theme) setTheme(session.theme);
    if (session.hideDefaultUsers !== undefined) setHideDefaultUsers(session.hideDefaultUsers);
    if (session.outLimit) setOutLimit(session.outLimit);
    if (session.compelPoint) setCompelPoint(session.compelPoint);
    if (session.scootPoint) setScootPoint(session.scootPoint);
    alert('Session successfully imported and restored!');
  };

  const handleOutLimitChange = (val: number) => {
    setOutLimit(val);
    setCompelPoint(val - scootPoint + 1);
  };

  const handleCompelPointChange = (val: number) => {
    setCompelPoint(val);
    setOutLimit(val + scootPoint - 1);
  };

  const handleScootPointChange = (val: number) => {
    setScootPoint(val);
    setCompelPoint(outLimit - val + 1);
  };

  const activePlayers = users.filter(user => user.isChecked && !user.isOut);
  const displayUsers = hideDefaultUsers ? users.filter(u => !u.isDefault) : users;
  const currentThemeConfig = THEME_CONFIGS[theme];

  const currentSessionData: RummySession = {
    version: APP_VERSION,
    users,
    gameHistory,
    gameCounter,
    isRummyRound,
    isEntryProhibitedGlobally,
    theme,
    hideDefaultUsers,
    outLimit,
    compelPoint,
    scootPoint,
    timestamp: new Date().toISOString()
  };

  const renderActivePlayers = () => (
    <ActivePlayers
      activeUsers={activePlayers}
      onScoreChange={handleScoreChange}
      gameCounter={gameCounter}
      onSaveGame={handleSaveGame}
      allUsers={users}
      gameHistory={gameHistory}
      isRummyRound={isRummyRound}
      setIsRummyRound={setIsRummyRound}
      isSplitView={isLargeScreen && isSplitView}
      outLimit={outLimit}
      calculateTotalScore={calculateTotalScoreForUser}
    />
  );

  const renderGameHistory = () => (
    <GameHistory
      gameHistory={gameHistory}
      allUsers={users}
      onDeleteLastGame={handleDeleteLastGame}
      outLimit={outLimit}
      compelPoint={compelPoint}
      scootPoint={scootPoint}
      viewMode={historyViewMode}
      onToggleViewMode={(mode) => setHistoryViewMode(mode)}
      isLargeScreen={isLargeScreen}
      isSplitView={isSplitView}
      sessionData={currentSessionData}
    />
  );

  return (
    <div className={`flex flex-col items-center p-4 min-h-screen w-full transition-all duration-1000 bg-gradient-to-br ${currentThemeConfig.bg}`}>
      <header className="text-center mb-8 w-full pt-8 relative overflow-hidden">
        <div className="relative inline-block px-12 py-4">
          <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter relative z-10">
            <span className={`bg-clip-text text-transparent bg-gradient-to-br ${currentThemeConfig.accent} drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]`}>
              Rummy Star
            </span>
          </h1>
          {/* Logo shimmer overlay */}
          <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay animate-shimmer opacity-40"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
          <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.4em] font-black">{APP_VERSION}</p>
          {isLargeScreen && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSplitView(!isSplitView)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-lg ${
                  isSplitView ? 'bg-teal-500/20 text-teal-300 border-teal-500/30 ring-1 ring-teal-500/20' : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSplitView ? 'bg-teal-400 animate-pulse' : 'bg-gray-600'}`}></div>
                Dashboard: {isSplitView ? 'ON' : 'OFF'}
              </button>
            </div>
          )}
        </div>
      </header>

      <nav className="flex justify-center flex-wrap gap-2 sm:gap-4 mb-10 w-full max-w-6xl bg-black/40 p-2 rounded-3xl backdrop-blur-2xl border border-white/5 shadow-2xl">
        {[
          { id: 'manage-players', label: 'Players' },
          { id: 'active-players', label: `Round (${activePlayers.length})` },
          { id: 'game-history', label: `History (${gameHistory.length})` },
          { id: 'data', label: 'Backup' },
          { id: 'prefs', label: 'Rules' },
          { id: 'info', label: 'Info' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl font-black transition-all duration-300 text-xs sm:text-base border uppercase tracking-wider ${
              activeTab === tab.id
                ? 'bg-teal-500 text-white border-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.3)] scale-105'
                : 'bg-transparent text-gray-500 hover:text-white border-transparent hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className={`w-full flex flex-col items-center pb-24 ${isLargeScreen && isSplitView && (activeTab === 'active-players' || activeTab === 'game-history') ? 'max-w-screen-2xl' : 'max-w-4xl'}`}>
        {activeTab === 'manage-players' && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UserForm
              currentUserName={currentUserName}
              onNameChange={handleNameChange}
              onSave={handleSave}
              onClear={handleClear}
              editingUser={editingUser}
            />
            <UserList
              users={displayUsers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleCheck={handleToggleCheck}
              onProceedToRound={() => setActiveTab('active-players')}
            />
          </div>
        )}
        
        {activeTab === 'active-players' && (
          isLargeScreen && isSplitView ? (
            <div className="flex flex-col xl:flex-row gap-8 w-full items-start animate-in zoom-in-95 duration-500">
              <div className="w-full xl:w-2/5 flex justify-center sticky top-4">
                {renderActivePlayers()}
              </div>
              <div className="w-full xl:w-3/5 flex justify-center">
                {renderGameHistory()}
              </div>
            </div>
          ) : (
            renderActivePlayers()
          )
        )}
        
        {activeTab === 'game-history' && (
          isLargeScreen && isSplitView ? (
            <div className="flex flex-col xl:flex-row gap-8 w-full items-start animate-in zoom-in-95 duration-500">
              <div className="w-full xl:w-2/5 flex justify-center sticky top-4">
                {renderActivePlayers()}
              </div>
              <div className="w-full xl:w-3/5 flex justify-center">
                {renderGameHistory()}
              </div>
            </div>
          ) : (
            renderGameHistory()
          )
        )}
        
        {activeTab === 'data' && (
          <DataManagement 
            onResetApp={handleResetApp} 
            onImportSession={handleImportSession}
            sessionData={currentSessionData}
          />
        )}
        {activeTab === 'prefs' && (
          <Preferences 
            outLimit={outLimit}
            onOutLimitChange={handleOutLimitChange}
            compelPoint={compelPoint}
            onCompelPointChange={handleCompelPointChange}
            scootPoint={scootPoint}
            onScootPointChange={handleScootPointChange}
            hideDefaultUsers={hideDefaultUsers}
            onToggleHideDefault={setHideDefaultUsers}
          />
        )}
        {activeTab === 'info' && <InfoSection version={APP_VERSION} outLimit={outLimit} compelPoint={compelPoint} />}
      </main>
    </div>
  );
}

export default App;