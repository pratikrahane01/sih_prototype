import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Map } from 'lucide-react';
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
      <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gray-50 rounded-3xl mb-12 border-4 border-gray-200 overflow-hidden shadow-inner">
        <Map className="absolute inset-0 w-full h-full text-gray-200 opacity-30 p-4" />
        
        {/* Grid lines */}
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
          {Array(gridSize * gridSize).fill(null).map((_, i) => (
            <div key={i} className="border border-gray-200/50" />
          ))}
        </div>

        {/* Start Point (Center-ish) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-ai-blue/20 p-2 rounded-full">
          <MapPin className="w-8 h-8 text-ai-blue" fill="currentColor" />
        </div>
        
        {/* End Point (Top Right-ish) */}
        <div className={`absolute ${difficulty >= 3 ? 'top-4 right-4' : 'top-8 right-8'} bg-red-500/20 p-2 rounded-full`}>
          <MapPin className="w-8 h-8 text-red-500" fill="currentColor" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <button onClick={() => handleSelect(false)} className="py-6 text-2xl font-medium bg-gray-50 rounded-2xl border-4 border-transparent hover:border-gray-200 flex flex-col items-center gap-2">
          <Navigation className="w-8 h-8 transform -rotate-45" />
          {t('game.top_left')}
        </button>
        <button onClick={() => handleSelect(true)} className="py-6 text-2xl font-medium bg-gray-50 rounded-2xl border-4 border-transparent hover:border-primary-teal transition-all flex flex-col items-center gap-2">
          <Navigation className="w-8 h-8 transform rotate-45" />
          {t('game.top_right')}
        </button>
        <button onClick={() => handleSelect(false)} className="py-6 text-2xl font-medium bg-gray-50 rounded-2xl border-4 border-transparent hover:border-gray-200 flex flex-col items-center gap-2">
          <Navigation className="w-8 h-8 transform -rotate-135" />
          {t('game.bottom_left')}
        </button>
        <button onClick={() => handleSelect(false)} className="py-6 text-2xl font-medium bg-gray-50 rounded-2xl border-4 border-transparent hover:border-gray-200 flex flex-col items-center gap-2">
          <Navigation className="w-8 h-8 transform rotate-135" />
          {t('game.bottom_right')}
        </button>
      </div>
    </div>
  );
};
