import React, { useState, useEffect } from 'react';
import { Star, Circle, Square, Triangle, Hexagon, Octagon } from 'lucide-react';

interface Props {
  difficulty: number;
  onComplete: (result: any) => void;
}

const SHAPES = [Circle, Square, Triangle, Hexagon, Octagon];

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
      const ShapeIcon = isTarget ? Star : SHAPES[Math.floor(Math.random() * SHAPES.length)];
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
        className="grid gap-4 w-full max-w-2xl" 
        style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
      >
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.isTarget)}
              className="p-8 bg-gray-50 rounded-2xl flex justify-center items-center border-4 border-transparent hover:border-gray-200 transition-colors"
            >
              <Icon 
                className={`w-16 h-16 ${item.isTarget ? 'text-attention-amber' : 'text-secondary-sage'}`} 
                fill={item.isTarget ? 'currentColor' : 'none'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
