import type { GameAttempt } from '../../types';
import { StorageService } from '../storage/local';

const TELEMETRY_KEY = 'calm_intelligence_telemetry_attempts';

export const TelemetryService = {
  getAllAttempts(): GameAttempt[] {
    return StorageService.get<GameAttempt[]>(TELEMETRY_KEY) || [];
  },

  recordAttempt(attempt: GameAttempt): void {
    const attempts = this.getAllAttempts();
    attempts.push(attempt);
    StorageService.set(TELEMETRY_KEY, attempts);
  },

  getAttemptsByDomain(domain: string): GameAttempt[] {
    const attempts = this.getAllAttempts();
    return attempts.filter(a => a.domain === domain);
  },

  clearTelemetry(): void {
    StorageService.remove(TELEMETRY_KEY);
  }
};
