
export type ThemeName = 'classic' | 'ocean' | 'midnight' | 'forest' | 'sunset';
export type HistoryViewMode = 'standard' | 'grid';

export interface User {
  id: string;
  name: string;
  isDefault: boolean;
  isChecked: boolean;
  score?: number | null; 
  isOut?: boolean; 
  overrideTotalScoreForIsOut?: number | null; 
  joinedAtGameIndex?: number | null; // Tracks the game history index when player joined/re-entered
}

export interface GameRecord {
  name: string;
  scores: { [userId: string]: number };
}

export interface RummySession {
  version: string;
  users: User[];
  gameHistory: GameRecord[];
  gameCounter: number;
  isRummyRound: boolean;
  isEntryProhibitedGlobally: boolean;
  theme: ThemeName;
  hideDefaultUsers: boolean;
  outLimit: number;
  compelPoint: number;
  scootPoint: number;
  timestamp: string;
  historyViewMode?: HistoryViewMode;
}
