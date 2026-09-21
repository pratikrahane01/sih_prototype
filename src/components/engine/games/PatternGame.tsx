import React, { useState, useEffect } from 'react';
import { Flower2, Leaf, Flame, Sun } from 'lucide-react';

interface Props {
  difficulty: number;
  onComplete: (result: any) => void;
}

export const PatternGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [startTime, setStartTime] = useState<number>(0);
  const [mistakes, setMistakes] = useState(0);

  // Difficulty scaling
  // Diff 1: Flower Leaf Flower _
  // Diff 2: Flower Leaf Flame Flower _
  // Diff 3: Flower Flower Leaf Flower Flower _
  
  const patternLength = difficulty >= 3 ? 5 : difficulty === 2 ? 4 : 3;
  const sequence = [
    { id: '1', icon: Flower2, color: 'text-orange-500' },
    { id: '2', icon: Leaf, color: 'text-green-600' },
    { id: '3', ...(difficulty >= 2 ? { icon: Flame, color: 'text-amber-500' } : { icon: Flower2, color: 'text-orange-500' }) },
    { id: '4', icon: Flower2, color: 'text-orange-500' },
    { id: '5', icon: Leaf, color: 'text-green-600' }
  ].slice(0, patternLength);

  const correctTargetId = sequence.length === 3 ? '2' : sequence.length === 4 ? '2' : '1';

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
      <div className="flex flex-wrap justify-center items-center gap-4 mb-16 bg-gradient-to-r from-orange-50/50 via-amber-50/50 to-orange-50/50 backdrop-blur-sm p-10 rounded-[2.5rem] shadow-lg border border-white/80">
        {sequence.map((item, idx) => {
          const Icon = item.icon as any;
          return (
            <div key={idx} className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center transform transition-transform hover:scale-105">
              <Icon className={`w-16 h-16 ${item.color} drop-shadow-sm`} fill="currentColor" />
            </div>
          );
        })}
        <div className="p-5 bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-inner border-4 border-dashed border-orange-200 w-[108px] h-[108px] flex items-center justify-center text-5xl text-orange-300 font-bold animate-pulse">
          ?
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl">
        <button onClick={() => handleSelect(correctTargetId === '1')} className="group p-8 bg-white rounded-3xl flex justify-center border-4 border-transparent hover:border-orange-200 hover:bg-orange-50/30 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
          <Flower2 className="w-16 h-16 text-orange-500 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" fill="currentColor" />
        </button>
        <button onClick={() => handleSelect(correctTargetId === '2')} className="group p-8 bg-white rounded-3xl flex justify-center border-4 border-transparent hover:border-green-200 hover:bg-green-50/30 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
          <Leaf className="w-16 h-16 text-green-600 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" fill="currentColor" />
        </button>
        <button onClick={() => handleSelect(false)} className="group p-8 bg-white rounded-3xl flex justify-center border-4 border-transparent hover:border-amber-200 hover:bg-amber-50/30 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
          <Flame className="w-16 h-16 text-amber-500 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" fill="currentColor" />
        </button>
        <button onClick={() => handleSelect(false)} className="group p-8 bg-white rounded-3xl flex justify-center border-4 border-transparent hover:border-yellow-200 hover:bg-yellow-50/30 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
          <Sun className="w-16 h-16 text-yellow-500 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" fill="currentColor" />
        </button>
      </div>
    </div>
  );
};
