import type { GameAttempt, ActivityInsight, ActivityPatternStatus, TrendDirection } from '../../types';

export interface IActivityInsightEngine {
  analyze(patientId: string, domain: string, history: GameAttempt[]): ActivityInsight;
}

export class RuleBasedActivityInsightEngine implements IActivityInsightEngine {
  // Configurable thresholds and window sizes
  private readonly MIN_REQUIRED_ATTEMPTS = 10;
  private readonly RECENT_WINDOW_SIZE = 5;
  // Baseline is everything before the recent window
  
  // Thresholds for change detection
  private readonly ACCURACY_DROP_THRESHOLD = 0.15; // 15% drop
  private readonly RESPONSE_TIME_INCREASE_THRESHOLD = 1.3; // 30% increase

  public analyze(patientId: string, domain: string, history: GameAttempt[]): ActivityInsight {
    const sortedAttempts = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Default insight for insufficient data
    if (sortedAttempts.length < this.MIN_REQUIRED_ATTEMPTS) {
      return {
        patientId,
        domain,
        status: 'insufficient_data',
        accuracyTrend: 'stable',
        responseTimeTrend: 'stable',
        mistakeTrend: 'stable',
        baselineAccuracy: null,
        recentAccuracy: null,
        baselineResponseTime: null,
        recentResponseTime: null,
        changeDetected: false,
        explanation: sortedAttempts.length < this.RECENT_WINDOW_SIZE ? 
          "Not enough activity data." : "Early activity pattern.",
        dataSufficient: false,
        generatedAt: new Date().toISOString()
      };
    }

    const recentWindow = sortedAttempts.slice(-this.RECENT_WINDOW_SIZE);
    const baselineWindow = sortedAttempts.slice(0, -this.RECENT_WINDOW_SIZE);

    // Baseline Aggregations
    const baselineAccuracy = this.avg(baselineWindow.map(a => a.accuracy));
    const baselineResponseTime = this.avg(baselineWindow.map(a => a.responseTime));
    const baselineMistakes = this.avg(baselineWindow.map(a => a.mistakes));

    // Recent Aggregations
    const recentAccuracy = this.avg(recentWindow.map(a => a.accuracy));
    const recentResponseTime = this.avg(recentWindow.map(a => a.responseTime));
    const recentMistakes = this.avg(recentWindow.map(a => a.mistakes));

    // Deltas
    const accuracyDelta = recentAccuracy - baselineAccuracy; // Negative means drop
    const responseTimeRatio = baselineResponseTime > 0 ? recentResponseTime / baselineResponseTime : 1;
    const mistakesRatio = baselineMistakes > 0 ? recentMistakes / baselineMistakes : (recentMistakes > 0 ? 2 : 1);

    // Status Determination
    let status: ActivityPatternStatus = 'stable';
    let explanation = "Performance remains broadly consistent with personal history.";
    let changeDetected = false;

    if (accuracyDelta <= -this.ACCURACY_DROP_THRESHOLD || responseTimeRatio >= this.RESPONSE_TIME_INCREASE_THRESHOLD) {
      status = 'notable_change';
      changeDetected = true;
      
      if (accuracyDelta <= -this.ACCURACY_DROP_THRESHOLD && responseTimeRatio >= this.RESPONSE_TIME_INCREASE_THRESHOLD) {
        explanation = `Recent ${domain.replace('_', ' ')} activity accuracy is lower and response times are higher than the patient's earlier activity history.`;
      } else if (accuracyDelta <= -this.ACCURACY_DROP_THRESHOLD) {
        explanation = `Recent ${domain.replace('_', ' ')} activity accuracy is lower than the patient's earlier activity history.`;
      } else {
        explanation = `Recent ${domain.replace('_', ' ')} response times are higher than the patient's previous activity pattern.`;
      }
    } else if (accuracyDelta <= -(this.ACCURACY_DROP_THRESHOLD / 2) || responseTimeRatio >= 1.15) {
      status = 'watch';
      explanation = "Some variation detected in recent activity performance.";
    }

    // Trend Direction determination
    const accuracyTrend = this.getTrend(accuracyDelta, this.ACCURACY_DROP_THRESHOLD, true);
    const responseTimeTrend = this.getTrend(1 - responseTimeRatio, 0.2, true); // inverted: ratio > 1 means slower, which is negative trend
    const mistakeTrend = this.getTrend(1 - mistakesRatio, 0.5, true);

    return {
      patientId,
      domain,
      status,
      accuracyTrend,
      responseTimeTrend,
      mistakeTrend,
      baselineAccuracy: Math.round(baselineAccuracy * 100),
      recentAccuracy: Math.round(recentAccuracy * 100),
      baselineResponseTime: Math.round(baselineResponseTime / 1000), // to seconds
      recentResponseTime: Math.round(recentResponseTime / 1000),
      changeDetected,
      explanation,
      dataSufficient: true,
      generatedAt: new Date().toISOString()
    };
  }

  private avg(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  private getTrend(delta: number, threshold: number, higherIsBetter: boolean): TrendDirection {
    // For accuracy, higherIsBetter = true. 
    // delta > threshold -> improving
    // delta < -threshold -> declining
    
    if (Math.abs(delta) < threshold / 2) return 'stable';
    
    if (delta > 0) {
      return higherIsBetter ? 'improving' : 'declining_activity_performance';
    } else {
      return higherIsBetter ? 'declining_activity_performance' : 'improving';
    }
  }
}

export const ActivityInsightEngineInstance = new RuleBasedActivityInsightEngine();
