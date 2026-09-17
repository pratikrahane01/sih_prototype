import React, { useState, useEffect } from 'react';
import { Apple, Car, Dog, Sun, Moon, Leaf, Heart, Star } from 'lucide-react';

interface Props {
  difficulty: number;
  onComplete: (result: any) => void;
}

const ALL_ITEMS = [
  { id: 'apple', icon: Apple },
  { id: 'car', icon: Car },
  { id: 'dog', icon: Dog },
  { id: 'sun', icon: Sun },
  { id: 'moon', icon: Moon },
  { id: 'leaf', icon: Leaf },
  { id: 'heart', icon: Heart },
  { id: 'star', icon: Star },
];

export const MemoryGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [targets, setTargets] = useState<typeof ALL_ITEMS>([]);
  const [options, setOptions] = useState<typeof ALL_ITEMS>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(0);

  // Difficulty scaling
  const numTargets = Math.min(3 + (difficulty - 1), 6); // Diff 1: 3, Diff 4: 6
  const numOptions = Math.min(numTargets * 2, 8); // Double the targets, max 8
  const viewDuration = Math.max(5000 - (difficulty * 500), 2000); // Shorter time at higher diff

  useEffect(() => {
    // Select random targets
    const shuffled = [...ALL_ITEMS].sort(() => 0.5 - Math.random());
    const selectedTargets = shuffled.slice(0, numTargets);
    setTargets(selectedTargets);

    // Create options (targets + distractors)
    const optionsPool = [...selectedTargets];
    const distractors = shuffled.slice(numTargets);
    while (optionsPool.length < numOptions) {
      optionsPool.push(distractors.pop()!);
    }
    setOptions(optionsPool.sort(() => 0.5 - Math.random()));
  }, [difficulty, numTargets, numOptions]);

  useEffect(() => {
    if (phase === 'memorize' && targets.length > 0) {
      const timer = setTimeout(() => {
        setPhase('recall');
        setStartTime(Date.now());
      }, viewDuration);
      return () => clearTimeout(timer);
    }
  }, [phase, targets, viewDuration]);

  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSubmit = () => {
    const responseTime = Date.now() - startTime;
    let correctCount = 0;
    let mistakeCount = 0;

    selected.forEach(s => {
      if (targets.find(t => t.id === s)) {
        correctCount++;
      } else {
        mistakeCount++;
      }
    });

    const missedCount = targets.length - correctCount;
    mistakeCount += missedCount;

    // Accuracy calculation
    const accuracy = Math.max(0, (correctCount / targets.length) * 100 - (mistakeCount * 10)); // penalty for mistakes
    const score = accuracy; // simple score mapping

    onComplete({
      score,
      accuracy,
      averageResponseTime: responseTime,
      mistakes: mistakeCount,
      hints: 0,
      retries: 0
    });
  };

  if (targets.length === 0) return null;

  return (
    <div className="flex flex-col items-center w-full">
      {phase === 'memorize' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {targets.map(t => {
              const Icon = t.icon;
              return (
                <div key={t.id} className="p-8 bg-blue-50 rounded-2xl flex justify-center items-center">
                  <Icon className="w-20 h-20 text-primary-teal" />
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden max-w-md">
            <div 
              className="bg-primary-teal h-full origin-left animate-[shrink_linear_forwards]" 
              style={{ animationDuration: `${viewDuration}ms`, animationName: 'shrinkWidth' }}
            />
          </div>
          <style>{`@keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }`}</style>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 w-full max-w-3xl">
            {options.map(opt => {
              const Icon = opt.icon;
              const isSelected = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSelection(opt.id)}
                  className={`p-6 rounded-2xl flex flex-col items-center transition-all border-4 ${
                    isSelected ? 'border-primary-teal bg-primary-teal/10' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <Icon className={`w-16 h-16 ${isSelected ? 'text-primary-teal' : 'text-text-charcoal'}`} />
                </button>
              );
            })}
          </div>
          <button 
            onClick={handleSubmit}
            className="bg-primary-teal text-white px-12 py-4 rounded-full text-2xl font-medium hover:bg-teal-700 transition"
          >
            Submit Answer
          </button>
        </>
      )}
    </div>
  );
};
