/**
 * DemoDataService.ts
 *
 * Provides clearly-labeled fictional demo data for SIH live demonstration purposes.
 * DO NOT use real personal data. This data is for prototype demonstration ONLY.
 *
 * - Populates a fictional patient: Anita Sharma (DEMO PATIENT)
 * - Populates fictional personal memories
 * - Populates a fictional familiar route
 * - Populates fictional activity history (internally consistent)
 *
 * Demo data is stored under the key 'demo_patient_id' and uses the
 * same per-patient isolation model as real data.
 */

import type { Patient, GameAttempt, PersonalMemory, FamiliarRoute } from '../../types';
import { PatientService } from './PatientService';
import { MemoryService } from './MemoryService';
import { RouteService } from './RouteService';
import { TelemetryService } from '../telemetry/TelemetryService';
import { StorageService } from '../storage/local';

const DEMO_FLAG_KEY = 'calm_intelligence_demo_loaded';
const DEMO_PATIENT_ID = 'demo-patient-anita-sharma';

// Reusable helper to generate timestamps spread over the last 30 days
const pastDate = (daysAgo: number, hourOffset = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hourOffset);
  return d.toISOString();
};

// --- DEMO PATIENT PROFILE ---
const DEMO_PATIENT: Patient = {
  id: DEMO_PATIENT_ID,
  name: 'Anita Sharma',
  age: 72,
  language: 'as',
  region: 'NER',
  caregiverId: 'demo-caregiver-001',
  nickname: 'Nani',
  favoriteActivities: ['Gardening', 'Reading', 'Listening to music'],
  favoriteColors: ['Green', 'Blue'],
  importantPeople: [
    { name: 'Priya', relationship: 'Daughter' },
    { name: 'Rajan', relationship: 'Son-in-law' },
    { name: 'Dr. Mehta', relationship: 'Family Doctor' }
  ],
  activityDurationPreference: 10,
  preferredTime: 'Morning',
  voiceMode: true,
  baselineProfile: {
    memory: 65,
    attention: 70,
    pattern: 60,
    spatial: 55
  }
};

// --- DEMO PERSONAL MEMORIES ---
const DEMO_MEMORIES: Omit<PersonalMemory, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    patientId: DEMO_PATIENT_ID,
    title: 'Glasses',
    content: 'Kept on the bedside table',
    category: 'object'
  },
  {
    patientId: DEMO_PATIENT_ID,
    title: 'Priya',
    content: 'Priya is your daughter. She visits every Sunday and lives nearby in Guwahati.',
    category: 'person'
  },
  {
    patientId: DEMO_PATIENT_ID,
    title: 'Dr. Mehta',
    content: "Your doctor's clinic is near the main market, open from 9 AM to 5 PM on weekdays.",
    category: 'place'
  },
  {
    patientId: DEMO_PATIENT_ID,
    title: 'Morning Routine',
    content: 'Wake up at 7 AM, have warm milk with your morning medicine (white tablet), then go for a short walk in the garden before breakfast.',
    category: 'routine'
  },
  {
    patientId: DEMO_PATIENT_ID,
    title: 'House Keys',
    content: 'Kept on the hook near the front door',
    category: 'object'
  },
  {
    patientId: DEMO_PATIENT_ID,
    title: 'Pharmacy',
    content: 'Sri Medicals pharmacy is at the end of Main Street, two shops after the post office.',
    category: 'place'
  }
];

// --- DEMO FAMILIAR ROUTE ---
const DEMO_ROUTE: Omit<FamiliarRoute, 'id' | 'createdAt' | 'updatedAt'> = {
  patientId: DEMO_PATIENT_ID,
  name: 'Home to Pharmacy',
  description: 'Daily morning walk route',
  locations: [
    { id: 'loc-1', name: 'Home', description: 'Starting from your house', order: 0 },
    { id: 'loc-2', name: 'Bus Stop', description: 'The bus stop near the neem tree', order: 1 },
    { id: 'loc-3', name: 'Main Market', description: 'The busy market square', order: 2 },
    { id: 'loc-4', name: 'Pharmacy', description: 'Sri Medicals at the end of Main Street', order: 3 }
  ]
};

// --- DEMO ACTIVITY HISTORY ---
// 14 attempts spread over 30 days to produce meaningful Insight Engine output
// Shows gradual progression with a slight attention variation in recent attempts
const buildDemoAttempts = (): GameAttempt[] => {
  const attempts: GameAttempt[] = [];
  let counter = 1;

  const add = (
    domain: string,
    gameId: string,
    daysAgo: number,
    difficulty: number,
    accuracy: number,
    responseTime: number,
    score: number
  ) => {
    attempts.push({
      id: `demo-attempt-${counter++}`,
      userId: DEMO_PATIENT_ID,
      gameId,
      domain,
      difficulty,
      score,
      accuracy,
      responseTime,
      mistakes: Math.floor((1 - accuracy) * 5),
      hints: 0,
      retries: 0,
      completed: true,
      timestamp: pastDate(daysAgo)
    });
  };

  // Memory domain (stable pattern, 12 attempts)
  add('memory', 'memory-match-pairs', 28, 1, 0.60, 4200, 60);
  add('memory', 'memory-match-pairs', 26, 1, 0.65, 4000, 65);
  add('memory', 'memory-match-pairs', 22, 2, 0.70, 3800, 70);
  add('memory', 'memory-match-pairs', 20, 2, 0.72, 3700, 72);
  add('memory', 'memory-match-pairs', 17, 2, 0.75, 3500, 75);
  add('memory', 'memory-match-pairs', 14, 2, 0.73, 3600, 73);
  add('memory', 'memory-match-pairs', 11, 2, 0.76, 3400, 76);
  add('memory', 'memory-match-pairs', 9, 3, 0.78, 3200, 78);
  add('memory', 'memory-match-pairs', 7, 3, 0.77, 3300, 77);
  add('memory', 'memory-match-pairs', 5, 3, 0.80, 3100, 80);
  add('memory', 'memory-match-pairs', 3, 3, 0.79, 3100, 79);
  add('memory', 'memory-match-pairs', 1, 3, 0.81, 3000, 81);

  // Attention domain (shows slight recent variation for demo interest)
  add('attention', 'color-match-focus', 27, 1, 0.72, 3100, 72);
  add('attention', 'color-match-focus', 24, 1, 0.74, 3000, 74);
  add('attention', 'color-match-focus', 21, 2, 0.78, 2800, 78);
  add('attention', 'color-match-focus', 18, 2, 0.76, 2900, 76);
  add('attention', 'color-match-focus', 15, 2, 0.80, 2700, 80);
  add('attention', 'color-match-focus', 12, 2, 0.79, 2750, 79);
  add('attention', 'color-match-focus', 10, 2, 0.78, 2800, 78);
  add('attention', 'color-match-focus', 8, 2, 0.77, 2850, 77);
  add('attention', 'color-match-focus', 6, 2, 0.64, 3400, 64); // recent dip
  add('attention', 'color-match-focus', 4, 2, 0.62, 3500, 62); // recent dip
  add('attention', 'color-match-focus', 2, 2, 0.63, 3450, 63); // recent dip
  add('attention', 'color-match-focus', 1, 3, 0.65, 3300, 65); // slight recovery

  // Pattern domain (stable)
  add('pattern', 'pattern-completion', 25, 1, 0.68, 3800, 68);
  add('pattern', 'pattern-completion', 23, 1, 0.70, 3600, 70);
  add('pattern', 'pattern-completion', 19, 2, 0.72, 3500, 72);
  add('pattern', 'pattern-completion', 16, 2, 0.74, 3300, 74);
  add('pattern', 'pattern-completion', 13, 2, 0.76, 3200, 76);
  add('pattern', 'pattern-completion', 10, 2, 0.75, 3250, 75);
  add('pattern', 'pattern-completion', 8, 2, 0.77, 3100, 77);
  add('pattern', 'pattern-completion', 6, 2, 0.78, 3000, 78);
  add('pattern', 'pattern-completion', 4, 2, 0.79, 2950, 79);
  add('pattern', 'pattern-completion', 2, 3, 0.80, 2900, 80);

  // Spatial domain (moderate)
  add('spatial', 'spatial-navigation', 26, 1, 0.55, 5200, 55);
  add('spatial', 'spatial-navigation', 24, 1, 0.58, 5000, 58);
  add('spatial', 'spatial-navigation', 20, 1, 0.61, 4800, 61);
  add('spatial', 'spatial-navigation', 18, 2, 0.63, 4600, 63);
  add('spatial', 'spatial-navigation', 15, 2, 0.65, 4400, 65);
  add('spatial', 'spatial-navigation', 12, 2, 0.64, 4450, 64);
  add('spatial', 'spatial-navigation', 9, 2, 0.67, 4300, 67);
  add('spatial', 'spatial-navigation', 7, 2, 0.68, 4200, 68);
  add('spatial', 'spatial-navigation', 5, 2, 0.70, 4100, 70);
  add('spatial', 'spatial-navigation', 3, 2, 0.69, 4150, 69);

  return attempts;
};

class DemoDataServiceClass {
  /**
   * Returns true if demo data has already been loaded.
   */
  public isDemoLoaded(): boolean {
    return StorageService.get<boolean>(DEMO_FLAG_KEY) === true;
  }

  /**
   * Loads the complete demo dataset.
   * This will NOT overwrite existing real patient profiles.
   * It sets the app to use the demo patient profile.
   */
  public loadDemoData(): void {
    // Save demo patient profile (this replaces the active profile for demo)
    PatientService.saveProfile(DEMO_PATIENT);

    // Clear existing memories and routes for the demo patient to avoid duplication
    this.clearDemoPatientData();

    // Add demo memories
    DEMO_MEMORIES.forEach(m => MemoryService.addMemory(m));

    // Add demo route
    RouteService.createRoute(DEMO_ROUTE);

    // Add demo telemetry
    const demoAttempts = buildDemoAttempts();
    const existingAttempts = TelemetryService.getAllAttempts();
    // Remove any existing demo patient attempts to avoid duplication
    const filteredAttempts = existingAttempts.filter(a => a.userId !== DEMO_PATIENT_ID);
    StorageService.set('calm_intelligence_telemetry_attempts', [...filteredAttempts, ...demoAttempts]);

    // Mark demo as loaded
    StorageService.set(DEMO_FLAG_KEY, true);
  }

  /**
   * Resets ONLY demo patient data. Does not touch real patient data.
   */
  public resetDemoData(): void {
    this.clearDemoPatientData();
    StorageService.remove(DEMO_FLAG_KEY);

    // Remove demo telemetry
    const existingAttempts = TelemetryService.getAllAttempts();
    const filteredAttempts = existingAttempts.filter(a => a.userId !== DEMO_PATIENT_ID);
    StorageService.set('calm_intelligence_telemetry_attempts', filteredAttempts);
  }

  private clearDemoPatientData(): void {
    // Memories: remove any with demo patientId
    const allMemories: PersonalMemory[] = StorageService.get<PersonalMemory[]>('sih_patient_memories') || [];
    const filteredMemories = allMemories.filter(m => m.patientId !== DEMO_PATIENT_ID);
    StorageService.set('sih_patient_memories', filteredMemories);

    // Routes: remove any with demo patientId
    const allRoutes: FamiliarRoute[] = StorageService.get<FamiliarRoute[]>('sih_patient_routes') || [];
    const filteredRoutes = allRoutes.filter(r => r.patientId !== DEMO_PATIENT_ID);
    StorageService.set('sih_patient_routes', filteredRoutes);
  }
}

export const DemoDataService = new DemoDataServiceClass();
export { DEMO_PATIENT_ID };
