import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, orderBy, limit, onSnapshot } from '../firebase';
import { ScoreEntry } from '../types';
import { Trophy, Timer, Target, Zap, User } from 'lucide-react';

export default function Leaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'scores'), orderBy('wpm', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scoreData: ScoreEntry[] = [];
      snapshot.forEach((doc) => {
        scoreData.push({ id: doc.id, ...doc.data() } as ScoreEntry);
      });
      setScores(scoreData);
      setLoading(false);
    }, (error) => {
      console.error("Leaderboard error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-6">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 dark:text-amber-400" />
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Global Leaderboard</h2>
      </div>

      <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl dark:shadow-2xl">
        <div className="grid grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 sm:col-span-5">User</div>
          <div className="col-span-2 text-center">WPM</div>
          <div className="col-span-2 text-center">Acc</div>
          <div className="col-span-2 text-center hidden sm:block">Time</div>
          <div className="col-span-2 text-center sm:hidden">T</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          <AnimatePresence mode="popLayout">
            {scores.map((score, index) => (
              <motion.div
                key={score.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`grid grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                  index === 0 ? 'bg-amber-500/5 dark:bg-amber-500/10' : 
                  index === 1 ? 'bg-slate-400/5 dark:bg-slate-400/10' : 
                  index === 2 ? 'bg-amber-700/5 dark:bg-amber-700/10' : ''
                }`}
              >
                <div className="col-span-1 text-center font-mono font-bold text-sm sm:text-base">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div className="col-span-5 sm:col-span-5 flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-white/10 overflow-hidden">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white truncate text-xs sm:text-sm">{score.userName}</span>
                </div>
                <div className="col-span-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                  {score.wpm}
                </div>
                <div className="col-span-2 text-center font-mono text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                  {score.accuracy}%
                </div>
                <div className="col-span-2 text-center font-mono text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                  {score.time.toFixed(1)}s
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {scores.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No scores yet. Be the first to submit!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
