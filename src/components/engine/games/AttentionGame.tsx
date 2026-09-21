import React, { useState, useEffect } from 'react';
import { Flame, Flower2, Sun, Diamond, Circle } from 'lucide-react';

interface Props {
  difficulty: number;
  onComplete: (result: any) => void;
}

const SHAPES = [Flower2, Sun, Diamond, Circle];

export const AttentionGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [startTime, setStartTime] = useState<number>(0);
  const [items, setItems] = useState<any[]>([]);
  const [mistakes, setMistakes] = useState(0);
  
  // Difficulty scaling
  const gridColumns = difficulty >= 3 ? 4 : 3;
  const numItems = difficulty === 1 ? 6 : difficulty === 2 ? 9 : difficulty === 3 ? 12 : 16;
  
  useEffect(() => {
    // Generate grid items
    const newItems = Array(numItems).fill(null).map((_, index) => {
      const isTarget = index === 0; // The first one will be the target, then we shuffle
      const ShapeIcon = isTarget ? Flame : SHAPES[Math.floor(Math.random() * SHAPES.length)];
      return {
        id: index,
        isTarget,
        icon: ShapeIcon,
      };
    });
    
    setItems(newItems.sort(() => 0.5 - Math.random()));
    setStartTime(Date.now());
  }, [difficulty, numItems]);

  const handleSelect = (isTarget: boolean) => {
    if (isTarget) {
      const responseTime = Date.now() - startTime;
      
      // Accuracy penalty for mistakes
      const accuracy = Math.max(0, 100 - (mistakes * 20));
      const score = accuracy;

      onComplete({
        score,
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

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        className="grid gap-6 w-full max-w-3xl bg-white/40 backdrop-blur-md p-8 rounded-[2rem] shadow-xl border border-white/60" 
        style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.isTarget)}
              className="group p-8 bg-white rounded-3xl flex justify-center items-center border-4 border-transparent hover:border-indigo-100 hover:bg-gradient-to-br hover:from-white hover:to-indigo-50 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 animate-[popUp_0.4s_ease-out_forwards]"
              style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
            >
              <Icon 
                className={`w-16 h-16 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm ${item.isTarget ? 'text-attention-amber' : 'text-slate-400 group-hover:text-slate-500'}`} 
                fill={item.isTarget ? 'currentColor' : 'none'}
              />
            </button>
          );
        })}
      </div>
      <style>{`
        @keyframes popUp {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
