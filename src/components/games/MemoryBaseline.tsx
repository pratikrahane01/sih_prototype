import React, { useState, useEffect } from 'react';
import { BaselineActivityContainer } from './BaselineActivityContainer';
import { Apple, Car, Dog, Sun } from 'lucide-react';

interface Props {
  onComplete: (result: { score: number; accuracy: number; responseTime: number }) => void;
}

export const MemoryBaseline: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [startTime, setStartTime] = useState<number>(0);
  const [selected, setSelected] = useState<string[]>([]);
  
  // Fake targets to memorize
  const targets = ['Apple', 'Dog'];
  
  const allObjects = [
    { name: 'Apple', icon: Apple },
    { name: 'Car', icon: Car },
    { name: 'Dog', icon: Dog },
    { name: 'Sun', icon: Sun },
  ];

  useEffect(() => {
    if (phase === 'memorize') {
      const timer = setTimeout(() => {
        setPhase('recall');
        setStartTime(Date.now());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleSelect = (name: string) => {
    if (selected.includes(name)) {
      setSelected(selected.filter(s => s !== name));
    } else {
      setSelected([...selected, name]);
    }
  };

  const handleSubmit = () => {
    const responseTime = Date.now() - startTime;
    const correctAnswers = selected.filter(s => targets.includes(s)).length;
    const incorrectAnswers = selected.length - correctAnswers;
    
    // Simple mock calculation
    let score = 0;
    let accuracy = 0;
    
    if (targets.length > 0) {
       const correctRatio = correctAnswers / targets.length;
       const penalty = incorrectAnswers * 0.2; // penalty for wrong guesses
       accuracy = Math.max(0, (correctRatio - penalty)) * 100;
       score = accuracy; // Keep it simple for baseline
    }

    onComplete({ score, accuracy, responseTime });
  };

  return (
    <BaselineActivityContainer
      title="Memory Activity"
      instructions={phase === 'memorize' ? "Please remember these objects." : "Which objects did you see?"}
    >
      {phase === 'memorize' ? (
        <div className="flex gap-8 justify-center">
          {targets.map(t => {
            const Obj = allObjects.find(o => o.name === t)?.icon || Sun;
            return (
              <div key={t} className="p-6 bg-blue-50 rounded-xl">
                <Obj className="w-16 h-16 text-primary-teal" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
            {allObjects.map(obj => {
              const Icon = obj.icon;
              const isSelected = selected.includes(obj.name);
              return (
                <button
                  key={obj.name}
                  onClick={() => handleSelect(obj.name)}
                  className={`p-6 rounded-xl flex flex-col items-center justify-center transition-all border-4 ${
                    isSelected ? 'border-primary-teal bg-primary-teal/10' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-12 h-12 mb-2 ${isSelected ? 'text-primary-teal' : 'text-gray-500'}`} />
                  <span className={`text-lg font-medium ${isSelected ? 'text-primary-teal' : 'text-gray-600'}`}>{obj.name}</span>
                </button>
              );
            })}
          </div>
          <button 
            onClick={handleSubmit}
            className="bg-primary-teal text-white px-10 py-4 rounded-full text-xl font-medium hover:bg-teal-700 transition-colors"
          >
            Submit
          </button>
        </div>
      )}
    </BaselineActivityContainer>
  );
};
