import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50"
      >
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] text-brand-brown font-bold uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-brand-cream/50 border-none rounded-2xl py-4 px-6 text-brand-brown font-medium focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
              />
              <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-brown/50" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-brand-brown font-bold uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-brand-cream/50 border-none rounded-2xl py-4 px-6 text-brand-brown font-medium focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
              />
              <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-brown/50" size={20} />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-brand-brown text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-brown/90 transition-all active:scale-[0.98] shadow-lg shadow-brand-brown/20 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'} <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
      <p className="mt-12 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} Upside Youth Mentoring • Auckland, NZ
      </p>
    </div>
  );
};

export default LoginPage;