/**
 * MemoryMomentsGame.tsx
 * ======================
 * Personalized game: Shows a memory card (image + title + details) for a short
 * "study" phase, then hides the details and asks the patient where or when it happened.
 *
 * Data source: PersonalizedQuestionService → MemoryService (with demo fallback)
 */
import React, { useState, useEffect, useRef } from 'react';
import { PatientService } from '../../../services/api/PatientService';
import { SpeechSynthesisService } from '../../../services/accessibility/SpeechSynthesisService';
import { generateMemoryMomentsQuestions, type MomentQuestion } from '../../../services/demo/PersonalizedQuestionService';
import { DEMO_PATIENT_ID } from '../../../services/demo/DemoMemoryData';
import { Volume2, Image as ImageIcon, CheckCircle, XCircle, MapPin, Calendar } from 'lucide-react';

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

export const MemoryMomentsGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [questions,     setQuestions]     = useState<MomentQuestion[]>([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [displayScore,  setDisplayScore]  = useState(0);
  const [phase,         setPhase]         = useState<'study' | 'question'>('study');
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [feedback,      setFeedback]      = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [answered,      setAnswered]      = useState<string | null>(null);
  const [studyProgress, setStudyProgress] = useState(100);

  const startTimeRef   = useRef(Date.now());
  const scoreRef       = useRef(0);
  const mistakesRef    = useRef(0);
  const studyTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Study duration: Easy=8s, Medium=6s, Hard=4s
  const studyMs = difficulty === 1 ? 8000 : difficulty === 2 ? 6000 : 4000;

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const patientId = PatientService.getProfile()?.id || DEMO_PATIENT_ID;
    const qs = generateMemoryMomentsQuestions(patientId, difficulty);
    setQuestions(qs);
    setLoading(false);
  }, [difficulty]);

  // ── Study phase timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || questions.length === 0) return;

    setPhase('study');
    setStudyProgress(100);

    // Progress bar countdown
    const tick = 50; // ms
    let elapsed = 0;
    progressTimerRef.current = setInterval(() => {
      elapsed += tick;
      setStudyProgress(Math.max(0, 100 - (elapsed / studyMs) * 100));
    }, tick);

    studyTimerRef.current = setTimeout(() => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setPhase('question');
      startTimeRef.current = Date.now();
    }, studyMs);

    return () => {
      if (studyTimerRef.current)   clearTimeout(studyTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, loading, questions.length]);

  const total    = questions.length;
  const currentQ = questions[currentIndex];

  const speakQuestion = () => {
    SpeechSynthesisService.speak(currentQ?.questionText ?? "Where did this happen?");
  };

  const handleAnswer = (selected: string) => {
    if (feedback || answered) return;

    const isCorrect = selected === currentQ.correctAnswer;
    const timeTaken = Date.now() - startTimeRef.current;

    setAnswered(selected);
    setResponseTimes(prev => [...prev, timeTaken]);

    if (isCorrect) {
      scoreRef.current += 100;
      setDisplayScore(scoreRef.current);
      setFeedback({ message: "Excellent memory! That's correct.", isCorrect: true });
    } else {
      mistakesRef.current += 1;
      setFeedback({
        message: `The answer was "${currentQ.correctAnswer}". Well done for trying!`,
        isCorrect: false
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setAnswered(null);

      if (currentIndex + 1 < total) {
        setCurrentIndex(i => i + 1);
        // Study phase useEffect triggers automatically on currentIndex change
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
    }, 2200);
  };

  // ── Render States ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl text-gray-500">Preparing your memories...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl text-gray-600 font-medium">No memories found.</p>
        <p className="text-gray-400 mt-2">Ask your caregiver to add memories in the dashboard.</p>
      </div>
    );
  }

  const progress = total > 0 ? (currentIndex / total) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto text-center select-none">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-semibold text-gray-400 mb-2">
          <span>Memory {currentIndex + 1} of {total}</span>
          <span className="text-primary-teal font-bold">Score: {displayScore}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-teal rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── STUDY PHASE ── */}
      {phase === 'study' && (
        <div className="animate-fade-in">
          <h3 className="text-3xl font-bold text-gray-800 mb-1">Look at this memory</h3>
          <p className="text-lg text-gray-400 mb-6">Remember where and when this happened.</p>

          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col items-center">
            {/* Memory Image — fallback icon below, real photo on top */}
            <div className="relative w-full h-44 rounded-2xl mb-5 overflow-hidden">
              {/* Fallback background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-300" />
              </div>
              {/* Real photo on top */}
              {currentQ.memory.image && (
                <img
                  src={currentQ.memory.image}
                  alt={currentQ.memory.title}
                  className="absolute inset-0 w-full h-full object-cover z-10"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>

            <h2 className="text-2xl font-bold text-primary-teal mb-2">{currentQ.memory.title}</h2>
            <p className="text-gray-500 text-base mb-4 leading-relaxed max-w-sm">{currentQ.memory.content}</p>

            {/* Key facts */}
            <div className="flex flex-wrap gap-3 justify-center">
              {currentQ.memory.year && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  {currentQ.memory.year}
                </div>
              )}
              {currentQ.memory.location && (
                <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-4 py-2 rounded-xl font-bold text-sm">
                  <MapPin className="w-4 h-4" />
                  {currentQ.memory.location}
                </div>
              )}
            </div>
          </div>

          {/* Study countdown bar */}
          <div className="mt-5 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary-teal h-full rounded-full transition-all"
              style={{
                width: `${studyProgress}%`,
                transitionDuration: '50ms',
                transitionTimingFunction: 'linear'
              }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            The question will appear shortly...
          </p>
        </div>
      )}

      {/* ── QUESTION PHASE ── */}
      {phase === 'question' && (
        <div className="animate-fade-in">
          {/* Question + Speaker */}
          <div className="flex items-center justify-center gap-3 mb-5">
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

          {/* Thumbnail reminder — fallback below, photo on top */}
          <div className="relative w-36 h-36 mx-auto mb-6 rounded-2xl overflow-hidden shadow-md border-4 border-white ring-2 ring-primary-teal/20">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-300" />
            </div>
            {currentQ.memory.image && (
              <img
                src={currentQ.memory.image}
                alt="Memory reminder"
                className="absolute inset-0 w-full h-full object-cover z-10"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          {/* Memory title reminder */}
          <p className="text-lg font-semibold text-gray-500 mb-6">{currentQ.memory.title}</p>

          {/* Feedback */}
          {feedback && (
            <div className={`flex items-center justify-center gap-3 p-5 rounded-2xl mb-6 text-lg font-bold
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

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options.map((opt, i) => {
              const isSelected   = answered === opt;
              const isCorrectOpt = opt === currentQ.correctAnswer;
              let borderClass = 'border-gray-200 hover:border-primary-teal hover:bg-teal-50';
              if (answered) {
                if (isCorrectOpt)     borderClass = 'border-green-400 bg-green-50';
                else if (isSelected)  borderClass = 'border-red-300 bg-red-50';
                else                  borderClass = 'border-gray-100 opacity-60';
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
      )}
    </div>
  );
};
