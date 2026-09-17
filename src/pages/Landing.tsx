import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Heart, FlaskConical, RotateCcw, WifiOff } from 'lucide-react';
import { DemoDataService } from '../services/api/DemoDataService';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

const Landing: React.FC = () => {
  const [demoLoaded, setDemoLoaded] = useState(DemoDataService.isDemoLoaded());
  const [showConfirm, setShowConfirm] = useState(false);
  const { isOffline } = useOfflineStatus();

  const handleLoadDemo = () => {
    DemoDataService.loadDemoData();
    setDemoLoaded(true);
    setShowConfirm(false);
  };

  const handleResetDemo = () => {
    DemoDataService.resetDemoData();
    setDemoLoaded(false);
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-background-warm flex flex-col items-center justify-center p-6">

      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed top-4 right-4 flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50">
          <WifiOff className="w-4 h-4" />
          <span>Working offline</span>
        </div>
      )}

      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-12">
        <div className="mb-3">
          <span className="text-xs font-bold tracking-widest text-primary-teal/50 uppercase">SIH 2026 · Problem Statement 26003</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-teal mb-4">
          Calm Intelligence
        </h1>
        <p className="text-lg text-text-charcoal/80 mb-2 max-w-lg mx-auto">
          AI-Based Cognitive Activity and Personal Memory Assistance Platform
        </p>
        <p className="text-sm text-text-charcoal/50 mb-10 max-w-lg mx-auto">
          For elderly patients in the North Eastern Region (NER) · Multilingual-ready architecture
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Link 
            to="/patient" 
            className="group flex flex-col items-center p-8 bg-gray-50 rounded-xl hover:bg-primary-teal/5 border-2 border-transparent hover:border-primary-teal transition-all"
          >
            <div className="w-20 h-20 bg-primary-teal/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User className="w-10 h-10 text-primary-teal" />
            </div>
            <h2 className="text-2xl font-semibold text-text-charcoal mb-2">I am a Patient</h2>
            <p className="text-text-charcoal/60">Play cognitive activities and get personal memory assistance.</p>
          </Link>

          <Link 
            to="/caregiver" 
            className="group flex flex-col items-center p-8 bg-gray-50 rounded-xl hover:bg-secondary-sage/10 border-2 border-transparent hover:border-secondary-sage transition-all"
          >
            <div className="w-20 h-20 bg-secondary-sage/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-10 h-10 text-secondary-sage" />
            </div>
            <h2 className="text-2xl font-semibold text-text-charcoal mb-2">I am a Caregiver</h2>
            <p className="text-text-charcoal/60">Monitor activity performance and manage personalization.</p>
          </Link>
        </div>

        {/* Demo Data Section */}
        <div className="border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-4">SIH Demo Controls</p>

          {!demoLoaded ? (
            <button
              onClick={handleLoadDemo}
              className="inline-flex items-center gap-2 bg-attention-amber/10 text-attention-amber border border-attention-amber/30 px-6 py-3 rounded-xl font-medium hover:bg-attention-amber/20 transition text-sm"
            >
              <FlaskConical className="w-5 h-5" />
              Load Demo Data (Anita Sharma — Demo Patient)
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-secondary-sage/10 border border-secondary-sage/30 text-secondary-sage px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2">
                ✓ Demo patient loaded — Anita Sharma (Demo Patient)
              </div>
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Demo Data
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Reset demo data?</span>
                  <button onClick={handleResetDemo} className="text-sm text-red-500 hover:underline font-medium">Yes, reset</button>
                  <button onClick={() => setShowConfirm(false)} className="text-sm text-gray-400 hover:underline">Cancel</button>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">
            Demo data is fictional and for presentation only. It does not affect real patient information.
          </p>
        </div>
      </div>

      {/* Non-diagnostic disclaimer */}
      <p className="mt-6 text-xs text-text-charcoal/40 text-center max-w-md">
        This platform assists with cognitive activities and personal memory support. It is not a medical device and does not provide clinical diagnoses.
      </p>
    </div>
  );
};

export default Landing;
