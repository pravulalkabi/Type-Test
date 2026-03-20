import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User, db, doc, setDoc, serverTimestamp } from './firebase';
import TypingTest from './components/TypingTest';
import Leaderboard from './components/Leaderboard';
import { Keyboard, Trophy, LogOut, LogIn, Github, Twitter, Sun, Moon } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'test' | 'leaderboard'>('test');
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-emerald-500/30 transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('test')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Keyboard className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">Trinken Type</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex items-center gap-6">
              <button 
                onClick={() => setView('test')}
                className={`text-sm font-medium transition-colors ${view === 'test' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Test
              </button>
              <button 
                onClick={() => setView('leaderboard')}
                className={`text-sm font-medium transition-colors ${view === 'leaderboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Leaderboard
              </button>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1 sm:mx-2" />

            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-white/10" referrerPolicy="no-referrer" />
                  )}
                  <span className="text-sm font-medium hidden md:inline">{user.displayName}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Nav */}
        <div className="sm:hidden flex items-center justify-center gap-8 py-2 border-t border-slate-200 dark:border-white/5">
          <button 
            onClick={() => setView('test')}
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${view === 'test' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Test
          </button>
          <button 
            onClick={() => setView('leaderboard')}
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${view === 'leaderboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Leaderboard
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {view === 'test' ? (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 sm:space-y-12"
            >
              <div className="text-center space-y-3 sm:space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                  Test your <span className="text-emerald-500">speed.</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
                  Improve your typing skills with real-time feedback and compete with others globally.
                </p>
              </div>

              {!user ? (
                <div className="max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-6 shadow-xl dark:shadow-none">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <LogIn className="text-emerald-500 w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sign in to compete</h3>
                    <p className="text-slate-500 dark:text-slate-400">You need to be signed in to submit your scores to the global leaderboard.</p>
                  </div>
                  <button 
                    onClick={handleSignIn}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-[0.98]"
                  >
                    Sign in with Google
                  </button>
                </div>
              ) : (
                <TypingTest onGameEnd={() => setView('leaderboard')} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Leaderboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-8 sm:py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Keyboard className="w-5 h-5" />
            <span className="font-bold">Trinken Type</span>
          </div>
          <div className="flex gap-6 text-slate-500 text-sm">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex gap-4">
            <button className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Github className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Twitter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
