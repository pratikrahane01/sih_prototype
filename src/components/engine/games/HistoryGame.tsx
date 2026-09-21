import React, { useState, useEffect, useRef } from 'react';
import { SpeechSynthesisService } from '../../../services/accessibility/SpeechSynthesisService';
import { SpeechRecognitionService, type SpeechRecognitionState } from '../../../services/accessibility/SpeechRecognitionService';
import { LanguageService } from '../../../services/accessibility/LanguageService';
import { generateHistoryQuestions, type HistoryQuestion } from '../../../services/demo/PersonalizedQuestionService';
import { CheckCircle, XCircle, Mic, AlertCircle, Play } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

const LABELS = ['A', 'B', 'C', 'D'];

type GameState = 'LOADING' | 'READY' | 'PLAYING_VIDEO' | 'ASKING_QUESTION' | 'LISTENING' | 'EVALUATING' | 'HINTING' | 'SUCCESS' | 'WAITING_MANUAL_INPUT';

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

export const HistoryGame: React.FC<Props> = ({ difficulty, onComplete }) => {
  const [,     setQuestions]     = useState<HistoryQuestion[]>([]);  const [currentIndex,  setCurrentIndex]  = useState(0);
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
  const questionsRef = useRef<HistoryQuestion[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    // We don't rely on patientId for difficulty right now as history questions are static
    const qs = generateHistoryQuestions();
    setQuestions(qs);
    questionsRef.current = qs;
    
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
       SpeechRecognitionService.stopListening();
       SpeechSynthesisService.stop();
    };
  }, [difficulty]);

  const startQuestion = (index: number, qs: HistoryQuestion[]) => {
    if (index >= qs.length) return;
    setCurrentIndex(index);
    setAnswered(null);
    setFeedback(null);
    setTranscript('');
    startTimeRef.current = Date.now();
    
    if (index === 0) {
      setGameState('PLAYING_VIDEO');
    } else {
      askQuestion(qs[index]);
    }
  };

  const handleVideoComplete = () => {
    if (questionsRef.current.length > 0) {
      askQuestion(questionsRef.current[currentIndex]);
    }
  };

  const askQuestion = async (q: HistoryQuestion) => {
    setGameState('ASKING_QUESTION');
    await SpeechSynthesisService.speak(q.voiceQuestion);
    startListening(q);
  };

  const startListening = (q: HistoryQuestion) => {
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

  const evaluateAnswer = (spokenText: string, isFinal: boolean, q: HistoryQuestion) => {
    const lowerText = spokenText.toLowerCase();
    
    if (lowerText.includes("don't know") || lowerText.includes("mahit nahi") || lowerText.includes("no idea")) {
       SpeechRecognitionService.stopListening();
       setGameState('EVALUATING');
       provideHint(q);
       return;
    }

    const isMatch = q.keywords.some(kw => lowerText.includes(kw));
    
    if (isMatch) {
       SpeechRecognitionService.stopListening();
       setGameState('EVALUATING');
       handleSuccess(q, q.correctAnswer);
    } else if (isFinal) {
       setGameState('EVALUATING');
       mistakesRef.current += 1;
       provideHint(q);
    }
  };

  const provideHint = async (q: HistoryQuestion) => {
    setGameState('HINTING');
    hintsRef.current += 1;
    
    let wrongMsg = "That's not quite right. Here is a hint: ";
    const lang = LanguageService.getCurrentLanguageCode();
    if (lang === 'mr') wrongMsg = "ते अगदी बरोबर नाही. येथे एक संकेत आहे: ";
    else if (lang === 'hi') wrongMsg = "यह बिल्कुल सही नहीं है। यहाँ एक संकेत है: ";
    else if (lang === 'as') wrongMsg = "সেয়া সম্পূৰ্ণ শুদ্ধ নহয়। ইয়াত এটা ইংগিত দিয়া হ'ল: ";
    
    await SpeechSynthesisService.speak(wrongMsg + q.voiceHint);
    
    setGameState('WAITING_MANUAL_INPUT');
  };

  const handleSuccess = async (q: HistoryQuestion, selectedOpt?: string) => {
    setGameState('SUCCESS');
    scoreRef.current += 100;
    setDisplayScore(scoreRef.current);
    
    if (selectedOpt) setAnswered(selectedOpt);

    setFeedback({ message: t('game.correct') + `!`, isCorrect: true });
    
    let successMsg = "Excellent! That is correct.";
    const lang = LanguageService.getCurrentLanguageCode();
    if (lang === 'mr') successMsg = "उत्कृष्ट! ते बरोबर आहे.";
    else if (lang === 'hi') successMsg = "उत्कृष्ट! यह सही है।";
    else if (lang === 'as') successMsg = "সুন্দৰ! সেয়া সঁচা।";
    
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
    const qs = questionsRef.current;
    const accuracy = ((qs.length - mistakesRef.current) / qs.length) * 100;

    onComplete({
      score: scoreRef.current,
      accuracy: Math.max(0, accuracy),
      averageResponseTime: avgTime,
      mistakes: mistakesRef.current,
      hints: hintsRef.current,
      retries: 0
    });
  };

  const handleAnswer = (selected: string) => {
    if (gameState === 'SUCCESS') return;
    
    const currentQ = questionsRef.current[currentIndex];
    const isCorrect = selected === currentQ.correctAnswer;
    
    SpeechRecognitionService.stopListening();
    setAnswered(selected);

    if (isCorrect) {
       handleSuccess(currentQ, selected);
    } else {
       mistakesRef.current += 1;
       setFeedback({ message: t('game.tryAgain'), isCorrect: false });
       provideHint(currentQ);
    }
  };

  if (gameState === 'LOADING') {
    return <div className="flex justify-center items-center h-64 text-xl">{t('common.loading')}</div>;
  }

  if (gameState === 'READY') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-6">
        <h2 className="text-3xl font-bold text-primary-teal text-center">
          {t('game.historicalJourney.title') || 'Historical Journey'}
        </h2>
        <p className="text-xl text-text-charcoal text-center max-w-lg">
          {t('game.historicalJourney.instructions') || 'Watch the video, then answer questions.'}
        </p>
        <button
          onClick={() => startQuestion(0, questionsRef.current)}
          className="bg-primary-teal text-white px-8 py-4 rounded-full text-2xl font-bold hover:bg-teal-700 transition shadow-lg flex items-center gap-3"
        >
          <Play className="w-8 h-8" fill="currentColor" />
          {t('game.startActivity')}
        </button>
      </div>
    );
  }

  const currentQ = questionsRef.current[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-medium text-text-charcoal/70">
          {t('game.question_x')} {currentIndex + 1} {t('game.of_y')} {questionsRef.current.length}
        </div>
        <div className="text-2xl font-bold text-primary-teal">
          {t('game.score')}: {displayScore}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
        
        {/* Video Player */}
        {currentIndex === 0 && gameState === 'PLAYING_VIDEO' ? (
          <div className="w-full flex flex-col items-center space-y-6">
            <h3 className="text-2xl font-bold text-primary-teal text-center">Watch the Video</h3>
            <div className="w-full max-w-md aspect-[9/16] rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100 relative">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/jNwAmpQQHvI?autoplay=1&controls=1" 
                title="Historical Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
            </div>
            <button 
              onClick={handleVideoComplete}
              className="bg-primary-teal text-white px-8 py-3 rounded-full text-xl font-medium hover:bg-teal-700 transition shadow-sm mt-4"
            >
              Continue to Questions
            </button>
          </div>
        ) : (
          <>
            {/* Question Display */}
            <h2 className="text-3xl font-bold text-text-charcoal mb-8 text-center max-w-2xl">
              {currentQ.questionText}
            </h2>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
              {currentQ.options.map((opt, i) => {
                const isSelected = answered === opt;
                let bgClass = "bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200 text-text-charcoal";
                
                if (isSelected) {
                  bgClass = opt === currentQ.correctAnswer 
                    ? "bg-green-100 border-green-500 text-green-900" 
                    : "bg-red-100 border-red-500 text-red-900";
                } else if (gameState === 'SUCCESS' && opt === currentQ.correctAnswer) {
                  bgClass = "bg-green-100 border-green-500 text-green-900";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={gameState === 'SUCCESS' || gameState === 'LISTENING' || gameState === 'HINTING'}
                    className={`relative p-6 rounded-2xl border-2 transition-all flex items-center justify-between group disabled:cursor-default ${bgClass}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                        ${isSelected ? 'bg-white/50' : 'bg-white text-primary-teal'}`}
                      >
                        {LABELS[i]}
                      </span>
                      <span className="text-2xl font-medium text-left">{opt}</span>
                    </div>
                    {isSelected && (
                      opt === currentQ.correctAnswer 
                        ? <CheckCircle className="w-8 h-8 text-green-600" />
                        : <XCircle className="w-8 h-8 text-red-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Voice Assistant UI */}
            {LanguageService.isVoiceModeEnabled() && (
              <div className="w-full flex flex-col items-center pt-6 border-t border-gray-100">
                <div className={`
                  flex items-center gap-4 px-8 py-4 rounded-full transition-all
                  ${gameState === 'LISTENING' ? 'bg-blue-50 border border-ai-blue/30 scale-105' : ''}
                  ${gameState === 'ASKING_QUESTION' || gameState === 'HINTING' ? 'bg-purple-50 border border-purple-200' : ''}
                  ${gameState === 'SUCCESS' ? 'bg-green-50 border border-green-200' : ''}
                `}>
                  <div className="relative">
                    <Mic className={`w-8 h-8 ${
                      gameState === 'LISTENING' ? 'text-ai-blue animate-pulse' : 
                      gameState === 'ASKING_QUESTION' || gameState === 'HINTING' ? 'text-purple-500' : 
                      gameState === 'SUCCESS' ? 'text-green-500' : 
                      'text-gray-400'
                    }`} />
                    {gameState === 'LISTENING' && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-lg font-medium text-gray-700">
                      {gameState === 'ASKING_QUESTION' && "Asking question..."}
                      {gameState === 'LISTENING' && (t('game.listening_answer') || "Listening...")}
                      {gameState === 'EVALUATING' && (t('game.thinking') || "Evaluating...")}
                      {gameState === 'HINTING' && "Providing a hint..."}
                      {gameState === 'WAITING_MANUAL_INPUT' && "Tap an option or press Mic to speak"}
                      {gameState === 'SUCCESS' && "Correct!"}
                    </span>
                    {transcript && gameState === 'LISTENING' && (
                      <span className="text-ai-blue text-sm">"{transcript}"</span>
                    )}
                  </div>
                </div>

                {gameState === 'WAITING_MANUAL_INPUT' && (
                  <button 
                    onClick={() => startListening(currentQ)}
                    className="mt-4 text-ai-blue font-medium hover:underline flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    Speak again
                  </button>
                )}
              </div>
            )}

            {/* Error Feedback */}
            {feedback && !feedback.isCorrect && (
              <div className="mt-6 flex items-center gap-3 text-red-600 bg-red-50 px-6 py-4 rounded-xl border border-red-100 animate-fade-in w-full max-w-md mx-auto">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <span className="text-lg font-medium">{feedback.message}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
