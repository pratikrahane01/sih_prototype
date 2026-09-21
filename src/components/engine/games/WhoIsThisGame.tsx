/**
 * WhoIsThisGame.tsx
 * ==================
 * Personalized game: Shows a familiar person's image (or avatar) and asks
 * the patient to identify them by name or relationship.
 * Now integrated with Voice Assistant!
 */
import React, { useState, useEffect, useRef } from 'react';
import { PatientService } from '../../../services/api/PatientService';
import { SpeechSynthesisService } from '../../../services/accessibility/SpeechSynthesisService';
import { SpeechRecognitionService, type SpeechRecognitionState } from '../../../services/accessibility/SpeechRecognitionService';
import { LanguageService } from '../../../services/accessibility/LanguageService';
import { generateWhoIsThisQuestions, type PersonQuestion } from '../../../services/demo/PersonalizedQuestionService';
import { WhoIsThisAnswerEvaluator } from '../../../services/engine/WhoIsThisAnswerEvaluator';
import { DEMO_PATIENT_ID } from '../../../services/demo/DemoMemoryData';
import { Volume2, Users, CheckCircle, XCircle, Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

type GameState = 'LOADING' | 'READY' | 'ASKING_QUESTION' | 'LISTENING' | 'HINTING' | 'EVALUATING' | 'WAITING_MANUAL_INPUT' | 'SUCCESS' | 'UNCERTAIN';

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
  const [gameState,     setGameState]     = useState<GameState>('LOADING');
  const [transcript,    setTranscript]    = useState('');
  const [answered,      setAnswered]      = useState<string | null>(null);

  const startTimeRef = useRef(Date.now());
  const scoreRef    = useRef(0);
  const mistakesRef = useRef(0);
  const hintsRef    = useRef(0);
  const timeoutRef = useRef<any>(null);
  const questionsRef = useRef<PersonQuestion[]>([]);
  
  const { t } = useLanguage();

  useEffect(() => {
    const patientId = PatientService.getProfile()?.id || DEMO_PATIENT_ID;
    const qs = generateWhoIsThisQuestions(patientId, difficulty);
    setQuestions(qs);
    questionsRef.current = qs;
    setGameState('READY');
    
    if (qs.length > 0) {
       startQuestion(0, qs);
    }
    
    return () => {
       if (timeoutRef.current) clearTimeout(timeoutRef.current);
       SpeechRecognitionService.stopListening();
       SpeechSynthesisService.stop();
    };
  }, [difficulty]);

  const startQuestion = (index: number, qs: PersonQuestion[]) => {
    if (index >= qs.length) return;
    setCurrentIndex(index);
    setAnswered(null);
    setFeedback(null);
    setTranscript('');
    startTimeRef.current = Date.now();
    
    askQuestion(qs[index]);
  };

  const askQuestion = async (q: PersonQuestion) => {
    setGameState('ASKING_QUESTION');
    await SpeechSynthesisService.speak(q.voiceQuestion);
    startListening(q);
  };

  const startListening = (q: PersonQuestion) => {
    setGameState('LISTENING');
    setTranscript('');
    SpeechRecognitionService.startListening(
      (state: SpeechRecognitionState) => {
         if (state === 'ERROR' || state === 'UNSUPPORTED') {
            setGameState('WAITING_MANUAL_INPUT');
         }
      },
      (result: string, isFinal: boolean) => {
         setTranscript(result);
         evaluateAnswer(result, isFinal, q);
      },
      (err: Error) => {
         console.error("Speech error", err);
         setGameState('WAITING_MANUAL_INPUT');
      }
    );
  };

  const evaluateAnswer = async (spokenText: string, isFinal: boolean, q: PersonQuestion) => {
    // DO NOT evaluate interim results, only final transcripts as per requirement.
    if (!isFinal) return;

    SpeechRecognitionService.stopListening();
    setGameState('EVALUATING');
    
    const lang = LanguageService.getCurrentLanguageCode();
    const result = WhoIsThisAnswerEvaluator.evaluate(spokenText, q.person, lang);
    
    if (result.result === 'CORRECT') {
       handleSuccess(q, q.correctAnswer);
    } else if (result.result === 'UNCERTAIN') {
       setGameState('UNCERTAIN');
       let uncertainMsg = "That's okay. Take another look.";
       if (lang === 'mr') uncertainMsg = "ठीक आहे. पुन्हा एकदा पहा.";
       else if (lang === 'hi') uncertainMsg = "कोई बात नहीं। एक बार फिर से देखें।";
       else if (lang === 'as') uncertainMsg = "ঠিকাছে। আকৌ এবাৰ চাওক।";
       
       setFeedback({ message: uncertainMsg, isCorrect: false });
       await SpeechSynthesisService.speak(uncertainMsg);
       setFeedback(null);
       startListening(q);
    } else {
       mistakesRef.current += 1;
       provideHint(q);
    }
  };

  const provideHint = async (q: PersonQuestion) => {
    setGameState('HINTING');
    hintsRef.current += 1;
    
    let wrongMsg = "That's alright. Let's try again. Hint: ";
    const lang = LanguageService.getCurrentLanguageCode();
    if (lang === 'mr') wrongMsg = "काही हरकत नाही. आपण पुन्हा प्रयत्न करूया. सूचना: ";
    else if (lang === 'hi') wrongMsg = "कोई बात नहीं। चलिए फिर से प्रयास करते हैं। संकेत: ";
    else if (lang === 'as') wrongMsg = "একো নাই। আমি আকৌ এবাৰ চেষ্টা কৰো আহক। ইংগিত: ";
    
    setFeedback({ message: "Hint: " + q.voiceHint, isCorrect: false });
    await SpeechSynthesisService.speak(wrongMsg + q.voiceHint);
    
    setFeedback(null);
    setAnswered(null);
    startListening(q);
  };

  const handleSuccess = async (q: PersonQuestion, selectedOpt?: string) => {
    setGameState('SUCCESS');
    scoreRef.current += 100;
    setDisplayScore(scoreRef.current);
    
    if (selectedOpt) setAnswered(selectedOpt);

    setFeedback({ message: t('game.correct') + `! ${q.person.name}.`, isCorrect: true });
    
    let successMsg = "Yes! That's right.";
    const lang = LanguageService.getCurrentLanguageCode();
    if (lang === 'mr') successMsg = "होय! ते बरोबर आहे.";
    else if (lang === 'hi') successMsg = "हाँ! यह सही है।";
    else if (lang === 'as') successMsg = "হয়! সেয়া সঁচা।";
    
    await SpeechSynthesisService.speak(successMsg);
    
    const timeTaken = Date.now() - startTimeRef.current;
    setResponseTimes(prev => [...prev, timeTaken]);

    const qs = questionsRef.current;
    const actualIndex = qs.indexOf(q);

    if (actualIndex + 1 < qs.length) {
      startQuestion(actualIndex + 1, qs);
    } else {
      finishGame(timeTaken);
    }
  };

  const finishGame = (lastTime: number) => {
    const allTimes = [...responseTimes, lastTime];
    const avgTime = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
    const accuracy = ((questions.length - mistakesRef.current) / questions.length) * 100;

    onComplete({
      score: scoreRef.current,
      accuracy: Math.max(0, Math.round(accuracy)),
      averageResponseTime: Math.round(avgTime),
      mistakes: mistakesRef.current,
      hints: hintsRef.current,
      retries: 0
    });
  };

  // ── Manual click fallback ──
  const handleAnswer = (selected: string) => {
    if (gameState !== 'WAITING_MANUAL_INPUT' && gameState !== 'LISTENING') return;
    
    SpeechRecognitionService.stopListening();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setAnswered(selected);
    const isCorrect = selected === questions[currentIndex].correctAnswer;
    
    if (isCorrect) {
       handleSuccess(questions[currentIndex], selected);
    } else {
       mistakesRef.current += 1;
       provideHint(questions[currentIndex]);
    }
  };

  if (gameState === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl text-gray-500 font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Users className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl text-gray-600 font-medium">{t('common.no_memories')}</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const progress = total > 0 ? ((currentIndex) / total) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto text-center select-none">
      {/* Progress Bar */}
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

      {/* Question */}
      <div className="flex flex-col items-center justify-center gap-3 mb-8">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
          {currentQ.questionText}
        </h3>
        
        {/* Voice Assistant Status */}
        <div className="flex items-center gap-2 mt-4">
          {gameState === 'LISTENING' && (
            <div className="flex items-center gap-2 text-primary-teal bg-teal-50 px-4 py-2 rounded-full border border-teal-200 animate-pulse">
              <Mic className="w-5 h-5" />
              <span className="font-semibold">{t('game.listening') || "Listening..."}</span>
            </div>
          )}
          {(gameState === 'ASKING_QUESTION' || gameState === 'HINTING' || gameState === 'UNCERTAIN') && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">{gameState === 'HINTING' ? "Hinting..." : gameState === 'UNCERTAIN' ? "Encouraging..." : "Speaking..."}</span>
            </div>
          )}
          {gameState === 'WAITING_MANUAL_INPUT' && (
            <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              <MicOff className="w-5 h-5" />
              <span className="font-medium text-sm">Voice input is not available on this device. You can still choose an answer.</span>
            </div>
          )}
        </div>
        {transcript && gameState === 'LISTENING' && (
          <p className="text-gray-500 italic mt-2">"{transcript}"</p>
        )}
      </div>

      {/* Person Image */}
      <div className="relative w-52 h-52 mx-auto mb-8 rounded-3xl overflow-hidden shadow-lg border-4 border-white ring-4 ring-primary-teal/20">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-teal-50 to-blue-50">
          <Users className="w-20 h-20 text-primary-teal/40" />
          <span className="text-4xl font-black text-primary-teal/30 mt-1">
            {currentQ.person.name.charAt(0)}
          </span>
        </div>
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
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${(gameState === 'ASKING_QUESTION' || gameState === 'HINTING' || gameState === 'EVALUATING') ? 'opacity-50 pointer-events-none' : ''}`}>
        {currentQ.options.map((opt, i) => {
          const isSelected = answered === opt;
          const isCorrectOpt = opt === currentQ.correctAnswer;
          let borderClass = 'border-gray-200 hover:border-primary-teal hover:bg-teal-50';
          
          if (answered || gameState === 'SUCCESS') {
            if (isCorrectOpt)       borderClass = 'border-green-400 bg-green-50';
            else if (isSelected)    borderClass = 'border-red-300 bg-red-50';
            else                    borderClass = 'border-gray-100 opacity-60';
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              disabled={!!answered || gameState === 'SUCCESS'}
              className={`bg-white border-2 font-bold py-6 px-5 rounded-2xl transition-all shadow-sm active:scale-95 text-xl text-left flex items-center gap-4 ${borderClass}`}
            >
              <span className="shrink-0 w-9 h-9 rounded-full bg-primary-teal/10 text-primary-teal font-black text-lg flex items-center justify-center">
                {LABELS[i]}
              </span>
              <span className="text-gray-800">{t(`relationship.${opt.toLowerCase()}`, LanguageService.getLocalName(opt))}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
