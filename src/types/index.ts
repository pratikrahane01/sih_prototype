export interface BaselineDomainResult {
  domain: string;
  score: number;
  accuracy: number;
  responseTime: number;
  mistakes: number;
  completed: boolean;
}

export interface BaselineSession {
  id: string;
  patientId: string;
  startedAt: string; // ISO String
  completedAt?: string; // ISO String
  domains: BaselineDomainResult[];
  overallScore?: number;
  notes?: string;
}

export interface ImportantPerson {
  name: string;
  relationship: string;
}

export interface Person {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  image?: string;
  description?: string;
  createdAt: string; // ISO String
}
export type SupportedLanguageCode = 'en' | 'hi' | 'as' | 'mr';

export interface SupportedLanguage {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  speechRecognitionSupported: boolean;
  speechSynthesisSupported: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  language: SupportedLanguageCode | string;
  region: string;
  caregiverId: string;
  
  // Extended Personalization Information
  nickname?: string;
  favoriteActivities?: string[];
  favoriteColors?: string[];
  importantPeople?: ImportantPerson[];
  
  // Preferences
  activityDurationPreference?: number; // minutes
  preferredTime?: string; // Morning, Afternoon, Evening
  voiceMode?: boolean; // Voice interaction ON/OFF
  
  // Baseline
  baselineProfile?: Record<string, number>; // Domain -> Score mapping
}

export type RoutineCategory = 'Morning' | 'Meals' | 'Medicine' | 'Activity' | 'Rest' | 'Family' | 'Evening';

export interface RoutineItem {
  id: string;
  patientId: string;
  title: string;
  time: string; // e.g. "07:30" or "08:30 AM"
  category: RoutineCategory;
  completed: boolean;
  reminderEnabled: boolean;
  description?: string;
  createdAt: string; // ISO String
}

export interface DietPreference {
  patientId: string;
  preferredFoods: string[];
  foodsToAvoid: string[];
  mealNotes: string;
  updatedAt: string; // ISO String
}

export interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  contact: string;
}

export interface GameDefinition {
  id: string;
  name: string;
  titleKey: string;
  descriptionKey: string;
  instructionsKey: string;
  category: 'personalized' | 'general';
  domain: string;
  description: string;
  baseDifficulty: number;
  icon: string;
  poster?: string;
  estimatedDuration: string;
  instructions: string;
}

export interface GameSession {
  sessionId: string;
  patientId: string;
  gameId: string;
  domain: string;
  difficulty: number;
  startedAt: string; // ISO String
  questionIndex: number;
  totalQuestions: number;
  correctAnswers: number;
  mistakes: number;
  hints: number;
  retries: number;
  responseTimes: number[];
  completed: boolean;
  score?: number;
  accuracy?: number;
  averageResponseTime?: number;
}

export interface GameAttempt {
  id: string;
  userId: string;
  gameId: string;
  difficulty: number;
  score: number;
  accuracy: number;
  responseTime: number;
  mistakes: number;
  hints: number;
  retries: number;
  completed: boolean;
  timestamp: string; // ISO String
  domain: string;
}

export interface GameRecommendation {
  userId: string;
  gameId: string;
  recommendedDifficulty: number;
  modelVersion: string;
  confidence: number;
  timestamp: string; // ISO String
}

export type MemoryCategory = 'All' | 'Family' | 'Childhood' | 'Marriage' | 'Friends' | 'Places' | 'Travel' | 'Important Moments' | 'person' | 'object' | 'place' | 'routine' | 'activity' | 'appointment' | 'preference';

export type MemoryType = 'PERSON' | 'PLACE' | 'EVENT' | 'OBJECT' | 'ROUTINE' | 'SONG' | 'CHILDHOOD' | 'FAMILY';

export interface PersonalMemory {
  id: string;
  patientId: string;
  type?: MemoryType;
  category: MemoryCategory;
  title: string;
  content: string; // description
  year?: string;
  location?: string;
  image?: string;
  audioUrl?: string;
  personIds?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface RouteLocation {
  id: string;
  name: string;
  description?: string;
  order: number;
  landmark?: string;
  image?: string;
  direction?: string;
}

export interface FamiliarRoute {
  id: string;
  patientId: string;
  name: string;
  description: string;
  locations: RouteLocation[];
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export type ActivityPatternStatus = 'stable' | 'watch' | 'notable_change' | 'insufficient_data';
export type TrendDirection = 'improving' | 'stable' | 'variable' | 'declining_activity_performance';

export interface ActivityInsight {
  patientId: string;
  domain: string;
  status: ActivityPatternStatus;
  accuracyTrend: TrendDirection;
  responseTimeTrend: TrendDirection;
  mistakeTrend: TrendDirection;
  baselineAccuracy: number | null;
  recentAccuracy: number | null;
  baselineResponseTime: number | null;
  recentResponseTime: number | null;
  changeDetected: boolean;
  explanation: string;
  dataSufficient: boolean;
  generatedAt: string; // ISO String
}
