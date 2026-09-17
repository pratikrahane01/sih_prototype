import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientService } from '../../services/api/PatientService';
import { BaselineService } from '../../services/api/BaselineService';
import { TelemetryService } from '../../services/telemetry/TelemetryService';
import type { Patient, GameAttempt } from '../../types';

import { MemoryBaseline } from '../../components/games/MemoryBaseline';
import { AttentionBaseline } from '../../components/games/AttentionBaseline';
import { PatternBaseline } from '../../components/games/PatternBaseline';
import { SpatialBaseline } from '../../components/games/SpatialBaseline';
import { BaselineSummary } from '../../components/games/BaselineSummary';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [language, setLanguage] = useState<'en' | 'hi' | 'as'>('en');
  
  const [nickname, setNickname] = useState('');
  const [favoriteActivities, setFavoriteActivities] = useState('');
  const [favoriteColors, setFavoriteColors] = useState('');
  
  const [cgName, setCgName] = useState('');
  const [cgRelation, setCgRelation] = useState('');
  const [cgContact, setCgContact] = useState('');

  const [duration, setDuration] = useState(10);
  const [time, setTime] = useState('Morning');
  const [voice, setVoice] = useState(true);

  const handleNext = () => setStep(s => s + 1);

  const saveProfile = () => {
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      name,
      age: Number(age) || 0,
      language,
      region: 'NER',
      caregiverId: crypto.randomUUID(), // Mock Caregiver ID for now
      nickname,
      favoriteActivities: favoriteActivities.split(',').map(s => s.trim()).filter(Boolean),
      favoriteColors: favoriteColors.split(',').map(s => s.trim()).filter(Boolean),
      activityDurationPreference: duration,
      preferredTime: time,
      voiceMode: voice,
    };
    PatientService.saveProfile(newPatient);
    BaselineService.startSession(newPatient.id);
    handleNext();
  };

  const handleBaselineComplete = (domain: string, result: { score: number; accuracy: number; responseTime: number }) => {
    const patient = PatientService.getProfile();
    if (!patient) return;

    // Record Telemetry
    const attempt: GameAttempt = {
      id: crypto.randomUUID(),
      userId: patient.id,
      gameId: `${domain}-baseline`,
      domain,
      difficulty: 1,
      score: result.score,
      accuracy: result.accuracy,
      responseTime: result.responseTime,
      mistakes: 0,
      hints: 0,
      retries: 0,
      completed: true,
      timestamp: new Date().toISOString()
    };
    TelemetryService.recordAttempt(attempt);

    // Update Baseline Session
    BaselineService.addDomainResult({
      domain,
      score: BaselineService.calculateDomainScoreFromAttempt(attempt) * 100, // store as 0-100 percentage
      accuracy: result.accuracy,
      responseTime: result.responseTime,
      mistakes: 0,
      completed: true
    });

    handleNext();
  };

  const completeOnboarding = () => {
    const session = BaselineService.completeSession();
    if (session && session.overallScore !== undefined) {
      const patient = PatientService.getProfile();
      if (patient) {
        // Convert array of domains to Record mapping
        const profileMap: Record<string, number> = {};
        session.domains.forEach(d => { profileMap[d.domain] = d.score; });
        PatientService.updateProfile({ baselineProfile: profileMap });
      }
    }
    navigate('/patient');
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-primary-teal mb-6">Welcome</h2>
            <p className="text-2xl text-text-charcoal mb-12">Let's set up your profile.</p>
            <button onClick={handleNext} className="bg-primary-teal text-white px-12 py-4 rounded-full text-2xl font-medium hover:bg-teal-700 transition">
              Continue
            </button>
          </div>
        );
      case 1:
        return (
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-primary-teal mb-8 text-center">Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xl mb-2">What is your name?</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-2">Age</label>
                <input type="number" value={age} onChange={e => setAge(Number(e.target.value) || '')} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-4 text-center">Preferred Language</label>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { code: 'en', name: 'English', native: 'English' },
                    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
                    { code: 'as', name: 'Assamese', native: 'অসমীয়া' }
                  ].map(lang => (
                    <button 
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as 'en' | 'hi' | 'as')} 
                      className={`w-full p-4 rounded-xl border-2 text-xl font-medium transition-colors flex justify-between items-center ${language === lang.code ? 'border-primary-teal bg-primary-teal/10 text-primary-teal' : 'border-gray-200 text-gray-600 hover:border-primary-teal/50'}`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-gray-500 font-normal">{lang.native}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleNext} disabled={!name} className="w-full bg-primary-teal text-white py-4 rounded-xl text-xl font-medium disabled:opacity-50 mt-8">
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-primary-teal mb-8 text-center">A bit about you</h2>
            <p className="text-lg text-text-charcoal/70 mb-6 text-center">This helps us personalize your activities. (Optional)</p>
            <div className="space-y-6">
              <div>
                <label className="block text-xl mb-2">Preferred Name / Nickname</label>
                <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-2">Favorite Activities (comma separated)</label>
                <input type="text" placeholder="e.g. Gardening, Reading" value={favoriteActivities} onChange={e => setFavoriteActivities(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-2">Favorite Colors (comma separated)</label>
                <input type="text" placeholder="e.g. Blue, Green" value={favoriteColors} onChange={e => setFavoriteColors(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <button onClick={handleNext} className="w-full bg-primary-teal text-white py-4 rounded-xl text-xl font-medium mt-8">
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-primary-teal mb-8 text-center">Caregiver Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xl mb-2">Caregiver Name</label>
                <input type="text" value={cgName} onChange={e => setCgName(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-2">Relationship</label>
                <input type="text" placeholder="e.g. Son, Daughter, Nurse" value={cgRelation} onChange={e => setCgRelation(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-2">Contact Number</label>
                <input type="text" value={cgContact} onChange={e => setCgContact(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <button onClick={handleNext} className="w-full bg-primary-teal text-white py-4 rounded-xl text-xl font-medium mt-8">
                Next
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-primary-teal mb-8 text-center">Your Preferences</h2>
            <div className="space-y-8">
              <div>
                <label className="block text-xl mb-4 text-center">Preferred Activity Duration</label>
                <div className="flex justify-center gap-4">
                  {[5, 10, 15].map(d => (
                    <button key={d} onClick={() => setDuration(d)} className={`px-6 py-3 rounded-xl border-2 text-lg font-medium transition-colors ${duration === d ? 'border-primary-teal bg-primary-teal/10 text-primary-teal' : 'border-gray-200 text-gray-600'}`}>
                      {d} min
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xl mb-4 text-center">Preferred Time of Day</label>
                <div className="flex justify-center gap-4">
                  {['Morning', 'Afternoon', 'Evening'].map(t => (
                    <button key={t} onClick={() => setTime(t)} className={`px-6 py-3 rounded-xl border-2 text-lg font-medium transition-colors ${time === t ? 'border-primary-teal bg-primary-teal/10 text-primary-teal' : 'border-gray-200 text-gray-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xl mb-4 text-center">Voice Assistance</label>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setVoice(true)} className={`px-8 py-3 rounded-xl border-2 text-lg font-medium transition-colors ${voice === true ? 'border-primary-teal bg-primary-teal/10 text-primary-teal' : 'border-gray-200 text-gray-600'}`}>On</button>
                  <button onClick={() => setVoice(false)} className={`px-8 py-3 rounded-xl border-2 text-lg font-medium transition-colors ${voice === false ? 'border-primary-teal bg-primary-teal/10 text-primary-teal' : 'border-gray-200 text-gray-600'}`}>Off</button>
                </div>
              </div>
              <button onClick={saveProfile} className="w-full bg-primary-teal text-white py-4 rounded-xl text-xl font-medium mt-8">
                Save Profile
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-primary-teal mb-6">Personal Activity Baseline</h2>
            <p className="text-2xl text-text-charcoal mb-8 leading-relaxed">
              We'll do a few simple activities to understand which types of activities feel comfortable for you.
            </p>
            <div className="bg-blue-50 border border-ai-blue/20 p-6 rounded-xl mb-12">
              <p className="text-lg text-text-charcoal/80">
                This activity helps personalize your cognitive games. It is not a medical or diagnostic test.
              </p>
            </div>
            <button onClick={handleNext} className="bg-primary-teal text-white px-12 py-4 rounded-full text-2xl font-medium hover:bg-teal-700 transition">
              Start Activities
            </button>
          </div>
        );
      case 6: return <MemoryBaseline onComplete={(res) => handleBaselineComplete('memory', res)} />;
      case 7: return <AttentionBaseline onComplete={(res) => handleBaselineComplete('attention', res)} />;
      case 8: return <PatternBaseline onComplete={(res) => handleBaselineComplete('pattern', res)} />;
      case 9: return <SpatialBaseline onComplete={(res) => handleBaselineComplete('spatial', res)} />;
      case 10: 
        const session = BaselineService.getSession();
        if (session) {
           // We will handle the actual completion route in BaselineSummary or here.
           // Since completeOnboarding needs to be called, we can modify BaselineSummary to take an onComplete prop instead of navigating directly.
           // Wait, I can just call completeOnboarding when the summary unmounts or from a button.
           // Let's modify BaselineSummary to accept an onFinish callback.
           return (
             <div className="w-full">
               <BaselineSummary session={session} />
               <div className="mt-8 flex justify-center">
                 <button onClick={completeOnboarding} className="bg-primary-teal text-white px-10 py-4 rounded-full text-xl font-medium hover:bg-teal-700 transition">
                   Go to Home
                 </button>
               </div>
             </div>
           );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      {renderStep()}
    </div>
  );
};
