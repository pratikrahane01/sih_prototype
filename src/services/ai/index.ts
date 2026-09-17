import type { GameRecommendation } from '../../types';
import { TelemetryService } from '../telemetry/TelemetryService';
import { PatientService } from '../api/PatientService';

class AdaptiveEngineClass {
  private readonly MAX_DIFFICULTY = 5;
  private readonly MIN_DIFFICULTY = 1;

  /**
   * Evaluates the patient's recent game attempt history and provides a recommendation
   * for the next activity's optimal difficulty level.
   */
  public async getRecommendedDifficulty(patientId: string, domain: string, gameId: string): Promise<GameRecommendation> {
    // Artificial delay to show "Personalizing..." UI state
    await new Promise(resolve => setTimeout(resolve, 800));

    const history = TelemetryService.getAllAttempts().filter(
      a => a.userId === patientId && a.domain === domain && a.completed
    );

    let recommendedDifficulty = this.MIN_DIFFICULTY;

    if (history.length === 0) {
      // Fallback to baseline profile if no history exists
      const profile = PatientService.getProfile();
      if (profile?.baselineProfile && profile.baselineProfile[domain]) {
        const baselineScore = profile.baselineProfile[domain];
        if (baselineScore >= 80) recommendedDifficulty = 2;
        else recommendedDifficulty = 1;
      }
    } else {
      // Feature Extraction Pipeline
      // Sort by timestamp descending
      const recentAttempts = history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 3);
      
      const averageAccuracy = recentAttempts.reduce((sum, a) => sum + a.accuracy, 0) / recentAttempts.length;
      const totalMistakes = recentAttempts.reduce((sum, a) => sum + a.mistakes, 0);
      const currentAvgDifficulty = recentAttempts.reduce((sum, a) => sum + a.difficulty, 0) / recentAttempts.length;

      // Heuristic "ML" Competency Model
      // High accuracy and low mistakes indicate high competency
      const accuracyWeight = 0.7;
      const mistakePenalty = totalMistakes * 5; // -5% per mistake in the rolling window

      const competencyScore = (averageAccuracy * accuracyWeight) - mistakePenalty;

      // Adjust difficulty based on competency score thresholds
      let targetDifficulty = Math.round(currentAvgDifficulty);

      if (competencyScore > 65) {
        // Too easy, increase challenge
        targetDifficulty += 1;
      } else if (competencyScore < 40) {
        // Too hard, decrease challenge
        targetDifficulty -= 1;
      }

      // Constrain within valid bounds
      recommendedDifficulty = Math.max(this.MIN_DIFFICULTY, Math.min(targetDifficulty, this.MAX_DIFFICULTY));
    }

    return {
      userId: patientId,
      gameId,
      recommendedDifficulty,
      modelVersion: 'heuristic-v1.0',
      confidence: 0.90,
      timestamp: new Date().toISOString()
    };
  }
}

export const AdaptiveEngine = new AdaptiveEngineClass();
export * from './AssistantService';
export * from './IntentService';
export * from './ActivityInsightEngine';
