import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  FlaskConical,
  RotateCcw,
  WifiOff,
  Brain,
  ArrowRight,
  Mic,
  ShieldCheck,
  Activity,
  Globe,
  CheckCircle2,
  Music,
  Check
} from 'lucide-react';
import { DemoDataService } from '../services/api/DemoDataService';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { useLanguage } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/accessibility/LanguageService';
import type { SupportedLanguageCode } from '../types';

const Landing: React.FC = () => {
  const [demoLoaded, setDemoLoaded] = useState(DemoDataService.isDemoLoaded());
  const [showConfirm, setShowConfirm] = useState(false);
  const [justLoadedToast, setJustLoadedToast] = useState(false);
  const { isOffline } = useOfflineStatus();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLoadDemo = () => {
    DemoDataService.loadDemoData();
    setDemoLoaded(true);
    setShowConfirm(false);
    setJustLoadedToast(true);
    setTimeout(() => setJustLoadedToast(false), 3000);
  };

  const handleResetDemo = () => {
    DemoDataService.resetDemoData();
    setDemoLoaded(false);
    setShowConfirm(false);
  };

  const handleLanguageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguageCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F7F5] via-[#F8FAF7] to-[#EEF4F1] text-text-charcoal flex flex-col font-sans selection:bg-primary-teal/20">

      {/* Toast notification */}
      {justLoadedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary-teal text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-teal-400/30">
          <CheckCircle2 className="w-5 h-5 text-teal-200 shrink-0" />
          <p className="text-sm font-semibold">Demo profile loaded (Anita Sharma)</p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">

          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-teal flex items-center justify-center text-white shadow-sm shadow-primary-teal/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg sm:text-xl text-primary-teal">
                Smaran Sarathii
              </span>

            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1.5 rounded-xl shadow-xs">
              <Globe className="w-3.5 h-3.5 text-primary-teal shrink-0" />
              <select
                value={language}
                onChange={handleLanguageSelect}
                aria-label="Interface Language"
                className="text-xs sm:text-sm font-medium bg-transparent border-none outline-none cursor-pointer text-text-charcoal"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Offline Status */}
            {isOffline && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-800 border border-amber-300">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-10">

        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto space-y-4">

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-text-charcoal tracking-tight leading-tight">
            Empowering Minds, <br />
            <span className="text-primary-teal">Preserving Memories</span>
          </h1>

          <p className="text-sm sm:text-base text-text-charcoal/70 max-w-lg mx-auto leading-relaxed">
            Voice-assisted cognitive exercises, personalized reminiscence, and care insights for seniors and caregivers.
          </p>
        </section>

        {/* Role Cards Grid */}
        <section className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">

          {/* Patient Card */}
          <div
            onClick={() => navigate('/patient')}
            className="group relative bg-white rounded-3xl p-7 sm:p-8 border-2 border-primary-teal/20 hover:border-primary-teal shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-teal/10 text-primary-teal flex items-center justify-center group-hover:scale-105 transition-transform">
                <User className="w-7 h-7" />
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-primary-teal">
                  I am a Patient
                </h2>
                <p className="text-xs sm:text-sm text-text-charcoal/70 mt-1">
                  Play memory games, talk with your voice assistant, and view daily routine.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs font-medium text-text-charcoal/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-teal shrink-0" />
                  <span>Personal photo & music recall</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary-teal shrink-0" />
                  <span>Multilingual voice assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary-teal shrink-0" />
                  <span>Daily routine & diet guide</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/patient"
                className="w-full flex items-center justify-center gap-2 bg-primary-teal text-white font-bold text-sm py-3 px-4 rounded-xl group-hover:bg-[#0b4749] shadow-sm transition"
              >
                <span>Enter as Patient</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Caregiver Card */}
          <div
            onClick={() => navigate('/caregiver')}
            className="group relative bg-white rounded-3xl p-7 sm:p-8 border-2 border-secondary-sage/40 hover:border-secondary-sage-dark shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary-sage/20 text-secondary-sage-dark flex items-center justify-center group-hover:scale-105 transition-transform">
                <Heart className="w-7 h-7" />
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-secondary-sage-dark">
                  I am a Caregiver
                </h2>
                <p className="text-xs sm:text-sm text-text-charcoal/70 mt-1">
                  Track cognitive trends, manage family memories, and schedule reminders.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs font-medium text-text-charcoal/80">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-secondary-sage-dark shrink-0" />
                  <span>Performance & accuracy tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary-sage-dark shrink-0" />
                  <span>Memory vault & family contacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-secondary-sage-dark shrink-0" />
                  <span>Daily schedule & medication timetable</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/caregiver"
                className="w-full flex items-center justify-center gap-2 bg-secondary-sage-dark text-white font-bold text-sm py-3 px-4 rounded-xl group-hover:bg-[#385B4E] shadow-sm transition"
              >
                <span>Enter as Caregiver</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </section>

        {/* Demo Controls Bar */}
        <section className="max-w-4xl mx-auto w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-charcoal">
                Demo Profile: Anita Sharma (72 yrs)
              </p>
              <p className="text-[11px] text-text-charcoal/60">
                Preloads sample memories, daily routine, and activity history.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!demoLoaded ? (
              <button
                onClick={handleLoadDemo}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Load Demo Data
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Loaded
                </span>
                {!showConfirm ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs bg-gray-50 p-1 rounded-lg border border-gray-200">
                    <button onClick={handleResetDemo} className="font-bold text-red-600 hover:underline">Reset</button>
                    <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:underline">Cancel</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 px-4 text-center mt-auto">
        <p className="text-xs text-text-charcoal/50 max-w-xl mx-auto">
          Smaran Sarathii · Cognitive activity and memory assistance platform. Not a medical diagnostic tool.
        </p>
      </footer>

    </div>
  );
};

export default Landing;
