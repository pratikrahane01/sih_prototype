import React, { useState, useEffect } from 'react';
import { BaselineActivityContainer } from './BaselineActivityContainer';
import { Map, MapPin } from 'lucide-react';

interface Props {
  onComplete: (result: { score: number; accuracy: number; responseTime: number }) => void;
}

export const SpatialBaseline: React.FC<Props> = ({ onComplete }) => {
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleSelect = (isCorrect: boolean) => {
    const responseTime = Date.now() - startTime;
    const accuracy = isCorrect ? 100 : 0;
    const score = isCorrect ? 100 : 0;
    onComplete({ score, accuracy, responseTime });
  };

  return (
    <BaselineActivityContainer
      title="Spatial Activity"
      instructions="Which direction is the red pin from the blue pin?"
    >
      <div className="flex flex-col items-center w-full">
        <div className="relative w-64 h-64 bg-gray-100 rounded-2xl mb-8 border-4 border-gray-200">
          <Map className="absolute inset-0 w-full h-full text-gray-300 opacity-50 p-4" />
          
          {/* Blue Pin (Center) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MapPin className="w-10 h-10 text-ai-blue" fill="currentColor" />
          </div>
          
          {/* Red Pin (Top Right) */}
          <div className="absolute top-8 right-8">
            <MapPin className="w-10 h-10 text-red-500" fill="currentColor" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <button onClick={() => handleSelect(false)} className="py-4 text-xl font-medium bg-gray-50 rounded-xl hover:bg-gray-100 border-4 border-transparent">
            Top Left
          </button>
          <button onClick={() => handleSelect(true)} className="py-4 text-xl font-medium bg-gray-50 rounded-xl hover:bg-primary-teal/10 border-4 border-transparent hover:border-primary-teal transition-all">
            Top Right
          </button>
          <button onClick={() => handleSelect(false)} className="py-4 text-xl font-medium bg-gray-50 rounded-xl hover:bg-gray-100 border-4 border-transparent">
            Bottom Left
          </button>
          <button onClick={() => handleSelect(false)} className="py-4 text-xl font-medium bg-gray-50 rounded-xl hover:bg-gray-100 border-4 border-transparent">
            Bottom Right
          </button>
        </div>
      </div>
    </BaselineActivityContainer>
  );
};
