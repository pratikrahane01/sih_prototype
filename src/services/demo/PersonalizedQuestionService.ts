/**
 * PersonalizedQuestionService.ts
 * ================================
 * Generates structured question objects for the four personalized memory games.
 *
 * Architecture:
 *   Caregiver Dashboard → MemoryService (localStorage) → this service → Game Components
 *
 * Fallback:
 *   If caregiver data is empty, DemoMemoryData is used automatically so the
 *   prototype always has content to display.
 *
 * This module is intentionally stateless and ML/LLM-ready:
 *   - Replace the distractor logic with an AI call to get semantic distractors.
 *   - Replace year parsing with a proper timeline model.
 *   - Replace song matching with an audio-fingerprint API call.
 */

import { MemoryService } from '../api/MemoryService';
import {
  DEMO_PEOPLE,
  DEMO_MEMORIES,
  DEMO_PATIENT_ID,
  DISTRACTOR_NAMES,
  DISTRACTOR_RELS,
  DISTRACTOR_PLACES,
  DISTRACTOR_SONGS,
  type DemoPerson,
  type DemoMemory
} from './DemoMemoryData';
import type { Person, PersonalMemory } from '../../types';

// ── Utility ────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickDistractors(pool: string[], exclude: string, n: number): string[] {
  const filtered = pool.filter(d => d !== exclude);
  const result: string[] = [];
  const shuffled = shuffle(filtered);
  for (const item of shuffled) {
    if (result.length >= n) break;
    if (!result.includes(item)) result.push(item);
  }
  return result;
}

/** Parses a year string like "1982", "1960s", "late 1970s" → number */
function parseYear(yearStr: string): number {
  const m = yearStr.match(/\d{4}/);
  if (m) return parseInt(m[0]);
  const decm = yearStr.match(/\d{3}/); // "196" in "1960s"
  if (decm) return parseInt(decm[0]) * 10;
  return 0;
}

// ── Data Access Helpers ────────────────────────────────────────────────────────

/**
 * Returns caregiver-entered people for this patient, or falls back to demo data.
 */
function getEffectivePeople(patientId: string): (Person | DemoPerson)[] {
  const caregiverPeople = MemoryService.getPatientPeople(patientId);
  if (caregiverPeople.length > 0) return caregiverPeople;
  return DEMO_PEOPLE.filter(p => p.patientId === DEMO_PATIENT_ID);
}

/**
 * Returns caregiver-entered memories for this patient, or falls back to demo data.
 */
function getEffectiveMemories(patientId: string): (PersonalMemory | DemoMemory)[] {
  const caregiverMems = MemoryService.getPatientMemories(patientId);
  if (caregiverMems.length > 0) return caregiverMems;
  return DEMO_MEMORIES.filter(m => m.patientId === DEMO_PATIENT_ID);
}

// ── Question Types ─────────────────────────────────────────────────────────────

export interface PersonQuestion {
  person: Person | DemoPerson;
  questionType: 'name' | 'relationship';
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface MomentQuestion {
  memory: PersonalMemory | DemoMemory;
  questionType: 'where' | 'when';
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface LifeStoryQuestion {
  memories: (PersonalMemory | DemoMemory)[];
  correctAnswer: PersonalMemory | DemoMemory;
  questionText: string;
}

export interface SongQuestion {
  song: PersonalMemory | DemoMemory;
  options: string[];
  correctAnswer: string;
  voiceQuestion: string;
  voiceHint: string;
  keywords: string[];
}

// ── Question Generators ────────────────────────────────────────────────────────

/**
 * GAME 1: "Who Is This?"
 * Shows a person's face and asks either their name or their relationship.
 * - Easy:   3 questions, name-only, obvious distractors
 * - Medium: 4 questions, mix name/relationship
 * - Hard:   5 questions, relationship-only, similar distractors
 */
export function generateWhoIsThisQuestions(
  patientId: string,
  difficulty: number
): PersonQuestion[] {
  const people = getEffectivePeople(patientId);
  if (people.length === 0) return [];

  const numQ = difficulty === 1 ? Math.min(3, people.length)
             : difficulty === 2 ? Math.min(4, people.length)
             : Math.min(5, people.length);

  const selected = shuffle(people).slice(0, numQ);

  return selected.map(person => {
    // Easy → ask name; Hard → ask relationship; Medium → random
    const askName = difficulty === 1 ? true
                  : difficulty === 3 ? false
                  : Math.random() > 0.5;

    const correctAnswer = askName ? person.name : person.relationship;
    const questionText  = askName
      ? "Who is this person?"
      : "What is your relationship with this person?";

    // Build distractors from other people + fixed pool
    const otherPeople = people.filter(p => p.id !== person.id);
    const peerValues  = askName
      ? otherPeople.map(p => p.name)
      : otherPeople.map(p => p.relationship);

    const fallbackPool = askName ? DISTRACTOR_NAMES : DISTRACTOR_RELS;
    const distractors  = pickDistractors(
      [...peerValues, ...fallbackPool],
      correctAnswer,
      3
    );

    return {
      person,
      questionType: askName ? 'name' : 'relationship',
      questionText,
      options: shuffle([correctAnswer, ...distractors]),
      correctAnswer
    };
  });
}

/**
 * GAME 2: "Memory Moments"
 * Shows a memory for a study phase, then asks where or when it happened.
 * - Easy:   3 questions, only "where" (location)
 * - Medium: 4 questions, mix "where" and "when"
 * - Hard:   5 questions, "when" + location details
 */
export function generateMemoryMomentsQuestions(
  patientId: string,
  difficulty: number
): MomentQuestion[] {
  const allMemories = getEffectiveMemories(patientId);
  // Need memories that are events / childhood / place AND have location OR year
  const memories = allMemories.filter(m =>
    (m.type === 'EVENT' || m.type === 'CHILDHOOD' || m.type === 'PLACE' || m.type === 'FAMILY') &&
    (m.location || m.year)
  );

  if (memories.length === 0) return [];

  const numQ = difficulty === 1 ? Math.min(3, memories.length)
             : difficulty === 2 ? Math.min(4, memories.length)
             : Math.min(5, memories.length);

  const selected = shuffle(memories).slice(0, numQ);

  return selected.map(memory => {
    const canWhere = !!memory.location;
    const canWhen  = !!memory.year;

    // Easy → always ask where; Hard → prefer when; Medium → random
    let askWhere = canWhere;
    if (canWhere && canWhen) {
      askWhere = difficulty === 1 ? true
               : difficulty === 3 ? false
               : Math.random() > 0.5;
    } else if (!canWhere) {
      askWhere = false;
    }

    let correctAnswer: string;
    let questionText: string;
    let distractors: string[];

    if (askWhere) {
      correctAnswer = memory.location!;
      questionText  = "Where did this memory take place?";
      // Use known NE Indian locations as distractors
      const knownLocations = allMemories
        .filter(m => m.location && m.location !== correctAnswer)
        .map(m => m.location!);
      distractors = pickDistractors(
        [...knownLocations, ...DISTRACTOR_PLACES],
        correctAnswer,
        3
      );
    } else {
      correctAnswer = memory.year!;
      questionText  = "When did this memory happen?";
      // Generate nearby year distractors
      const yr = parseYear(correctAnswer);
      const candidates = [
        `${yr - 10}`,
        `${yr + 10}`,
        `${yr - 20}`,
        `${yr + 5}`,
        '1970s',
        '1960s',
        '2000s',
        '1990s'
      ].filter(d => d !== correctAnswer);
      distractors = pickDistractors(candidates, correctAnswer, 3);
    }

    return {
      memory,
      questionType: askWhere ? 'where' : 'when',
      questionText,
      options: shuffle([correctAnswer, ...distractors]),
      correctAnswer
    };
  });
}

/**
 * GAME 3: "My Life Story"
 * Shows N event cards and asks which happened first.
 * - Easy:   2 cards (very clear difference)
 * - Medium: 3 cards
 * - Hard:   4 cards
 */
export function generateLifeStoryQuestions(
  patientId: string,
  difficulty: number
): LifeStoryQuestion[] {
  const allMemories = getEffectiveMemories(patientId);
  // Only memories with a parseable year
  const memories = allMemories
    .filter(m => m.year && parseYear(m.year) > 0)
    .map(m => ({ ...m, parsedYear: parseYear(m.year!) }))
    .sort((a, b) => a.parsedYear - b.parsedYear);

  // Need at least 2 memories with years
  if (memories.length < 2) return [];

  const cardsPerQ = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;
  const numQ = Math.min(3, Math.floor(memories.length / 2));

  const questions: LifeStoryQuestion[] = [];

  for (let i = 0; i < numQ; i++) {
    // Pick `cardsPerQ` diverse memories (spread across timeline)
    const pool = shuffle(memories).slice(0, Math.min(cardsPerQ, memories.length));
    const sorted = [...pool].sort((a, b) => a.parsedYear - b.parsedYear);
    const correctAnswer = sorted[0]; // The earliest one

    questions.push({
      memories: shuffle(pool),  // Shuffle display order
      correctAnswer,
      questionText: "Which of these happened first?"
    });
  }

  return questions;
}

/**
 * GAME 4: "My Favorite Song"
 * Asks the patient to identify a familiar song by name.
 * - The demo song is "Lag Ja Gale".
 * - Distractors are other song titles from DISTRACTOR_SONGS.
 */
export function generateFavoriteSongQuestions(
  patientId: string,
  difficulty: number
): SongQuestion[] {
  const allMemories = getEffectiveMemories(patientId);
  let songs = allMemories.filter(m => m.type === 'SONG');

  // Fallback: If caregiver hasn't added any songs specifically, use the top 5 regional demo songs.
  if (songs.length === 0) {
    songs = DEMO_MEMORIES.filter(m => m.type === 'SONG');
  }

  if (songs.length === 0) return [];

  const numQ = difficulty === 1 ? Math.min(3, songs.length)
             : difficulty === 2 ? Math.min(4, songs.length)
             : Math.min(5, songs.length);

  const selected = shuffle(songs).slice(0, numQ);

  return selected.map(song => {
    let metadata: any = {};
    try {
      metadata = JSON.parse(song.content);
    } catch(e) {
      metadata = { singer: 'Unknown', movie: 'Unknown', hint: 'Listen carefully to the melody.' };
    }

    const isAskSinger = metadata.singer && metadata.singer !== 'Unknown' && Math.random() > 0.5;
    
    const correctAnswer = isAskSinger ? metadata.singer : song.title;
    
    // Voice prompt questions
    const voiceQuestion = isAskSinger 
      ? "Who sang this beautiful song?" 
      : "Can you tell me the name of this song?";
      
    const voiceHint = metadata.hint || "Try to remember the melody.";
    
    // Basic keywords for loose speech matching
    const keywords = correctAnswer.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter((w: string) => w.length > 2);
    keywords.push(correctAnswer.toLowerCase());

    const otherOptions = songs
      .filter(s => s.id !== song.id)
      .map(s => {
         try {
           const meta = JSON.parse(s.content);
           return isAskSinger ? meta.singer : s.title;
         } catch (e) {
           return s.title;
         }
      });

    const distractors = pickDistractors(
      [...otherOptions, ...DISTRACTOR_SONGS],
      correctAnswer,
      3
    );

    return {
      song,
      options: shuffle([correctAnswer, ...distractors]),
      correctAnswer,
      voiceQuestion,
      voiceHint,
      keywords
    };
  });
}
