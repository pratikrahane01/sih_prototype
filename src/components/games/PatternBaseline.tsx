import React, { useState, useEffect } from 'react';
import { BaselineActivityContainer } from './BaselineActivityContainer';
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  onComplete: (result: { score: number; accuracy: number; responseTime: number }) => void;
}

export const PatternBaseline: React.FC<Props> = ({ onComplete }) => {
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
      title="Pattern Activity"
      instructions="What comes next in the pattern?"
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center space-x-4 mb-12">
          <div className="p-4 bg-gray-100 rounded-xl"><ArrowUp className="w-12 h-12 text-primary-teal" /></div>
          <div className="p-4 bg-gray-100 rounded-xl"><ArrowRight className="w-12 h-12 text-primary-teal" /></div>
          <div className="p-4 bg-gray-100 rounded-xl"><ArrowUp className="w-12 h-12 text-primary-teal" /></div>
          <div className="p-4 bg-gray-100 rounded-xl"><ArrowRight className="w-12 h-12 text-primary-teal" /></div>
          <div className="p-4 bg-gray-100 rounded-xl border-4 border-dashed border-gray-300 w-[88px] h-[88px] flex items-center justify-center text-gray-400 font-bold text-2xl">?</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <button onClick={() => handleSelect(true)} className="p-6 bg-gray-50 rounded-xl hover:bg-primary-teal/10 flex justify-center border-4 border-transparent hover:border-primary-teal transition-all">
            <ArrowUp className="w-12 h-12 text-text-charcoal" />
          </button>
          <button onClick={() => handleSelect(false)} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 flex justify-center border-4 border-transparent">
            <ArrowDown className="w-12 h-12 text-text-charcoal" />
          </button>
          <button onClick={() => handleSelect(false)} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 flex justify-center border-4 border-transparent">
            <ArrowLeft className="w-12 h-12 text-text-charcoal" />
          </button>
          <button onClick={() => handleSelect(false)} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 flex justify-center border-4 border-transparent">
            <ArrowRight className="w-12 h-12 text-text-charcoal" />
          </button>
        </div>
      </div>
    </BaselineActivityContainer>
  );
};
