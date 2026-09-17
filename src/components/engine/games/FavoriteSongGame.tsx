/**
 * FavoriteSongGame.tsx
 * =====================
 * Personalized game: Displays a song interaction panel (play/pause) and asks
 * the patient to identify the song from 4 options.
 *
 * For the demo prototype, audio playback uses:
 *   1. audioUrl from MemoryService (if caregiver uploaded a real file)
 *   2. A graceful "Demo Mode" UI that still lets the patient answer
 *
 * Data source: PersonalizedQuestionService → MemoryService (with demo fallback)
 */
import React, { useState, useEffect, useRef } from 'react';
import { PatientService } from '../../../services/api/PatientService';
import { SpeechSynthesisService } from '../../../services/accessibility/SpeechSynthesisService';
import { generateFavoriteSongQuestions, type SongQuestion } from '../../../services/demo/PersonalizedQuestionService';
import { DEMO_PATIENT_ID } from '../../../services/demo/DemoMemoryData';
import { Volume2, Play, Pause, RotateCcw, Music, CheckCircle, XCircle } from 'lucide-react';

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

export const FavoriteSongGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [questions,     setQuestions]     = useState<SongQuestion[]>([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [displayScore,  setDisplayScore]  = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [feedback,      setFeedback]      = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [answered,      setAnswered]      = useState<string | null>(null);
  const [isPlaying,     setIsPlaying]     = useState(false);

  const startTimeRef = useRef(Date.now());
  const scoreRef     = useRef(0);
  const mistakesRef  = useRef(0);
  const audioRef     = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const patientId = PatientService.getProfile()?.id || DEMO_PATIENT_ID;
    const qs = generateFavoriteSongQuestions(patientId, difficulty);
    setQuestions(qs);
    setLoading(false);
    startTimeRef.current = Date.now();
  }, [difficulty]);

  // Stop audio when navigating between questions
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [currentIndex]);

  const total    = questions.length;
  const currentQ = questions[currentIndex];

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // Graceful: if audio fails (no file), we still let the patient answer
      });
      setIsPlaying(true);
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const speakQuestion = () => {
    SpeechSynthesisService.speak("Do you recognise this song? Choose from the options below.");
  };

  const handleAnswer = (selected: string) => {
    if (feedback || answered) return;

    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    const isCorrect = selected === currentQ.correctAnswer;
    const timeTaken = Date.now() - startTimeRef.current;

    setAnswered(selected);
    setResponseTimes(prev => [...prev, timeTaken]);

    if (isCorrect) {
      scoreRef.current += 100;
      setDisplayScore(scoreRef.current);
      setFeedback({
        message: `🎵 Correct! That beautiful song is "${currentQ.song.title}".`,
        isCorrect: true
      });
    } else {
      mistakesRef.current += 1;
      setFeedback({
        message: `The song was "${currentQ.correctAnswer}". A wonderful memory!`,
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

  // ── Render States ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl text-gray-500">Loading your favourite music...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Music className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl text-gray-600 font-medium">No songs found.</p>
        <p className="text-gray-400 mt-2">Ask your caregiver to add favourite songs in the dashboard.</p>
      </div>
    );
  }

  const progress = total > 0 ? (currentIndex / total) * 100 : 0;
  const hasAudio = !!currentQ.song.audioUrl;

  // Silence fallback audio to avoid a jarring beep
  const audioSrc = hasAudio ? currentQ.song.audioUrl! : '';

  return (
    <div className="w-full max-w-2xl mx-auto text-center select-none">
      {/* Hidden audio element */}
      {hasAudio && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-semibold text-gray-400 mb-2">
          <span>Song {currentIndex + 1} of {total}</span>
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
      <div className="flex items-center justify-center gap-3 mb-6">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
          Do you recognise this song?
        </h3>
        <button
          onClick={speakQuestion}
          aria-label="Read question aloud"
          className="shrink-0 p-3 bg-teal-50 text-primary-teal rounded-full hover:bg-teal-100 transition-colors"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>

      {/* Music Player Card */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 mb-8 flex flex-col items-center max-w-sm mx-auto">
        {/* Album art or animated disc */}
        <div className="relative w-36 h-36 mb-6">
          {currentQ.song.image ? (
            <img
              src={currentQ.song.image}
              alt="Song"
              className={`w-full h-full rounded-full object-cover shadow-lg border-4 border-white ring-4 ring-primary-teal/20 ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '8s' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : null}
          {/* Default disc */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-lg border-4 border-white ring-4 ring-primary-teal/20 ${isPlaying ? 'animate-spin' : ''}`}
            style={{ animationDuration: '8s' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>
          {/* Pulse ring when playing */}
          {isPlaying && (
            <div className="absolute inset-0 rounded-full animate-ping border-4 border-primary-teal/30" />
          )}
        </div>

        {/* Demo mode badge */}
        {!hasAudio && (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-4">
            🎵 Demo — Tap play, then choose the song
          </span>
        )}

        {/* Controls */}
        <div className="flex items-center gap-5">
          <button
            onClick={restartAudio}
            aria-label="Restart"
            className="p-4 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          <button
            onClick={toggleAudio}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className={`p-7 rounded-full shadow-lg text-white transition-all active:scale-95 ${
              isPlaying ? 'bg-teal-700 hover:bg-teal-800' : 'bg-primary-teal hover:bg-teal-700'
            }`}
          >
            {isPlaying
              ? <Pause className="w-9 h-9" />
              : <Play  className="w-9 h-9 ml-1" />
            }
          </button>
        </div>
      </div>

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
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQ.options.map((opt, i) => {
          const isSelected   = answered === opt;
          const isCorrectOpt = opt === currentQ.correctAnswer;
          let borderClass = 'border-gray-200 hover:border-primary-teal hover:bg-teal-50';
          if (answered) {
            if (isCorrectOpt)    borderClass = 'border-green-400 bg-green-50';
            else if (isSelected) borderClass = 'border-red-300 bg-red-50';
            else                 borderClass = 'border-gray-100 opacity-60';
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
