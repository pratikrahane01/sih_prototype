import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Map, Home, Trees } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Props {
  difficulty: number;
  onComplete: (result: any) => void;
}

export const SpatialGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [startTime, setStartTime] = useState<number>(0);
  const [mistakes, setMistakes] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleSelect = (isCorrect: boolean) => {
    if (isCorrect) {
      const responseTime = Date.now() - startTime;
      const accuracy = Math.max(0, 100 - (mistakes * 25));
      
      onComplete({
        score: accuracy,
        accuracy,
        averageResponseTime: responseTime,
        mistakes,
        hints: 0,
        retries: 0
      });
    } else {
      setMistakes(m => m + 1);
    }
  };

  // Diff 1: Simple 3x3, Diff 4: 5x5
  const gridSize = difficulty >= 3 ? 5 : 3;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#f8f9e8] to-[#e8f4e5] rounded-[2.5rem] mb-12 border border-white/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-4 ring-white">
        <Map className="absolute inset-0 w-full h-full text-green-900/5 p-4" />
        <Home className="absolute top-4 left-4 w-24 h-24 text-orange-900/10 -rotate-12" />
        <Trees className="absolute bottom-4 right-12 w-32 h-32 text-green-900/10 rotate-12" />
        
        {/* Grid lines */}
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
          {Array(gridSize * gridSize).fill(null).map((_, i) => (
            <div key={i} className="border border-blue-900-[0.03]" />
          ))}
        </div>

        {/* Start Point (Center-ish) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 bg-ai-blue/20 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-ai-blue/10 p-3 rounded-full backdrop-blur-sm border border-ai-blue/20">
            <MapPin className="w-8 h-8 text-ai-blue drop-shadow-md" fill="currentColor" />
          </div>
        </div>
        
        {/* End Point (Top Right-ish) */}
        <div className={`absolute ${difficulty >= 3 ? 'top-4 right-4' : 'top-8 right-8'}`}>
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
          <div className="relative bg-red-500/10 p-3 rounded-full backdrop-blur-sm border border-red-500/20">
            <MapPin className="w-8 h-8 text-red-500 drop-shadow-md" fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
        <button onClick={() => handleSelect(false)} className="group py-8 text-xl font-medium bg-white rounded-3xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-3">
          <Navigation className="w-8 h-8 transform -rotate-45 text-slate-400 group-hover:text-ai-blue transition-colors duration-300" />
          <span className="text-slate-600 group-hover:text-slate-800">{t('game.top_left')}</span>
        </button>
        <button onClick={() => handleSelect(true)} className="group py-8 text-xl font-medium bg-white rounded-3xl border border-gray-100 hover:border-teal-100 hover:bg-teal-50/50 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-3">
          <Navigation className="w-8 h-8 transform rotate-45 text-slate-400 group-hover:text-primary-teal transition-colors duration-300" />
          <span className="text-slate-600 group-hover:text-slate-800">{t('game.top_right')}</span>
        </button>
        <button onClick={() => handleSelect(false)} className="group py-8 text-xl font-medium bg-white rounded-3xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-3">
          <Navigation className="w-8 h-8 transform -rotate-135 text-slate-400 group-hover:text-ai-blue transition-colors duration-300" />
          <span className="text-slate-600 group-hover:text-slate-800">{t('game.bottom_left')}</span>
        </button>
        <button onClick={() => handleSelect(false)} className="group py-8 text-xl font-medium bg-white rounded-3xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-3">
          <Navigation className="w-8 h-8 transform rotate-135 text-slate-400 group-hover:text-ai-blue transition-colors duration-300" />
          <span className="text-slate-600 group-hover:text-slate-800">{t('game.bottom_right')}</span>
        </button>
      </div>
    </div>
  );
};
