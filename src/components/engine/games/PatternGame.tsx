import React, { useState, useEffect } from 'react';
import { Circle, Square, Triangle, Star } from 'lucide-react';

interface Props {
  difficulty: number;
  onComplete: (result: any) => void;
}

export const PatternGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [startTime, setStartTime] = useState<number>(0);
  const [mistakes, setMistakes] = useState(0);

  // Difficulty scaling (simplified for prototype)
  // Diff 1: A B A _
  // Diff 2: A B C A _
  // Diff 3: A A B A A _
  
  const patternLength = difficulty >= 3 ? 5 : difficulty === 2 ? 4 : 3;
  const sequence = [
    { id: '1', icon: Circle, color: 'text-ai-blue' },
    { id: '2', icon: Square, color: 'text-primary-teal' },
    { id: '3', ...(difficulty >= 2 ? { icon: Triangle, color: 'text-attention-amber' } : { icon: Circle, color: 'text-ai-blue' }) },
    { id: '4', icon: Circle, color: 'text-ai-blue' },
    { id: '5', icon: Square, color: 'text-primary-teal' }
  ].slice(0, patternLength);

  const correctTargetId = sequence.length === 3 ? '2' : sequence.length === 4 ? '2' : '1'; // Just a mock deterministic correct answer

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

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-wrap justify-center items-center gap-4 mb-16 bg-gray-50 p-8 rounded-3xl border border-gray-100">
        {sequence.map((item, idx) => {
          const Icon = item.icon as any;
          return (
            <div key={idx} className="p-4 bg-white rounded-xl shadow-sm">
              <Icon className={`w-16 h-16 ${item.color}`} fill="currentColor" />
            </div>
          );
        })}
        <div className="p-4 bg-white rounded-xl shadow-sm border-4 border-dashed border-gray-300 w-[96px] h-[96px] flex items-center justify-center text-4xl text-gray-300 font-bold">
          ?
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        <button onClick={() => handleSelect(correctTargetId === '1')} className="p-8 bg-gray-50 rounded-2xl flex justify-center border-4 border-transparent hover:border-gray-200">
          <Circle className="w-16 h-16 text-ai-blue" fill="currentColor" />
        </button>
        <button onClick={() => handleSelect(correctTargetId === '2')} className="p-8 bg-gray-50 rounded-2xl flex justify-center border-4 border-transparent hover:border-gray-200">
          <Square className="w-16 h-16 text-primary-teal" fill="currentColor" />
        </button>
        <button onClick={() => handleSelect(false)} className="p-8 bg-gray-50 rounded-2xl flex justify-center border-4 border-transparent hover:border-gray-200">
          <Triangle className="w-16 h-16 text-attention-amber" fill="currentColor" />
        </button>
        <button onClick={() => handleSelect(false)} className="p-8 bg-gray-50 rounded-2xl flex justify-center border-4 border-transparent hover:border-gray-200">
          <Star className="w-16 h-16 text-secondary-sage" fill="currentColor" />
        </button>
      </div>
    </div>
  );
};
