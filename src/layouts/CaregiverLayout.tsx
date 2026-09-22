import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, Bell, BarChart2, ArrowLeft, WifiOff, Menu, X, Heart, Calendar } from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

const CaregiverLayout: React.FC = () => {
  const location = useLocation();
  const { isOffline } = useOfflineStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarLinks = [
    { path: '/caregiver', label: 'Dashboard', icon: BarChart2, exact: true },
    { path: '/caregiver/family', label: 'Family Contacts', icon: Users },
    { path: '/caregiver/memories', label: 'Personal Memories', icon: Heart },
    { path: '/caregiver/routine', label: 'Daily Routine', icon: Calendar },
    { path: '/caregiver/diet', label: 'Diet Preferences', icon: Heart },
    { path: '/caregiver/patients', label: 'Patients', icon: Users },
    { path: '/caregiver/reminders', label: 'Reminders', icon: Bell },
  ];

  const isActive = (link: typeof sidebarLinks[number]) => {
    if (link.exact) return location.pathname === link.path;
    return location.pathname.startsWith(link.path);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 text-text-charcoal flex font-sans">
      {/* Desktop Sidebar Navigation - Fixed Display Height */}
      <aside className="w-64 h-screen max-h-screen bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0 sticky top-0 z-30 shadow-xs">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-primary-teal">Caregiver Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Calm Intelligence</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Caregiver navigation">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.path}
                to={link.path}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-primary-teal/10 text-primary-teal font-bold shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary-teal stroke-[2.5]' : 'text-gray-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0 bg-white">
          {isOffline && (
            <div className="flex items-center gap-2 text-gray-500 text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 font-medium">
              <WifiOff className="w-4 h-4 text-amber-600" />
              <span>Working offline</span>
            </div>
          )}
          <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50/80 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area - Independent Scroll */}
      <div className="flex-1 flex flex-col h-screen max-h-screen overflow-y-auto min-w-0 bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 md:hidden flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-primary-teal">Caregiver Portal</h2>
          <div className="flex items-center gap-3">
            {isOffline && <WifiOff className="w-5 h-5 text-gray-500" aria-label="Working offline" />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-1 flex-shrink-0 shadow-lg">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    active ? 'bg-primary-teal/10 text-primary-teal font-semibold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition">
              <ArrowLeft className="w-5 h-5" />
              <span>Exit Portal</span>
            </Link>
          </div>
        )}

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Non-Diagnostic Disclaimer */}
        <footer className="p-6 text-center text-xs text-gray-400 border-t border-gray-200 bg-white mt-auto flex-shrink-0">
          <p>
            Calm Intelligence monitors cognitive activity performance to support caregiving decisions.
            It is not a medical device and does not provide clinical diagnoses or medical recommendations.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CaregiverLayout;
