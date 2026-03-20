import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
}

export interface ScoreEntry {
  id?: string;
  userId: string;
  userName: string;
  wpm: number;
  accuracy: number;
  time: number;
  createdAt: Timestamp;
}

export interface GameState {
  startTime: number | null;
  endTime: number | null;
  wpm: number;
  accuracy: number;
  isFinished: boolean;
  userInput: string;
  currentQuote: string;
}
