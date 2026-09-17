import React, { useState, useEffect } from 'react';
import { RouteService } from '../../../services/api/RouteService';
import type { FamiliarRoute } from '../../../types';
import { MapPin, ArrowRight, BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  difficulty: number;
  routeId: string;
  onComplete: (result: {
    score: number;
    accuracy: number;
    averageResponseTime: number;
    mistakes: number;
    hints: number;
    retries: number;
  }) => void;
}

type Phase = 'LOADING' | 'LEARNING' | 'RECALL';

interface RecallQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const RouteRecallGame: React.FC<Props> = ({ difficulty, routeId, onComplete }) => {
  const [phase, setPhase] = useState<Phase>('LOADING');
  const [route, setRoute] = useState<FamiliarRoute | null>(null);
  
  // Learning Phase State
  const [learningStep, setLearningStep] = useState(0);
  
  // Recall Phase State
  const [questions, setQuestions] = useState<RecallQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Telemetry State
  const [mistakes, setMistakes] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);

  useEffect(() => {
    const fetchedRoute = RouteService.getRoute(routeId);
    if (fetchedRoute && fetchedRoute.locations.length >= 2) {
      setRoute(fetchedRoute);
      
      // Determine how many locations to show based on difficulty
      // Difficulty 1: 3 locations, Diff 2: 4, etc. bounded by actual route length
      const maxLocations = Math.min(fetchedRoute.locations.length, difficulty + 2);
      const activeLocations = fetchedRoute.locations.slice(0, maxLocations);

      // Generate Questions
      const generatedQuestions: RecallQuestion[] = [];
      
      for (let i = 0; i < activeLocations.length - 1; i++) {
        const currentLoc = activeLocations[i];
        const nextLoc = activeLocations[i + 1];
        
        // Generate options: correct answer + 2 distractors (other locations)
        const distractors = fetchedRoute.locations
          .filter(l => l.name !== nextLoc.name && l.name !== currentLoc.name)
          .map(l => l.name)
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
          
        // If not enough distractors from the route, add generic ones
        if (distractors.length < 2) {
          if (!distractors.includes('Park')) distractors.push('Park');
          if (distractors.length < 2 && !distractors.includes('Market')) distractors.push('Market');
        }

        const options = [nextLoc.name, ...distractors].sort(() => 0.5 - Math.random());

        generatedQuestions.push({
          question: `What comes after the ${currentLoc.name}?`,
          options,
          correctAnswer: nextLoc.name
        });
      }

      setQuestions(generatedQuestions);
      setPhase('LEARNING');
    } else {
      console.error("Invalid or missing route for RouteRecallGame");
      // Fallback
      onComplete({
        score: 0, accuracy: 0, averageResponseTime: 0, mistakes: 0, hints: 0, retries: 0
      });
    }
  }, [routeId, difficulty]);

  const handleNextLearningStep = () => {
    if (!route) return;
    const maxLocations = Math.min(route.locations.length, difficulty + 2);
    if (learningStep < maxLocations - 1) {
      setLearningStep(prev => prev + 1);
    } else {
      setPhase('RECALL');
      setStartTime(Date.now());
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks

    setSelectedAnswer(answer);
    const timeTaken = Date.now() - startTime;
    setResponseTimes(prev => [...prev, timeTaken]);

    const isAnswerCorrect = answer === questions[currentQuestionIdx].correctAnswer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setMistakes(prev => prev + 1);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setStartTime(Date.now());
      } else {
        // Game Over
        const accuracy = (correctCount + (isAnswerCorrect ? 1 : 0)) / questions.length;
        const avgTime = [...responseTimes, timeTaken].reduce((a, b) => a + b, 0) / questions.length;
        const finalMistakes = mistakes + (isAnswerCorrect ? 0 : 1);
        
        onComplete({
          score: Math.max(0, (accuracy * 100) - (finalMistakes * 10)),
          accuracy,
          averageResponseTime: avgTime,
          mistakes: finalMistakes,
          hints: 0,
          retries: 0
        });
      }
    }, 1500);
  };

  if (phase === 'LOADING' || !route) {
    return <div className="animate-pulse text-xl text-primary-teal">Loading your route...</div>;
  }

  const maxLocations = Math.min(route.locations.length, difficulty + 2);
  const activeLocations = route.locations.slice(0, maxLocations);

  if (phase === 'LEARNING') {
    return (
      <div className="flex flex-col items-center w-full max-w-2xl">
        <h3 className="text-2xl font-bold text-text-charcoal mb-8 text-center">
          Let's review this route:<br/>
          <span className="text-primary-teal">{route.name}</span>
        </h3>

        <div className="flex flex-col items-center space-y-4 mb-10 w-full">
          {activeLocations.slice(0, learningStep + 1).map((loc, idx) => (
            <React.Fragment key={loc.id}>
              {idx > 0 && (
                <div className="flex flex-col items-center animate-fade-in">
                  <div className="h-8 w-1 bg-gray-300"></div>
                  <ArrowRight className="w-6 h-6 text-gray-400 my-1 rotate-90" />
                  <div className="h-8 w-1 bg-gray-300"></div>
                </div>
              )}
              <div className="w-full bg-white border-2 border-primary-teal/20 rounded-2xl p-6 shadow-sm flex items-center animate-fade-in-up">
                <div className="w-12 h-12 bg-primary-teal/10 rounded-full flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-primary-teal" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-text-charcoal">{loc.name}</h4>
                  {loc.landmark && <p className="text-gray-600 mt-1">Landmark: {loc.landmark}</p>}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <button 
          onClick={handleNextLearningStep}
          className="bg-primary-teal text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-teal-700 transition w-full shadow-md"
        >
          {learningStep < maxLocations - 1 ? 'Next Location' : 'I Remember This Route'}
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <div className="flex items-center space-x-2 text-primary-teal font-medium mb-8 bg-blue-50 px-4 py-2 rounded-full">
        <BrainCircuit className="w-5 h-5" />
        <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
      </div>

      <h3 className="text-3xl font-bold text-text-charcoal mb-12 text-center leading-tight">
        {currentQ.question}
      </h3>

      <div className="w-full grid grid-cols-1 gap-4">
        {currentQ.options.map((option, idx) => {
          let btnClass = "bg-white border-2 border-gray-200 text-text-charcoal hover:border-primary-teal hover:bg-gray-50";
          
          if (selectedAnswer === option) {
            if (isCorrect) {
              btnClass = "bg-green-50 border-2 border-green-500 text-green-700";
            } else {
              btnClass = "bg-red-50 border-2 border-red-500 text-red-700";
            }
          } else if (selectedAnswer && option === currentQ.correctAnswer) {
            // Show correct answer if they got it wrong
            btnClass = "bg-green-50 border-2 border-green-500 text-green-700";
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(option)}
              disabled={selectedAnswer !== null}
              className={`p-6 rounded-2xl text-2xl font-bold transition-all flex items-center justify-between ${btnClass}`}
            >
              <span>{option}</span>
              {selectedAnswer === option && isCorrect === true && <CheckCircle2 className="w-8 h-8 text-green-500" />}
              {selectedAnswer === option && isCorrect === false && <XCircle className="w-8 h-8 text-red-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
