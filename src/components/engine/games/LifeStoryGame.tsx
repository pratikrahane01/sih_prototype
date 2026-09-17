/**
 * LifeStoryGame.tsx
 * ==================
 * Personalized game: Shows N life event cards and asks the patient to pick
 * which one happened first (chronological ordering).
 *
 * Data source: PersonalizedQuestionService → MemoryService (with demo fallback)
 */
import React, { useState, useEffect, useRef } from 'react';
import { PatientService } from '../../../services/api/PatientService';
import { SpeechSynthesisService } from '../../../services/accessibility/SpeechSynthesisService';
import { generateLifeStoryQuestions, type LifeStoryQuestion } from '../../../services/demo/PersonalizedQuestionService';
import { DEMO_PATIENT_ID } from '../../../services/demo/DemoMemoryData';
import { Volume2, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  difficulty: number;
  onComplete: (result: {
    score: number;
    accuracy: number;
    averageResponseTime: number;
    mistakes: number;
    hints: number;
    retries: number;
  }) => void;
}

export const LifeStoryGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [questions,     setQuestions]     = useState<LifeStoryQuestion[]>([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [displayScore,  setDisplayScore]  = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [feedback,      setFeedback]      = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [answered,      setAnswered]      = useState<string | null>(null);

  const startTimeRef = useRef(Date.now());
  const scoreRef     = useRef(0);
  const mistakesRef  = useRef(0);

  useEffect(() => {
    const patientId = PatientService.getProfile()?.id || DEMO_PATIENT_ID;
    const qs = generateLifeStoryQuestions(patientId, difficulty);
    setQuestions(qs);
    setLoading(false);
    startTimeRef.current = Date.now();
  }, [difficulty]);

  const total    = questions.length;
  const currentQ = questions[currentIndex];

  const speakQuestion = () => {
    SpeechSynthesisService.speak(currentQ?.questionText ?? "Which of these happened first?");
  };

  const handleAnswer = (selectedId: string) => {
    if (feedback || answered) return;

    const isCorrect = selectedId === currentQ.correctAnswer.id;
    const timeTaken = Date.now() - startTimeRef.current;

    setAnswered(selectedId);
    setResponseTimes(prev => [...prev, timeTaken]);

    if (isCorrect) {
      scoreRef.current += 100;
      setDisplayScore(scoreRef.current);
      setFeedback({
        message: `Correct! "${currentQ.correctAnswer.title}" (${currentQ.correctAnswer.year}) came first.`,
        isCorrect: true
      });
    } else {
      mistakesRef.current += 1;
      setFeedback({
        message: `"${currentQ.correctAnswer.title}" (${currentQ.correctAnswer.year}) happened first. Good try!`,
        isCorrect: false
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setAnswered(null);

      if (currentIndex + 1 < total) {
        setCurrentIndex(i => i + 1);
        startTimeRef.current = Date.now();
      } else {
        const allTimes = [...responseTimes, timeTaken];
        const avgTime  = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
        const accuracy = ((total - mistakesRef.current) / total) * 100;
        onComplete({
          score:               scoreRef.current,
          accuracy:            Math.max(0, Math.round(accuracy)),
          averageResponseTime: Math.round(avgTime),
          mistakes:            mistakesRef.current,
          hints: 0, retries: 0
        });
      }
    }, 2800);
  };

  // ── Render States ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl text-gray-500">Preparing your life story...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl text-gray-600 font-medium">Not enough memories to build a timeline.</p>
        <p className="text-gray-400 mt-2">Ask your caregiver to add more memories with dates.</p>
      </div>
    );
  }

  const progress = total > 0 ? (currentIndex / total) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto text-center select-none">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-semibold text-gray-400 mb-2">
          <span>Question {currentIndex + 1} of {total}</span>
          <span className="text-primary-teal font-bold">Score: {displayScore}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-teal rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
          {currentQ.questionText}
        </h3>
        <button
          onClick={speakQuestion}
          aria-label="Read question aloud"
          className="shrink-0 p-3 bg-teal-50 text-primary-teal rounded-full hover:bg-teal-100 transition-colors"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>
      <p className="text-gray-400 text-base mb-8">Tap the memory that happened earliest.</p>

      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center justify-center gap-3 p-5 rounded-2xl mb-6 text-base font-bold
          ${feedback.isCorrect
            ? 'bg-green-50 text-green-800 border-2 border-green-200'
            : 'bg-amber-50 text-amber-800 border-2 border-amber-200'
          }`}
        >
          {feedback.isCorrect
            ? <CheckCircle className="w-7 h-7 text-green-600 shrink-0" />
            : <XCircle    className="w-7 h-7 text-amber-600 shrink-0" />
          }
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {currentQ.memories.map(memory => {
          const isSelected   = answered === memory.id;
          const isCorrectOpt = memory.id === currentQ.correctAnswer.id;

          let ringClass = 'border-transparent hover:border-primary-teal hover:shadow-lg';
          if (answered) {
            if (isCorrectOpt)    ringClass = 'border-green-400 bg-green-50 shadow-green-100 shadow-md';
            else if (isSelected) ringClass = 'border-red-300 bg-red-50';
            else                 ringClass = 'border-gray-100 opacity-50';
          }

          return (
            <button
              key={memory.id}
              onClick={() => handleAnswer(memory.id)}
              disabled={!!answered}
              className={`bg-white border-4 rounded-3xl transition-all p-5 flex flex-col items-center text-center active:scale-95 ${ringClass}`}
            >
              {/* Memory Image — fallback below, photo on top */}
              <div className="relative w-full h-36 rounded-2xl mb-4 overflow-hidden">
                {/* Fallback */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-gray-300" />
                </div>
                {/* Photo */}
                {memory.image && (
                  <img
                    src={memory.image}
                    alt={memory.title}
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                {/* Correct indicator overlay — z-20 to sit above photo */}
                {answered && isCorrectOpt && (
                  <div className="absolute inset-0 bg-green-400/30 flex items-center justify-center rounded-2xl z-20">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                )}
              </div>

              <h4 className="text-xl font-bold text-gray-800 mb-1">{memory.title}</h4>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">
                {memory.content}
              </p>
              {/* Year badge — visible but NOT the definitive clue */}
              {memory.year && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                  <Calendar className="w-3.5 h-3.5" />
                  {memory.year}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
