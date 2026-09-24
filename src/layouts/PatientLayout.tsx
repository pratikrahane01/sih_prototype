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
    { path: '/patient', label: t('nav.home'), icon: Home },
    { path: '/patient/games', label: t('nav.activities'), icon: Brain },
    { path: '/patient/routine', label: t('nav.routine'), icon: Calendar },
    { path: '/patient/insights', label: t('nav.insights'), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background-warm text-text-charcoal flex flex-col font-sans">
      {/* Unified Top Navbar */}
      <header className="bg-background-warm sticky top-0 z-50 py-4 px-4 md:px-8 border-b border-gray-200/50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {/* LEFT: Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#E2F1ED] p-2.5 rounded-2xl">
              <Brain className="w-7 h-7 text-primary-teal" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[17px] font-bold text-primary-teal leading-tight">Smaran Sarathii</h1>
              {profile?.nickname || profile?.name ? (
                <p className="text-[13px] text-text-charcoal/60 font-medium">{profile.nickname || profile.name}</p>
              ) : null}
            </div>
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="flex items-center bg-white border border-gray-100 rounded-full p-1.5 shadow-sm shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/patient' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-teal text-white shadow-md'
                      : 'text-text-charcoal/60 hover:text-text-charcoal hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <select 
              value={language} 
              onChange={handleLanguageChange}
              className="bg-white border border-gray-100 text-text-charcoal rounded-full px-4 py-2.5 text-sm font-medium outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm appearance-none pr-9 relative"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिन्दी</option>
            </select>

            {isOffline && (
              <div className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded-full text-sm font-medium border border-red-100 shadow-sm">
                <WifiOff className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.offline')}</span>
              </div>
            )}
            
            <button className="p-2.5 text-text-charcoal/60 hover:text-text-charcoal hover:bg-gray-50 rounded-full transition-colors border border-gray-100 shadow-sm bg-white flex items-center justify-center" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            
            <Link 
              to="/" 
              className="flex items-center gap-2 bg-white border border-gray-100 text-text-charcoal hover:bg-gray-50 px-5 py-2.5 rounded-full transition-colors shadow-sm"
              aria-label={t('common.exit')}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden md:inline">{t('common.exit')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1400px] mx-auto pb-12 pt-4 px-4 md:px-8">
        <Outlet />
      </main>

      {/* Non-Diagnostic Disclaimer */}
      <div className="bg-background-warm pb-6 text-center px-4 text-xs text-text-charcoal/40 mb-8 max-w-3xl mx-auto">
        <p>This platform supports cognitive activities and personal memory recall. It is not a medical or diagnostic tool. If you have concerns about memory or thinking, please consult a healthcare professional.</p>
      </div>

      {/* Voice Assistant */}
      <PatientVoiceAssistant />
    </div>
  );
};

export default PatientLayout;
