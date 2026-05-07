import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import MonthlyStats from './pages/MonthlyStats';
import YearlyStats from './pages/YearlyStats';
import { supabase } from './lib/supabase';

export default function App() {
  const [view, setView] = useState<View>('monthly');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoaded(true);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen font-sans">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginPage onLogin={() => setIsAuthenticated(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen bg-brand-bg"
          >
            <Sidebar currentView={view} setView={setView} />
            <main className="flex-1 ml-64 p-12">
              <motion.div
                key={view}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {view === 'monthly' ? <MonthlyStats /> : <YearlyStats />}
              </motion.div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}