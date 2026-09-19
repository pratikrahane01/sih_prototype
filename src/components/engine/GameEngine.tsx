import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameDefinition, GameSession, GameAttempt } from '../../types';
import { PatientService } from '../../services/api/PatientService';
import { TelemetryService } from '../../services/telemetry/TelemetryService';
import { useLanguage } from '../../contexts/LanguageContext';

// Dynamic game component imports
import { MemoryGame } from './games/MemoryGame';
import { AttentionGame } from './games/AttentionGame';
import { PatternGame } from './games/PatternGame';
import { SpatialGame } from './games/SpatialGame';
import { RouteRecallGame } from './games/RouteRecallGame';
import { WhoIsThisGame } from './games/WhoIsThisGame';
import { MemoryMomentsGame } from './games/MemoryMomentsGame';
import { LifeStoryGame } from './games/LifeStoryGame';
import { FavoriteSongGame } from './games/FavoriteSongGame';
import { HistoryGame } from './games/HistoryGame';
import { GameResult } from './GameResult';

interface Props {
  game: GameDefinition;
  difficulty: number;
}

export const GameEngine: React.FC<Props> = ({ game, difficulty }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<GameSession | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Initialize session when game starts
    const patient = PatientService.getProfile();
    if (!patient) {
      console.warn("No active patient profile found");
      navigate('/patient/onboarding');
      return;
    }

    setSession({
      sessionId: crypto.randomUUID(),
      patientId: patient.id,
      gameId: game.id,
      domain: game.domain,
      difficulty,
      startedAt: new Date().toISOString(),
      questionIndex: 0,
      totalQuestions: 1, // Will be updated by specific games
      correctAnswers: 0,
      mistakes: 0,
      hints: 0,
      retries: 0,
      responseTimes: [],
      completed: false
    });
  }, [game, difficulty, navigate]);

  const handleComplete = (result: {
    score: number;
    accuracy: number;
    averageResponseTime: number;
    mistakes: number;
    hints: number;
    retries: number;
  }) => {
    if (!session) return;

    // Generate standard GameAttempt telemetry
    const attempt: GameAttempt = {
      id: crypto.randomUUID(),
      userId: session.patientId,
      gameId: session.gameId,
      domain: session.domain,
      difficulty: session.difficulty,
      score: result.score,
      accuracy: result.accuracy,
      responseTime: result.averageResponseTime,
      mistakes: result.mistakes,
      hints: result.hints,
      retries: result.retries,
      completed: true,
      timestamp: new Date().toISOString()
    };

    // Record Telemetry
    TelemetryService.recordAttempt(attempt);

    // Update Session State for UI rendering
    setSession(prev => prev ? {
      ...prev,
      ...result,
      completed: true
    } : null);

    setIsCompleted(true);
  };

  if (!session) {
    return <div className="p-8 text-center text-xl text-text-charcoal/60">{t('common.loading')}</div>;
  }

  if (isCompleted) {
    return <GameResult session={session} onContinue={() => navigate('/patient/games')} />;
  }

// Render specific game logic based on domain
  const renderGameLogic = () => {
    const commonProps = {
      difficulty,
      onComplete: handleComplete
    };

    switch (game.domain as any) {
      case 'memory': return <MemoryGame {...commonProps} />;
      case 'attention': return <AttentionGame {...commonProps} />;
      case 'pattern': return <PatternGame {...commonProps} />;
      case 'spatial': return <SpatialGame {...commonProps} />;
      case 'route_recall': return <RouteRecallGame {...commonProps} routeId={game.id} />;
      case 'personal_person': return <WhoIsThisGame {...commonProps} />;
      case 'personal_memory': return <MemoryMomentsGame {...commonProps} />;
      case 'personal_timeline': return <LifeStoryGame {...commonProps} />;
      case 'personal_song': return <FavoriteSongGame {...commonProps} />;
      case 'personal_history': return <HistoryGame {...commonProps} />;
      default: return <div className="p-8 text-red-500">Unknown game domain: {game.domain}</div>;
    }
  };

  const translatedName = t(game.titleKey, game.name);
  const displayInst = t(game.instructionsKey, game.instructions);

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-primary-teal mb-2">{translatedName}</h2>
        <p className="text-xl text-text-charcoal/80">{displayInst}</p>
      </div>
      
      <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center">
        {renderGameLogic()}
      </div>
    </div>
  );
};
