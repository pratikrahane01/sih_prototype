import React, { useEffect, useState } from 'react';
import { RoutineService } from '../../services/api/RoutineService';
import { PatientService } from '../../services/api/PatientService';
import { LanguageService, SpeechSynthesisService } from '../../services/accessibility';
import { useLanguage } from '../../contexts/LanguageContext';
import type { RoutineItem } from '../../types';
import { CheckCircle2, Circle, Sun, Coffee, Pill, Activity, Moon, Users, Clock } from 'lucide-react';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Morning': return Sun;
    case 'Meals': return Coffee;
    case 'Medicine': return Pill;
    case 'Activity': return Activity;
    case 'Family': return Users;
    case 'Evening': return Moon;
    case 'Rest': return Moon;
    default: return Clock;
  }
};

export const DailyRoutine: React.FC = () => {
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const patientId = PatientService.getProfile()?.id || 'demo-patient';
  const { t } = useLanguage();
  const voiceEnabled = LanguageService.isVoiceModeEnabled();

  useEffect(() => {
    setRoutines(RoutineService.getPatientRoutine(patientId));
  }, [patientId]);

  const handleToggle = (item: RoutineItem) => {
    RoutineService.toggleCompletion(patientId, item.id);
    setRoutines(RoutineService.getPatientRoutine(patientId));

    if (!item.completed && voiceEnabled) {
      SpeechSynthesisService.speak(`${item.title} completed.`);
    }
  };

  const handlePlayVoice = (item: RoutineItem) => {
    if (voiceEnabled) {
      SpeechSynthesisService.speak(`${item.title} at ${item.time}.`);
    }
  };

  // Group by broad time of day
  const groupedRoutines = routines.reduce((acc, item) => {
    const hour = parseInt(item.time.split(':')[0], 10);
    let group = 'routine.category.morning';
    if (hour >= 12 && hour < 17) group = 'routine.category.afternoon'; 
    else if (hour >= 17) group = 'routine.category.evening';
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, RoutineItem[]>);

  const renderGroup = (title: string, items: RoutineItem[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-8" key={title}>
        <h3 className="text-2xl font-bold text-gray-700 mb-4 px-2">{t(title)}</h3>
        <div className="space-y-4">
          {items.map(item => {
            const Icon = getCategoryIcon(item.category);
            return (
              <div 
                key={item.id} 
                onClick={() => handleToggle(item)}
                className={`bg-white rounded-[24px] p-5 shadow-sm border ${item.completed ? 'border-secondary-sage/30 bg-secondary-sage/5 opacity-70' : 'border-gray-100'} hover:shadow-md transition-all cursor-pointer flex items-center justify-between min-h-[100px]`}
              >
                <div className="flex items-center space-x-4">
                  <div onClick={(e) => { e.stopPropagation(); handleToggle(item); }} className="shrink-0 p-2">
                    {item.completed ? (
                      <CheckCircle2 className="w-10 h-10 text-secondary-sage transition-all transform scale-110" />
                    ) : (
                      <Circle className="w-10 h-10 text-gray-300 hover:text-primary-teal transition-colors" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-text-charcoal">{item.time}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <span className={`text-sm font-semibold uppercase tracking-wider ${item.completed ? 'text-secondary-sage' : 'text-primary-teal'}`}>{t(`routine.category.${item.category.toLowerCase()}`)}</span>
                    </div>
                    <h4 className={`text-2xl font-semibold mt-1 ${item.completed ? 'text-gray-500 line-through' : 'text-text-charcoal'}`}>
                      {item.title}
                    </h4>
                  </div>
                </div>
                
                <div className="shrink-0 flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl ${item.completed ? 'bg-white' : 'bg-blue-50 text-ai-blue'}`}>
                     <Icon className="w-8 h-8" />
                  </div>
                  {voiceEnabled && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePlayVoice(item); }}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors hidden sm:block"
                      aria-label="Play voice description"
                    >
                      <Clock className="w-6 h-6 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center px-4 md:px-0">
      <div className="mb-10 text-center w-full max-w-3xl">
        <h2 className="text-4xl font-bold text-primary-teal mb-4">{t('routine.title')}</h2>
        <p className="text-xl text-text-charcoal/80 font-medium">{t('routine.subtitle')}</p>
      </div>

      <div className="w-full max-w-3xl">
        {routines.length === 0 ? (
           <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
             <p className="text-xl text-gray-500">{t('routine.empty')}</p>
           </div>
        ) : (
          <>
            {renderGroup('routine.category.morning', groupedRoutines['routine.category.morning'])}
            {renderGroup('routine.category.afternoon', groupedRoutines['routine.category.afternoon'])}
            {renderGroup('routine.category.evening', groupedRoutines['routine.category.evening'])}
          </>
        )}
      </div>
    </div>
  );
};
