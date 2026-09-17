import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Brain, LogOut, WifiOff, Bell, Calendar, TrendingUp } from 'lucide-react';
import { PatientService } from '../services/api/PatientService';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import type { SupportedLanguageCode } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

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
        <h1 className="text-3xl font-bold text-primary-teal mb-4">Welcome to Calm Intelligence</h1>
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
    { path: '/patient', label: t('nav.home'), icon: Home },
    { path: '/patient/games', label: t('nav.activities'), icon: Brain },
    { path: '/patient/routine', label: t('nav.routine'), icon: Calendar },
    { path: '/patient/insights', label: t('nav.insights'), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background-warm text-text-charcoal flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-primary-teal text-white shadow-md sticky top-0 z-50 h-[85px] flex items-center rounded-b-[24px]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* LEFT */}
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-wide leading-tight">Calm Intelligence</h1>
              {profile?.nickname || profile?.name ? (
                <p className="text-sm text-white/80 font-medium">{profile.nickname || profile.name}</p>
              ) : null}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 md:gap-4">
            <select 
              value={language} 
              onChange={handleLanguageChange}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1 text-sm outline-none cursor-pointer hidden sm:block"
            >
              <option value="en" className="text-black">EN</option>
              <option value="as" className="text-black">অসমীয়া</option>
              <option value="mr" className="text-black">मराठी</option>
            </select>

            {isOffline && (
              <div className="flex items-center gap-1 bg-white/20 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                <WifiOff className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.offline')}</span>
              </div>
            )}
            
            <button className="p-3 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors" aria-label="Notifications">
              <Bell className="w-6 h-6" />
            </button>
            
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-white/90 hover:text-white hover:bg-white/10 p-3 rounded-full md:rounded-xl transition-colors"
              aria-label={t('common.exit')}
            >
              <LogOut className="w-6 h-6" />
              <span className="text-lg font-medium hidden md:inline">{t('common.exit')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full pb-32">
        <Outlet />
      </main>

      {/* Non-Diagnostic Disclaimer */}
      <div className="bg-background-warm pb-6 text-center px-4 text-xs text-text-charcoal/40 mb-20 max-w-3xl mx-auto">
        <p>This platform supports cognitive activities and personal memory recall. It is not a medical or diagnostic tool. If you have concerns about memory or thinking, please consult a healthcare professional.</p>
      </div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50 pb-safe border-t border-gray-100"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto flex justify-around px-2 py-4 md:py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/patient' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className="flex flex-col items-center justify-center min-w-[70px] md:min-w-[100px] group"
              >
                <div className={`p-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary-teal/10 text-primary-teal scale-110' 
                    : 'text-text-charcoal/50 group-hover:bg-gray-50 group-hover:text-text-charcoal'
                }`}>
                  <Icon className={`w-7 h-7 md:w-8 md:h-8 ${isActive ? 'text-primary-teal stroke-[2.5]' : 'stroke-[1.5]'}`} />
                </div>
                <span className={`text-[11px] md:text-sm mt-1 transition-colors ${
                  isActive ? 'font-bold text-primary-teal' : 'font-medium text-text-charcoal/60 group-hover:text-text-charcoal'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-6 h-1 bg-primary-teal rounded-full mt-1.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default PatientLayout;
