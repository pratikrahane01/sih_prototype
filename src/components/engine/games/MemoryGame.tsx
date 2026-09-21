import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

// Import cultural item images
import diyaImg from '../../../assets/games/memory/item_diya.jpg';
import lotusImg from '../../../assets/games/memory/item_lotus.jpg';
import chaiImg from '../../../assets/games/memory/item_chai.jpg';
import tulsiImg from '../../../assets/games/memory/item_tulsi.jpg';
import banyanImg from '../../../assets/games/memory/item_banyan.jpg';
import tablaImg from '../../../assets/games/memory/item_tabla.jpg';
import rupeeImg from '../../../assets/games/memory/item_rupee.jpg';
import peacockImg from '../../../assets/games/memory/item_peacock.jpg';

interface Props {
  difficulty: number;
  onComplete: (result: any) => void;
}

const ALL_ITEMS = [
  { id: 'diya', icon: diyaImg },
  { id: 'lotus', icon: lotusImg },
  { id: 'chai', icon: chaiImg },
  { id: 'tulsi', icon: tulsiImg },
  { id: 'banyan', icon: banyanImg },
  { id: 'tabla', icon: tablaImg },
  { id: 'rupee', icon: rupeeImg },
  { id: 'peacock', icon: peacockImg },
];

export const MemoryGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [targets, setTargets] = useState<typeof ALL_ITEMS>([]);
  const [options, setOptions] = useState<typeof ALL_ITEMS>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const { t } = useLanguage();

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 w-full max-w-3xl">
            {targets.map(t => (
              <div key={t.id} className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-3xl flex justify-center items-center shadow-sm border border-blue-100/50 transform hover:scale-105 transition-transform duration-300">
                <img src={t.icon} alt={t.id} className="w-24 h-24 object-contain drop-shadow-md rounded-xl" />
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden max-w-xl shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary-teal to-blue-400 origin-left animate-[shrink_linear_forwards]" 
              style={{ animationDuration: `${viewDuration}ms`, animationName: 'shrinkWidth' }}
            />
          </div>
          <style>{`@keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }`}</style>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 w-full max-w-4xl">
            {options.map(opt => {
              const isSelected = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSelection(opt.id)}
                  className={`p-6 rounded-3xl flex flex-col items-center transition-all duration-300 border-4 ${
                    isSelected 
                      ? 'border-primary-teal bg-gradient-to-b from-primary-teal/10 to-transparent shadow-md transform -translate-y-2' 
                      : 'border-transparent bg-white shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-gray-100'
                  }`}
                >
                  <img 
                    src={opt.icon} 
                    alt={opt.id} 
                    className={`w-20 h-20 object-contain transition-all duration-300 rounded-xl ${isSelected ? 'drop-shadow-lg scale-110' : 'drop-shadow-sm opacity-80'}`} 
                  />
                </button>
              );
            })}
          </div>
          <button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-primary-teal to-teal-600 text-white px-14 py-4 rounded-full text-2xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:ring-4 focus:ring-primary-teal/30 focus:outline-none"
          >
            {t('game.submit')}
          </button>
        </>
      )}
    </div>
  );
};
