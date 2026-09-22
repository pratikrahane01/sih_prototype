import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Brain, LogOut, WifiOff, Bell, Calendar, TrendingUp } from 'lucide-react';
import { PatientService } from '../services/api/PatientService';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import type { SupportedLanguageCode } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PatientVoiceAssistant } from '../components/assistant/PatientVoiceAssistant';
const PatientLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOffline } = useOfflineStatus();
  const profile = PatientService.getProfile();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as SupportedLanguageCode;
    setLanguage(newLang);
  };

  // If no profile and not in onboarding, prompt setup
  if (!profile && location.pathname !== '/patient/onboarding') {
    return (
      <div className="min-h-screen bg-background-warm flex flex-col items-center justify-center p-8 text-center">
        <Brain className="w-16 h-16 text-primary-teal mb-6" />
        <h1 className="text-3xl font-bold text-primary-teal mb-4">Welcome to Smaran Sarathii</h1>
        <p className="text-xl text-text-charcoal/70 mb-8 max-w-md">
          Let's set up your personal profile to get started.
        </p>
        <button
          onClick={() => navigate('/patient/onboarding')}
          className="bg-primary-teal text-white px-10 py-4 rounded-full text-xl font-medium hover:bg-teal-700 transition"
        >
          Set Up Profile
        </button>
        <Link to="/" className="mt-6 text-text-charcoal/50 hover:text-text-charcoal text-base">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const navItems = [
    { path: '/patient', label: t('navigation.home', 'Home'), icon: Home, exact: true },
    { path: '/patient/games', label: t('navigation.activities', 'Activities'), icon: Brain },
    { path: '/patient/routine', label: t('navigation.routine', 'Routine'), icon: Calendar },
    { path: '/patient/insights', label: t('navigation.insights', 'Insights'), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background-warm text-text-charcoal flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-transparent sticky top-0 z-50 h-[76px] md:h-[84px] flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center gap-4">
          {/* LEFT: Logo & Patient Info */}
          <Link to="/patient" className="flex items-center space-x-3 group shrink-0">
            <div className="bg-primary-teal/10 group-hover:bg-primary-teal/20 p-2.5 rounded-2xl transition-colors">
              <Brain className="w-7 h-7 md:w-8 md:h-8 text-primary-teal" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-wide leading-tight">Smaran Sarathii</h1>
              {profile?.nickname || profile?.name ? (
                <p className="text-xs md:text-sm text-text-charcoal/70 font-medium truncate max-w-[140px] sm:max-w-[200px]">
                  {profile.nickname || profile.name}
                </p>
              ) : null}
            </div>
          </Link>

          {/* CENTER: Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/80 shadow-sm" aria-label="Desktop main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname === item.path || location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-teal text-white shadow-sm font-bold scale-[1.02]'
                      : 'text-text-charcoal/70 hover:text-primary-teal hover:bg-gray-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? 'text-white stroke-[2.5]' : 'stroke-2'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Actions (Language, Offline, Exit) */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <select 
              value={language} 
              onChange={handleLanguageChange}
              className="bg-white/80 hover:bg-white text-text-charcoal border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs md:text-sm font-medium outline-none cursor-pointer transition-colors shadow-sm"
              aria-label="Select Language"
            >
              <option value="as" className="text-black">অসমীয়া (AS)</option>
              <option value="mr" className="text-black">मराठी (MR)</option>
              <option value="hi" className="text-black">हिन्दी (HI)</option>
              <option value="en" className="text-black">English (EN)</option>
            </select>

            {isOffline && (
              <div className="flex items-center gap-1.5 bg-amber-500/15 text-amber-800 border border-amber-400/40 px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium">
                <WifiOff className="w-4 h-4" />
                <span className="hidden lg:inline">{t('common.offline', 'Offline')}</span>
              </div>
            )}
            
            <button className="p-2.5 text-text-charcoal/70 hover:text-primary-teal hover:bg-white/80 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-200 shadow-none hover:shadow-sm" aria-label="Notifications">
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            <Link 
              to="/" 
              className="flex items-center space-x-1.5 text-text-charcoal/80 hover:text-red-600 bg-white/80 hover:bg-red-50 px-3 md:px-4 py-2 rounded-xl transition-all font-medium text-sm md:text-base border border-gray-200 shadow-sm"
              aria-label={t('common.exit', 'Exit')}
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">{t('common.exit', 'Exit')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full pb-28 md:pb-12 pt-3 md:pt-6">
        <Outlet />
      </main>

      {/* Non-Diagnostic Disclaimer Footer */}
      <footer className="w-full bg-background-warm py-6 text-center px-4 text-xs text-text-charcoal/50 max-w-4xl mx-auto border-t border-gray-200/50 mt-auto">
        <p>This platform supports cognitive activities and personal memory recall. It is not a medical or diagnostic tool. If you have concerns about memory or thinking, please consult a healthcare professional.</p>
      </footer>

      {/* Bottom Navigation (Mobile Only) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-[0_-10px_35px_rgba(0,0,0,0.08)] z-50 pb-safe border-t border-gray-100"
        aria-label="Mobile navigation"
      >
        <div className="max-w-md mx-auto flex justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className="flex flex-col items-center justify-center min-w-[64px] group"
              >
                <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary-teal/10 text-primary-teal scale-105' 
                    : 'text-text-charcoal/50 group-hover:bg-gray-50 group-hover:text-text-charcoal'
                }`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-primary-teal stroke-[2.5]' : 'stroke-[1.5]'}`} />
                </div>
                <span className={`text-[11px] mt-0.5 transition-colors ${
                  isActive ? 'font-bold text-primary-teal' : 'font-medium text-text-charcoal/60 group-hover:text-text-charcoal'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-4 h-1 bg-primary-teal rounded-full mt-1" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Voice Assistant */}
      <PatientVoiceAssistant />
    </div>
  );
};

export default PatientLayout;
