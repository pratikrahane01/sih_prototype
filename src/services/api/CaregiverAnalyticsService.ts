import { TelemetryService } from '../telemetry/TelemetryService';
import { MemoryService } from './MemoryService';
import { RouteService } from './RouteService';
import { AdaptiveEngine } from '../ai';
import type { GameAttempt } from '../../types';
import { GameRegistry } from '../../data/GameRegistry';

export interface OverviewMetrics {
  activitiesCompleted: number;
  averageAccuracy: number;
  averageResponseTime: number; // in seconds
  averageDifficulty: number;
}

export interface DomainPerformance {
  domain: string;
  averageAccuracy: number;
  attempts: number;
}

export interface AdaptiveRecommendationData {
  previousDifficulty: number;
  recentAccuracy: number;
  recommendedDifficulty: number;
  domain: string;
}

export interface MemoryAssistantStatus {
  savedMemories: number;
  categories: string[];
}

export interface FamiliarRoutesStatus {
  routesConfigured: number;
  lastRouteActivity?: string;
}

class CaregiverAnalyticsServiceClass {
  private getAttempts(patientId: string): GameAttempt[] {
    return TelemetryService.getAllAttempts().filter(a => a.userId === patientId && !a.gameId.includes('baseline') && a.completed);
  }

  public getOverview(patientId: string): OverviewMetrics {
    const attempts = this.getAttempts(patientId);
    
    if (attempts.length === 0) {
      return { activitiesCompleted: 0, averageAccuracy: 0, averageResponseTime: 0, averageDifficulty: 0 };
    }

    const avgAccuracy = attempts.reduce((acc, a) => acc + a.accuracy, 0) / attempts.length;
    const avgResponseTime = attempts.reduce((acc, a) => acc + a.responseTime, 0) / attempts.length;
    const avgDifficulty = attempts.reduce((acc, a) => acc + a.difficulty, 0) / attempts.length;

    return {
      activitiesCompleted: attempts.length,
      averageAccuracy: Math.round(avgAccuracy * 100),
      averageResponseTime: Math.round(avgResponseTime / 1000), // Assuming responseTime is ms
      averageDifficulty: Number(avgDifficulty.toFixed(1))
    };
  }

  public getDomainPerformance(patientId: string): DomainPerformance[] {
    const attempts = this.getAttempts(patientId);
    const domainMap = new Map<string, { accuracySum: number, count: number }>();

    attempts.forEach(a => {
      const current = domainMap.get(a.domain) || { accuracySum: 0, count: 0 };
      domainMap.set(a.domain, {
        accuracySum: current.accuracySum + a.accuracy,
        count: current.count + 1
      });
    });

    const results: DomainPerformance[] = [];
    domainMap.forEach((data, domain) => {
      results.push({
        domain,
        averageAccuracy: Math.round((data.accuracySum / data.count) * 100),
        attempts: data.count
      });
    });

    return results;
  }

  public getRecentActivities(patientId: string, limit: number = 5): GameAttempt[] {
    const attempts = this.getAttempts(patientId);
    return attempts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public async getLatestAdaptiveRecommendation(patientId: string): Promise<AdaptiveRecommendationData | null> {
    const recentActivities = this.getRecentActivities(patientId, 1);
    if (recentActivities.length === 0) return null;

    const latest = recentActivities[0];
    
    // Fetch recommendation from AdaptiveEngine
    // Note: AdaptiveEngine expects gameId, which is mostly mapped in GameRegistry or is the routeId.
    const recommendation = await AdaptiveEngine.getRecommendedDifficulty(patientId, latest.domain, latest.gameId);

    return {
      previousDifficulty: latest.difficulty,
      recentAccuracy: Math.round(latest.accuracy * 100),
      recommendedDifficulty: recommendation.recommendedDifficulty,
      domain: latest.domain
    };
  }

  public getDifficultyHistory(patientId: string, domain?: string): { timestamp: string, difficulty: number }[] {
    let attempts = this.getAttempts(patientId);
    if (domain) {
      attempts = attempts.filter(a => a.domain === domain);
    }

    return attempts
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(a => ({
        timestamp: a.timestamp,
        difficulty: a.difficulty
      }));
  }

  public getPerformanceTrend(patientId: string): { timestamp: string, accuracy: number }[] {
    const attempts = this.getAttempts(patientId);
    return attempts
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(a => ({
        timestamp: a.timestamp,
        accuracy: Math.round(a.accuracy * 100)
      }));
  }

  public getMemoryAssistantStatus(patientId: string): MemoryAssistantStatus {
    const memories = MemoryService.getPatientMemories(patientId);
    const categories = new Set(memories.map(m => m.category));
    
    return {
      savedMemories: memories.length,
      categories: Array.from(categories)
    };
  }

  public getFamiliarRoutesStatus(patientId: string): FamiliarRoutesStatus {
    const routes = RouteService.getPatientRoutes(patientId);
    const attempts = this.getAttempts(patientId).filter(a => a.domain === 'route_recall');
    
    let lastRouteName = undefined;
    if (attempts.length > 0) {
      // Game ID for route recall is the route ID
      const latestAttempt = attempts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      const route = routes.find(r => r.id === latestAttempt.gameId);
      if (route) {
        lastRouteName = route.name;
      } else {
        lastRouteName = 'Unknown Route';
      }
    }

    return {
      routesConfigured: routes.length,
      lastRouteActivity: lastRouteName
    };
  }

  public getGameName(gameId: string, domain: string): string {
    if (domain === 'route_recall') {
      const r = RouteService.getRoute(gameId);
      return r ? r.name : 'Familiar Route';
    }
    const def = GameRegistry.find(g => g.id === gameId);
    return def ? def.name : 'Activity';
  }
}

export const CaregiverAnalyticsService = new CaregiverAnalyticsServiceClass();
