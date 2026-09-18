import React, { useState, useEffect, useRef } from 'react';
import { PatientService } from '../../../services/api/PatientService';
import { SpeechSynthesisService } from '../../../services/accessibility/SpeechSynthesisService';
import { SpeechRecognitionService, type SpeechRecognitionState } from '../../../services/accessibility/SpeechRecognitionService';
import { LanguageService } from '../../../services/accessibility/LanguageService';
import { generateFavoriteSongQuestions, type SongQuestion } from '../../../services/demo/PersonalizedQuestionService';
import { DEMO_PATIENT_ID } from '../../../services/demo/DemoMemoryData';
import { Volume2, Play, Pause, RotateCcw, Music, CheckCircle, XCircle, Mic, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

const LABELS = ['A', 'B', 'C', 'D'];

type GameState = 'LOADING' | 'READY' | 'PLAYING_SONG' | 'ASKING_QUESTION' | 'LISTENING' | 'EVALUATING' | 'HINTING' | 'SUCCESS' | 'WAITING_MANUAL_INPUT';

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
  
  const [gameState, setGameState] = useState<GameState>('LOADING');
  const [answered,      setAnswered]      = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  
  const startTimeRef = useRef(Date.now());
  const scoreRef     = useRef(0);
  const mistakesRef  = useRef(0);
  const hintsRef     = useRef(0);
  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const timeoutRef   = useRef<NodeJS.Timeout | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const patientId = PatientService.getProfile()?.id || DEMO_PATIENT_ID;
    const qs = generateFavoriteSongQuestions(patientId, difficulty);
    setQuestions(qs);
    
    // Automatically enable voice mode for this interactive game if not enabled
    if (!LanguageService.isVoiceModeEnabled()) {
        LanguageService.setVoiceMode(true);
    }

    if (qs.length > 0) {
       setGameState('READY');
    } else {
       setGameState('WAITING_MANUAL_INPUT');
    }
    
    return () => {
       if (timeoutRef.current) clearTimeout(timeoutRef.current);
       SpeechRecognitionService.stopListening();
       SpeechSynthesisService.stop();
    };
  }, [difficulty]);

  const startQuestion = (index: number, qs: SongQuestion[]) => {
    if (index >= qs.length) return;
    setCurrentIndex(index);
    setGameState('PLAYING_SONG');
    setAnswered(null);
    setFeedback(null);
    setTranscript('');
    startTimeRef.current = Date.now();
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    const playDuration = Math.floor(Math.random() * 3000) + 3000; // 3 to 6 seconds
    timeoutRef.current = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      askQuestion(qs[index]);
    }, playDuration);
  };

  const askQuestion = (q: SongQuestion) => {
    setGameState('ASKING_QUESTION');
    SpeechSynthesisService.speak(q.voiceQuestion);
    
    const waitTime = Math.max(3000, q.voiceQuestion.length * 70);
    timeoutRef.current = setTimeout(() => {
      startListening(q);
    }, waitTime);
  };

  const startListening = (q: SongQuestion) => {
    setGameState('LISTENING');
    setTranscript('');
    SpeechRecognitionService.startListening((state: SpeechRecognitionState) => {
       if (state === 'ERROR' || state === 'UNSUPPORTED') {
          setGameState('WAITING_MANUAL_INPUT');
       }
    }).then(result => {
       setTranscript(result);
       evaluateAnswer(result, q);
    }).catch(err => {
       console.error("Speech error", err);
       setGameState('WAITING_MANUAL_INPUT');
    });
  };

  const evaluateAnswer = (spokenText: string, q: SongQuestion) => {
    setGameState('EVALUATING');
    const lowerText = spokenText.toLowerCase();
    
    if (lowerText.includes("don't know") || lowerText.includes("mahit nahi") || lowerText.includes("no idea")) {
       provideHint(q);
       return;
    }

    const isMatch = q.keywords.some(kw => lowerText.includes(kw));
    
    if (isMatch) {
       handleSuccess(q);
    } else {
       mistakesRef.current += 1;
       provideHint(q);
    }
  };

  const provideHint = (q: SongQuestion) => {
    setGameState('HINTING');
    hintsRef.current += 1;
    setFeedback({ message: "Hint: " + q.voiceHint, isCorrect: false });
    SpeechSynthesisService.speak(q.voiceHint);
    
    const waitTime = Math.max(3000, q.voiceHint.length * 70);
    timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      startListening(q);
    }, waitTime);
  };

  const handleSuccess = (q: SongQuestion) => {
    setGameState('SUCCESS');
    scoreRef.current += 100;
    setDisplayScore(scoreRef.current);
    setFeedback({ message: t('game.correct') + "! " + q.correctAnswer, isCorrect: true });
    SpeechSynthesisService.speak("Excellent! That is correct.");
    
    const timeTaken = Date.now() - startTimeRef.current;
    setResponseTimes(prev => [...prev, timeTaken]);

    timeoutRef.current = setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
         startQuestion(currentIndex + 1, questions);
      } else {
         finishGame(timeTaken);
      }
    }, 4000);
  };

  const finishGame = (lastTime: number) => {
    const allTimes = [...responseTimes, lastTime];
    const avgTime  = allTimes.reduce((a, b) => a + b, 0) / (allTimes.length || 1);
    const accuracy = ((questions.length - mistakesRef.current) / questions.length) * 100;
    onComplete({
      score:               scoreRef.current,
      accuracy:            Math.max(0, Math.round(accuracy)),
      averageResponseTime: Math.round(avgTime),
      mistakes:            mistakesRef.current,
      hints:               hintsRef.current, 
      retries:             0
    });
  };

  const handleManualAnswer = (selected: string) => {
    if (gameState === 'SUCCESS' || answered) return;
    setAnswered(selected);
    const q = questions[currentIndex];
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    SpeechRecognitionService.stopListening();
    SpeechSynthesisService.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (selected === q.correctAnswer) {
       handleSuccess(q);
    } else {
       mistakesRef.current += 1;
       provideHint(q);
       timeoutRef.current = setTimeout(() => {
          setGameState('WAITING_MANUAL_INPUT');
          setAnswered(null);
       }, Math.max(3000, q.voiceHint.length * 70));
    }
  };

  // ── Render States ──────────────────────────────────────────────────────────
  if (gameState === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (gameState === 'READY') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[50vh]">
        <Music className="w-20 h-20 text-primary-teal mb-6" />
        <h2 className="text-3xl font-bold text-text-charcoal mb-4">Ready to play?</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">Listen to the song and guess who sang it or which movie it is from.</p>
        <button
          onClick={() => startQuestion(0, questions)}
          className="bg-primary-teal hover:bg-teal-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all active:scale-95 text-xl flex items-center gap-3"
        >
          <Play className="w-6 h-6 fill-current" />
          Start Game
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Music className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl text-gray-600 font-medium">{t('common.no_memories')}</p>
      </div>
    );
  }

  const total    = questions.length;
  const currentQ = questions[currentIndex];
  const progress = total > 0 ? (currentIndex / total) * 100 : 0;
  const hasAudio = !!currentQ.song.audioUrl;
  const audioSrc = hasAudio ? currentQ.song.audioUrl! : '';
  const isPlaying = gameState === 'PLAYING_SONG';

  return (
    <div className="w-full max-w-2xl mx-auto text-center select-none pb-12">
      {hasAudio && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="auto"
        />
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-semibold text-gray-400 mb-2">
          <span>Question {currentIndex + 1} of {total}</span>
          <span className="text-primary-teal font-bold">{t('game.score')}: {displayScore}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-teal rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Voice Assistant Status */}
      <div className="bg-blue-50/80 rounded-[32px] p-6 mb-8 shadow-sm border border-blue-100 flex flex-col items-center transition-all min-h-[160px] justify-center">
         {gameState === 'PLAYING_SONG' && (
           <div className="flex flex-col items-center animate-pulse">
             <Music className="w-12 h-12 text-ai-blue mb-3" />
             <p className="text-xl font-bold text-ai-blue">Playing a song...</p>
           </div>
         )}
         {gameState === 'ASKING_QUESTION' && (
           <div className="flex flex-col items-center">
             <Volume2 className="w-12 h-12 text-primary-teal mb-3 animate-bounce" />
             <p className="text-xl font-bold text-text-charcoal">{currentQ.voiceQuestion}</p>
           </div>
         )}
         {gameState === 'LISTENING' && (
           <div className="flex flex-col items-center">
             <div className="relative">
               <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
               <div className="relative bg-red-500 p-4 rounded-full text-white shadow-lg mb-3">
                  <Mic className="w-8 h-8" />
               </div>
             </div>
             <p className="text-xl font-bold text-text-charcoal mt-2">Listening to your answer...</p>
             <p className="text-sm text-gray-500 mt-1">Speak now</p>
           </div>
         )}
         {gameState === 'HINTING' && (
           <div className="flex flex-col items-center">
             <Volume2 className="w-12 h-12 text-attention-amber mb-3 animate-pulse" />
             <p className="text-xl font-bold text-text-charcoal">{currentQ.voiceHint}</p>
           </div>
         )}
         {gameState === 'EVALUATING' && (
           <div className="flex flex-col items-center">
             <div className="w-10 h-10 border-4 border-ai-blue border-t-transparent rounded-full animate-spin mb-3" />
             <p className="text-xl font-bold text-gray-600">Thinking...</p>
             <p className="text-md text-gray-500 italic mt-2">"{transcript}"</p>
           </div>
         )}
         {gameState === 'WAITING_MANUAL_INPUT' && (
           <div className="flex flex-col items-center">
             <AlertCircle className="w-10 h-10 text-amber-500 mb-3" />
             <p className="text-lg font-bold text-text-charcoal">{currentQ.voiceQuestion}</p>
             <p className="text-md text-gray-500 mt-1">Voice input unavailable. Please tap an answer below.</p>
           </div>
         )}
         {gameState === 'SUCCESS' && (
           <div className="flex flex-col items-center">
             <CheckCircle className="w-12 h-12 text-green-500 mb-3 animate-bounce" />
             <p className="text-xl font-bold text-green-700">Correct!</p>
           </div>
         )}
      </div>

      {/* Music Player Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col items-center max-w-xs mx-auto">
        <div className="relative w-28 h-28 mb-4">
          {currentQ.song.image ? (
            <img
              src={currentQ.song.image}
              alt="Song"
              className={`w-full h-full rounded-full object-cover shadow-md border-2 border-white ring-2 ring-primary-teal/20 ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '8s' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-md border-2 border-white ring-2 ring-primary-teal/20 ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '8s' }}
            >
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>
        {!hasAudio && (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            🎵 {t('game.demo_song')}
          </span>
        )}
      </div>

      {/* Options Fallback (always visible but slightly faded if listening) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${gameState !== 'WAITING_MANUAL_INPUT' && gameState !== 'SUCCESS' ? 'opacity-50 pointer-events-none' : ''}`}>
        {currentQ.options.map((opt, i) => {
          const isSelected   = answered === opt;
          const isCorrectOpt = opt === currentQ.correctAnswer;
          let borderClass = 'border-gray-200 hover:border-primary-teal hover:bg-teal-50';
          if (answered || gameState === 'SUCCESS') {
            if (isCorrectOpt)    borderClass = 'border-green-400 bg-green-50';
            else if (isSelected) borderClass = 'border-red-300 bg-red-50';
            else                 borderClass = 'border-gray-100 opacity-60';
          }

          return (
            <button
              key={i}
              onClick={() => handleManualAnswer(opt)}
              disabled={!!answered || gameState === 'SUCCESS'}
              className={`bg-white border-2 font-bold py-5 px-4 rounded-2xl transition-all shadow-sm active:scale-95 text-lg text-left flex items-center gap-3 ${borderClass}`}
            >
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary-teal/10 text-primary-teal font-black text-md flex items-center justify-center">
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
