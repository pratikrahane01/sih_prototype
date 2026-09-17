/**
 * WhoIsThisGame.tsx
 * ==================
 * Personalized game: Shows a familiar person's image (or avatar) and asks
 * the patient to identify them by name or relationship.
 *
 * Data source: PersonalizedQuestionService → MemoryService (with demo fallback)
 */
import React, { useState, useEffect, useRef } from 'react';
import { PatientService } from '../../../services/api/PatientService';
import { SpeechSynthesisService } from '../../../services/accessibility/SpeechSynthesisService';
import { generateWhoIsThisQuestions, type PersonQuestion } from '../../../services/demo/PersonalizedQuestionService';
import { DEMO_PATIENT_ID } from '../../../services/demo/DemoMemoryData';
import { Volume2, Users, CheckCircle, XCircle } from 'lucide-react';

// ── Game label letter helper ────────────────────────────────────────────────────
const LABELS = ['A', 'B', 'C', 'D'];

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

export const WhoIsThisGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [questions,     setQuestions]     = useState<PersonQuestion[]>([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [displayScore,  setDisplayScore]  = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [feedback,      setFeedback]      = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [answered,      setAnswered]      = useState<string | null>(null);

  const startTimeRef = useRef(Date.now());

  // ── Score accumulator refs so setTimeout callbacks see latest values ─────────
  const scoreRef    = useRef(0);
  const mistakesRef = useRef(0);

  useEffect(() => {
    const patientId = PatientService.getProfile()?.id || DEMO_PATIENT_ID;
    const qs = generateWhoIsThisQuestions(patientId, difficulty);
    setQuestions(qs);
    setLoading(false);
    startTimeRef.current = Date.now();
  }, [difficulty]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const total      = questions.length;
  const currentQ   = questions[currentIndex];
  const progress   = total > 0 ? ((currentIndex) / total) * 100 : 0;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const speakQuestion = () => {
    SpeechSynthesisService.speak(currentQ?.questionText ?? "Who is this person?");
  };

  const handleAnswer = (selected: string) => {
    if (feedback || answered) return;  // Block double-tap

    const isCorrect   = selected === currentQ.correctAnswer;
    const timeTaken   = Date.now() - startTimeRef.current;

    setAnswered(selected);
    setResponseTimes(prev => [...prev, timeTaken]);

    if (isCorrect) {
      scoreRef.current += 100;
      setDisplayScore(scoreRef.current);
      setFeedback({ message: `✓ That's right! This is ${currentQ.person.name}.`, isCorrect: true });
    } else {
      mistakesRef.current += 1;
      setFeedback({
        message: `The correct answer is "${currentQ.correctAnswer}". Keep going!`,
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
        // All questions answered → compute final result
        const allTimes  = [...responseTimes, timeTaken];
        const avgTime   = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
        const accuracy  = ((total - mistakesRef.current) / total) * 100;

        onComplete({
          score:               scoreRef.current,
          accuracy:            Math.max(0, Math.round(accuracy)),
          averageResponseTime: Math.round(avgTime),
          mistakes:            mistakesRef.current,
          hints:               0,
          retries:             0
        });
      }
    }, 2200);
  };

  // ── Render States ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl text-gray-500 font-medium">Preparing your activity...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Users className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl text-gray-600 font-medium">No people found.</p>
        <p className="text-gray-400 mt-2">Ask your caregiver to add familiar people in the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto text-center select-none">
      {/* Progress Bar */}
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
      <div className="flex items-center justify-center gap-3 mb-8">
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

      {/* Person Image — fallback avatar shown underneath, photo on top */}
      <div className="relative w-52 h-52 mx-auto mb-8 rounded-3xl overflow-hidden shadow-lg border-4 border-white ring-4 ring-primary-teal/20">
        {/* Always-visible gradient avatar fallback */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-teal-50 to-blue-50">
          <Users className="w-20 h-20 text-primary-teal/40" />
          <span className="text-4xl font-black text-primary-teal/30 mt-1">
            {currentQ.person.name.charAt(0)}
          </span>
        </div>
        {/* Photo on top — hidden on load error */}
        {currentQ.person.image && (
          <img
            src={currentQ.person.image}
            alt={currentQ.person.name}
            className="absolute inset-0 w-full h-full object-cover z-10"
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`flex items-center justify-center gap-3 p-5 rounded-2xl mb-6 text-lg font-bold transition-all
          ${feedback.isCorrect
            ? 'bg-green-50 text-green-800 border-2 border-green-200'
            : 'bg-amber-50 text-amber-800 border-2 border-amber-200'
          }`}
        >
          {feedback.isCorrect
            ? <CheckCircle className="w-7 h-7 text-green-600 shrink-0" />
            : <XCircle    className="w-7 h-7 text-amber-600 shrink-0" />
          }
          {feedback.message}
        </div>
      )}

      {/* Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQ.options.map((opt, i) => {
          const isSelected = answered === opt;
          const isCorrectOpt = opt === currentQ.correctAnswer;
          let borderClass = 'border-gray-200 hover:border-primary-teal hover:bg-teal-50';
          if (answered) {
            if (isCorrectOpt)       borderClass = 'border-green-400 bg-green-50';
            else if (isSelected)    borderClass = 'border-red-300 bg-red-50';
            else                    borderClass = 'border-gray-100 opacity-60';
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              disabled={!!answered}
              className={`bg-white border-2 font-bold py-6 px-5 rounded-2xl transition-all shadow-sm active:scale-95 text-xl text-left flex items-center gap-4 ${borderClass}`}
            >
              <span className="shrink-0 w-9 h-9 rounded-full bg-primary-teal/10 text-primary-teal font-black text-lg flex items-center justify-center">
                {LABELS[i]}
              </span>
              <span className="text-gray-800">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
