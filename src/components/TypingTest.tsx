import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QUOTES_BY_DIFFICULTY, Difficulty, DUNE_LITANY } from '../constants';
import { GameState, ScoreEntry } from '../types';
import { auth, db, collection, addDoc, serverTimestamp } from '../firebase';
import { Trophy, RotateCcw, CheckCircle2, ChevronDown } from 'lucide-react';

interface TypingTestProps {
  onGameEnd: (score: ScoreEntry) => void;
}

export default function TypingTest({ onGameEnd }: TypingTestProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');
  const [quote, setQuote] = useState(DUNE_LITANY);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startNewGame = useCallback((diff?: Difficulty) => {
    const targetDiff = diff || difficulty;
    const quotes = QUOTES_BY_DIFFICULTY[targetDiff];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    setQuote(randomQuote);
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setIsSubmitting(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [difficulty]);

  useEffect(() => {
    // Initial game starts with Dune Litany (Hard)
    setQuote(DUNE_LITANY);
  }, []);

  useEffect(() => {
    if (startTime && !endTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsedMinutes = (now - startTime) / 60000;
        const wordsTyped = userInput.trim().split(/\s+/).length;
        setWpm(Math.round(wordsTyped / elapsedMinutes) || 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime, userInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (isFinished) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    setUserInput(value);

    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === quote[i]) {
        correctChars++;
      }
    }
    setAccuracy(Math.round((correctChars / value.length) * 100) || 100);

    // Check if finished
    if (value === quote) {
      const now = Date.now();
      setEndTime(now);
      setIsFinished(true);
      const elapsedMinutes = (now - startTime!) / 60000;
      const finalWpm = Math.round(quote.trim().split(/\s+/).length / elapsedMinutes);
      setWpm(finalWpm);
    }
  };

  const handleSubmitScore = async () => {
    if (!auth.currentUser || isSubmitting) return;
    setIsSubmitting(true);

    const score: ScoreEntry = {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Anonymous',
      wpm,
      accuracy,
      time: (endTime! - startTime!) / 1000,
      createdAt: serverTimestamp() as any,
    };

    try {
      await addDoc(collection(db, 'scores'), score);
      onGameEnd(score);
    } catch (error) {
      console.error("Error submitting score:", error);
      setIsSubmitting(false);
    }
  };

  const renderQuote = () => {
    return quote.split('').map((char, index) => {
      let color = 'text-slate-400 dark:text-slate-500';
      if (index < userInput.length) {
        color = userInput[index] === char 
          ? 'text-emerald-600 dark:text-emerald-400' 
          : 'text-rose-600 dark:text-rose-400 bg-rose-500/10';
      }
      return (
        <span key={index} className={`${color} transition-colors duration-150`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-2 sm:p-6 space-y-6 sm:space-y-8">
      {/* Difficulty Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              startNewGame(d);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              difficulty === d 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-white/10'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-none">
        <div className="text-center space-y-1">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono">WPM</p>
          <p className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tabular-nums">{wpm}</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono">Accuracy</p>
          <p className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tabular-nums">{accuracy}%</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono">Time</p>
          <p className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tabular-nums">
            {startTime && !endTime 
              ? ((Date.now() - startTime) / 1000).toFixed(1) 
              : endTime && startTime 
                ? ((endTime - startTime) / 1000).toFixed(1) 
                : '0.0'}s
          </p>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-2xl min-h-[180px] sm:min-h-[200px] flex flex-col justify-center">
          <div className="text-lg sm:text-2xl leading-relaxed font-medium select-none text-slate-700 dark:text-slate-200">
            {renderQuote()}
          </div>
          
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            disabled={isFinished}
            className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none"
            autoFocus
          />
          
          {!startTime && !isFinished && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl pointer-events-none"
            >
              <p className="text-slate-500 dark:text-slate-400 animate-pulse text-sm sm:text-base">Start typing to begin...</p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => startNewGame()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-white/10 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Test
        </button>
        
        {isFinished && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleSubmitScore}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Trophy className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Score'}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isFinished && !isSubmitting && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium"
          >
            <CheckCircle2 className="w-5 h-5" />
            Test Complete! Great job.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
