import React, { useState, useEffect } from 'react';
import { BaselineActivityContainer } from './BaselineActivityContainer';
import { Star, Circle, Square, Triangle } from 'lucide-react';

interface Props {
  onComplete: (result: { score: number; accuracy: number; responseTime: number }) => void;
}

export const AttentionBaseline: React.FC<Props> = ({ onComplete }) => {
  const [startTime, setStartTime] = useState<number>(0);
  
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleSelect = (isTarget: boolean) => {
    const responseTime = Date.now() - startTime;
    const accuracy = isTarget ? 100 : 0;
    const score = isTarget ? 100 : 0;

    onComplete({ score, accuracy, responseTime });
  };

  return (
    <BaselineActivityContainer
      title="Attention Activity"
      instructions="Tap on the STAR as quickly as you can."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl">
        <button onClick={() => handleSelect(false)} className="p-8 bg-gray-50 rounded-xl hover:bg-gray-100 flex justify-center border-4 border-transparent">
          <Circle className="w-16 h-16 text-secondary-sage" />
        </button>
        <button onClick={() => handleSelect(false)} className="p-8 bg-gray-50 rounded-xl hover:bg-gray-100 flex justify-center border-4 border-transparent">
          <Square className="w-16 h-16 text-secondary-sage" />
        </button>
        <button onClick={() => handleSelect(true)} className="p-8 bg-gray-50 rounded-xl hover:bg-primary-teal/10 flex justify-center border-4 border-transparent hover:border-primary-teal transition-all">
          <Star className="w-16 h-16 text-attention-amber" fill="currentColor" />
        </button>
        <button onClick={() => handleSelect(false)} className="p-8 bg-gray-50 rounded-xl hover:bg-gray-100 flex justify-center border-4 border-transparent">
          <Triangle className="w-16 h-16 text-secondary-sage" />
        </button>
      </div>
    </BaselineActivityContainer>
  );
};
