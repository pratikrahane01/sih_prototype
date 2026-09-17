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
import { useLanguage } from '../../contexts/LanguageContext';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const { t } = useLanguage();

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
            <h2 className="text-4xl font-bold text-primary-teal mb-6">{t('onboarding.welcome')}</h2>
            <p className="text-2xl text-text-charcoal mb-12">{t('onboarding.setupProfile')}</p>
            <button onClick={handleNext} className="bg-primary-teal text-white px-12 py-4 rounded-full text-2xl font-medium hover:bg-teal-700 transition">
              {t('onboarding.continue')}
            </button>
          </div>
        );
      case 1:
        return (
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-primary-teal mb-8 text-center">{t('onboarding.basicInfo')}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xl mb-2">{t('onboarding.whatIsName')}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-2">{t('onboarding.age')}</label>
                <input type="number" value={age} onChange={e => setAge(Number(e.target.value) || '')} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-4 text-center">{t('onboarding.preferredLanguage')}</label>
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
                {t('onboarding.next')}
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-primary-teal mb-8 text-center">{t('onboarding.bitAboutYou')}</h2>
            <p className="text-lg text-text-charcoal/70 mb-6 text-center">{t('onboarding.optionalHelp')}</p>
            <div className="space-y-6">
              <div>
                <label className="block text-xl mb-2">{t('onboarding.nickname')}</label>
                <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-2">{t('onboarding.favoriteActivities')}</label>
                <input type="text" placeholder={t('onboarding.favoriteActivitiesPlaceholder')} value={favoriteActivities} onChange={e => setFavoriteActivities(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-2">{t('onboarding.favoriteColors')}</label>
                <input type="text" placeholder={t('onboarding.favoriteColorsPlaceholder')} value={favoriteColors} onChange={e => setFavoriteColors(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <button onClick={handleNext} className="w-full bg-primary-teal text-white py-4 rounded-xl text-xl font-medium mt-8">
                {t('onboarding.next')}
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-primary-teal mb-8 text-center">{t('onboarding.caregiverDetails')}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xl mb-2">{t('onboarding.caregiverName')}</label>
                <input type="text" value={cgName} onChange={e => setCgName(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-2">{t('onboarding.relationship')}</label>
                <input type="text" placeholder={t('onboarding.relationshipPlaceholder')} value={cgRelation} onChange={e => setCgRelation(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-xl mb-2">{t('onboarding.contactNumber')}</label>
                <input type="text" value={cgContact} onChange={e => setCgContact(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl" />
              </div>
              <button onClick={handleNext} className="w-full bg-primary-teal text-white py-4 rounded-xl text-xl font-medium mt-8">
                {t('onboarding.next')}
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-primary-teal mb-8 text-center">{t('onboarding.yourPreferences')}</h2>
            <div className="space-y-8">
              <div>
                <label className="block text-xl mb-4 text-center">{t('onboarding.activityDuration')}</label>
                <div className="flex justify-center gap-4">
                  {[5, 10, 15].map(d => (
                    <button key={d} onClick={() => setDuration(d)} className={`px-6 py-3 rounded-xl border-2 text-lg font-medium transition-colors ${duration === d ? 'border-primary-teal bg-primary-teal/10 text-primary-teal' : 'border-gray-200 text-gray-600'}`}>
                      {d} {t('onboarding.min')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xl mb-4 text-center">{t('onboarding.timeOfDay')}</label>
                <div className="flex justify-center gap-4">
                  {[{ key: 'Morning', val: t('onboarding.morning') }, { key: 'Afternoon', val: t('onboarding.afternoon') }, { key: 'Evening', val: t('onboarding.evening') }].map(tObj => (
                    <button key={tObj.key} onClick={() => setTime(tObj.key)} className={`px-6 py-3 rounded-xl border-2 text-lg font-medium transition-colors ${time === tObj.key ? 'border-primary-teal bg-primary-teal/10 text-primary-teal' : 'border-gray-200 text-gray-600'}`}>
                      {tObj.val}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xl mb-4 text-center">{t('onboarding.voiceAssistance')}</label>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setVoice(true)} className={`px-8 py-3 rounded-xl border-2 text-lg font-medium transition-colors ${voice === true ? 'border-primary-teal bg-primary-teal/10 text-primary-teal' : 'border-gray-200 text-gray-600'}`}>{t('onboarding.on')}</button>
                  <button onClick={() => setVoice(false)} className={`px-8 py-3 rounded-xl border-2 text-lg font-medium transition-colors ${voice === false ? 'border-primary-teal bg-primary-teal/10 text-primary-teal' : 'border-gray-200 text-gray-600'}`}>{t('onboarding.off')}</button>
                </div>
              </div>
              <button onClick={saveProfile} className="w-full bg-primary-teal text-white py-4 rounded-xl text-xl font-medium mt-8">
                {t('onboarding.saveProfile')}
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-primary-teal mb-6">{t('onboarding.baselineTitle')}</h2>
            <p className="text-2xl text-text-charcoal mb-8 leading-relaxed">
              {t('onboarding.baselineDesc')}
            </p>
            <div className="bg-blue-50 border border-ai-blue/20 p-6 rounded-xl mb-12">
              <p className="text-lg text-text-charcoal/80">
                {t('onboarding.baselineNote')}
              </p>
            </div>
            <button onClick={handleNext} className="bg-primary-teal text-white px-12 py-4 rounded-full text-2xl font-medium hover:bg-teal-700 transition">
              {t('onboarding.startActivities')}
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
                  {t('onboarding.goToHome')}
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
