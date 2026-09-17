import type { BaselineSession, BaselineDomainResult, GameAttempt } from '../../types';
import { StorageService } from '../storage/local';

const BASELINE_KEY = 'calm_intelligence_baseline_session';

export const BaselineService = {
  getSession(): BaselineSession | null {
    return StorageService.get<BaselineSession>(BASELINE_KEY);
  },

  startSession(patientId: string): BaselineSession {
    const session: BaselineSession = {
      id: crypto.randomUUID(),
      patientId,
      startedAt: new Date().toISOString(),
      domains: []
    };
    StorageService.set(BASELINE_KEY, session);
    return session;
  },

  addDomainResult(domainResult: BaselineDomainResult): BaselineSession | null {
    const session = this.getSession();
    if (!session) return null;

    // Filter out previous result for the same domain if exists
    const updatedDomains = session.domains.filter(d => d.domain !== domainResult.domain);
    updatedDomains.push(domainResult);

    session.domains = updatedDomains;
    StorageService.set(BASELINE_KEY, session);
    return session;
  },

  completeSession(): BaselineSession | null {
    const session = this.getSession();
    if (!session) return null;

    session.completedAt = new Date().toISOString();
    
    // Calculate simple average for baseline proxy (Not a diagnostic score)
    if (session.domains.length > 0) {
      const totalScore = session.domains.reduce((acc, curr) => acc + curr.score, 0);
      session.overallScore = totalScore / session.domains.length;
    }

    StorageService.set(BASELINE_KEY, session);
    return session;
  },

  calculateDomainScoreFromAttempt(attempt: GameAttempt): number {
    // Simple mock logic to generate a normalized [0, 1] baseline score from an attempt
    // In the real system, this would be handled by the backend/ML engine
    let score = attempt.score / 100; // Assuming attempt.score is 0-100
    if (attempt.accuracy) {
        score = (score + attempt.accuracy / 100) / 2;
    }
    // ensure within 0 and 1
    return Math.max(0, Math.min(1, score));
  },
  
  clearSession(): void {
    StorageService.remove(BASELINE_KEY);
  }
};
