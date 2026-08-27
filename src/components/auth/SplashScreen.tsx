import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Store, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const SplashScreen: React.FC = () => {
  const { navigateTo } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigateTo('choice');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigateTo]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center z-10 max-w-sm flex flex-col items-center"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-6 border border-indigo-400/20">
          <Store className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight font-heading text-white mb-2">
          MERIDUKAN
        </h1>

        <p className="text-indigo-200/90 text-sm font-medium mb-8">
          Manage Your Business Easily
        </p>

        <div className="flex items-center gap-2.5 text-indigo-300/80 text-xs py-2 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs mb-8">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Starting business workspace...</span>
        </div>

        <button
          onClick={() => navigateTo('choice')}
          id="splash-skip-btn"
          className="inline-flex items-center gap-2 text-xs text-indigo-300 hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer"
        >
          <span>Skip directly</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      <div className="absolute bottom-6 text-center text-xs text-slate-500 font-medium">
        Version 1.0 • Meri Dukan Retail
      </div>
    </div>
  );
};
