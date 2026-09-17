import { TelemetryService } from '../telemetry/TelemetryService';
import { ActivityInsightEngineInstance } from '../ai/ActivityInsightEngine';
import type { ActivityInsight } from '../../types';

class ActivityInsightServiceClass {
  private readonly DOMAINS = ['memory', 'attention', 'pattern', 'spatial', 'route_recall'];

  /**
   * Generates insights for all domains for a given patient.
   */
  public getDomainInsights(patientId: string): ActivityInsight[] {
    const allAttempts = TelemetryService.getAllAttempts().filter(a => a.userId === patientId && a.completed && !a.gameId.includes('baseline'));
    
    return this.DOMAINS.map(domain => {
      const domainHistory = allAttempts.filter(a => a.domain === domain);
      return ActivityInsightEngineInstance.analyze(patientId, domain, domainHistory);
    });
  }
}

export const ActivityInsightService = new ActivityInsightServiceClass();
