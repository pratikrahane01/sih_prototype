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
import { LanguageService } from '../accessibility/LanguageService';
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
  voiceQuestion: string;
  voiceHint: string;
  keywords: string[];
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

export interface HistoryQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  voiceQuestion: string;
  voiceHint: string;
  keywords: string[];
}

export interface SongQuestion {
  song: PersonalMemory | DemoMemory;
  options: string[];
  correctAnswer: string;
  voiceQuestion: string;
  voiceHint: string;
  keywords: string[];
}


// ── Localized Terms Helper ───────────────────────────────────────────────────

const LOCALIZED_TERMS: Record<string, Record<string, string>> = {
  // Names
  "Arun": { mr: "अरुण", hi: "अरुण", as: "অৰুণ" },
  "Meena": { mr: "मीना", hi: "मीना", as: "মীনা" },
  "Riya": { mr: "रिया", hi: "रिया", as: "ৰিয়া" },
  "Ramesh": { mr: "रमेश", hi: "रमेश", as: "ৰমেশ" },
  "Sita": { mr: "सीता", hi: "सीता", as: "সীতা" },
  "Rajesh": { mr: "राजेश", hi: "राजेश", as: "ৰাজেশ" },

  // Relationships
  "Son": { mr: "मुलगा", hi: "बेटा", as: "ল'ৰা" },
  "Daughter": { mr: "मुलगी", hi: "बेटी", as: "ছোৱালী" },
  "Grandson": { mr: "नातू", hi: "पोता", as: "নাতি" },
  "Granddaughter": { mr: "नात", hi: "पोती", as: "নাতিনী" },
  "Brother": { mr: "भाऊ", hi: "भाई", as: "ককায়েক" },
  "Sister": { mr: "बहीण", hi: "बहन", as: "ভনীয়েক" },
  "Wife": { mr: "पत्नी", hi: "पत्नी", as: "পত্নী" },
  "Husband": { mr: "पती", hi: "पति", as: "স্বামী" },
  "Friend": { mr: "मित्र", hi: "दोस्त", as: "বন্ধু" },
  "Neighbor": { mr: "शेजारी", hi: "पड़ोसी", as: "চুবুৰীয়া" },

  // Places
  "Pune": { mr: "पुणे", hi: "पुणे", as: "পুনে" },
  "Mumbai": { mr: "मुंबई", hi: "मुंबई", as: "মুম্বাই" },
  "Delhi": { mr: "दिल्ली", hi: "दिल्ली", as: "দিল্লী" },
  "Nashik": { mr: "नाशिक", hi: "नासिक", as: "নাসিক" },
  "Nagpur": { mr: "नागपूर", hi: "नागपुर", as: "নাগপুৰ" },
  "Kolkata": { mr: "कोलकाता", hi: "कोलकाता", as: "কলকাতা" },
  "Guwahati": { mr: "गुवाहाटी", hi: "गुवाहाटी", as: "গুৱাহাটী" },
  "Jorhat": { mr: "जोरहाट", hi: "जोरहाट", as: "যোৰহাট" },

  // Songs
  "Lag Ja Gale": { mr: "लग जा गले", hi: "लग जा गले", as: "লগ জা গলে" },
  "Ajeeb Dastan Hai Yeh": { mr: "अजीब दास्तान है ये", hi: "अजीब दास्तान है ये", as: "অজীব দাস্তান হে য়ে" },
  "O Majhi Re": { mr: "ओ माझी रे", hi: "ओ माझी रे", as: "অ' মাঝি ৰে" },
  "Bistirno Parore": { mr: "बिस्तीर्ण पारोरे", hi: "बिस्तीर्ण पारोरे", as: "বিস্তীৰ্ণ পাৰৰে" },
  "Shukratara Mand Wara": { mr: "शुक्रतारा मंद वारा", hi: "शुक्रतारा मंद वारा", as: "শুক্ৰতাৰা মন্দ ৱাৰা" },
  "Airaneechya Deva Tula": { mr: "ऐरणीच्या देवा तुला", hi: "ऐरणीच्या देवा तुला", as: "এৰনিচ্যা দেৱা তুলা" },
  "Mendichya Panavar": { mr: "मेंदीच्या पानावर", hi: "मेंदीच्या पानावर", as: "মেন্দিচ্যা পানাৱৰ" },
  "Mi Dolkar Daryacha Raja": { mr: "मी डोलकर दर्याचा राजा", hi: "मी डोलकर", as: "মি ডোলকৰ" },
  "Ya Janmavar Ya Jagnyavar Shatada Prem Karave": { mr: "या जन्मावर या जगण्यावर शतदा प्रेम करावे", hi: "या जन्मावर", as: "য়া জন্মাৱৰ" },
  "Kabhi Kabhie Mere Dil Mein": { mr: "कभी कभी मेरे दिल में", hi: "कभी कभी मेरे दिल में", as: "কভি কভি মেৰে দিল মেঁ" },
  "Awara Hoon": { mr: "आवारा हूँ", hi: "आवारा हूँ", as: "আৱাৰা হুঁ" },
  "Pyar Hua Iqrar Hua": { mr: "प्यार हुआ इकरार हुआ", hi: "प्यार हुआ इकरार हुआ", as: "প্যাৰ হুৱা ইকৰাৰ হুৱা" },
  "Suhana Safar Aur Yeh Mausam": { mr: "सुहाना सफर और ये मौसम", hi: "सुहाना सफर और ये मौसम", as: "সুহানা চফৰ ঔৰ য়ে মৌচম" },
  "Manuhe Manuhor Babe": { mr: "मानुहे मानुहोर बाबे", hi: "मानुहे मानुहोर बाबे", as: "মানুহে মানুহৰ বাবে" },
  "Moi Eti Jajabor": { mr: "मोई एटी जाजबोर", hi: "मोई एटी जाजबोर", as: "মই এটি যাযাবৰ" },
  "Buku Hom Hom Kore": { mr: "बुकु होम होम कोरे", hi: "बुकु होम होम कोरे", as: "বুকু হম হম কৰে" },
  "O Bideshi Bandhu": { mr: "ओ बिदेशी बंधू", hi: "ओ बिदेशी बंधू", as: "অ' বিদেশী বন্ধু" },
  "Chhanda Mandal": { mr: "छंद मंडळ", hi: "छंद मंडल", as: "ছন্দ মণ্ডল" },
  "Festival Music": { mr: "उत्सवाचे संगीत", hi: "त्योहार का संगीत", as: "উৎসৱৰ সংগীত" },
  "Raag Bhairavi": { mr: "राग भैरवी", hi: "राग भैरवी", as: "ৰাগ ভৈৰৱী" },


  // History & Weapons
  "Wagh Nakh": { mr: "वाघ नख", hi: "वाघ नख", as: "বাঘ নখ" },
  "Sword": { mr: "तलवार", hi: "तलवार", as: "তৰোৱাল" },
  "Spear": { mr: "भाला", hi: "भाला", as: "যাঠি" },
  "Dagger": { mr: "खंजीर", hi: "खंजर", as: "ডেগাৰ" },
  "Maratha Empire": { mr: "मराठा साम्राज्य", hi: "मराठा साम्राज्य", as: "মাৰাঠা সাম্ৰাজ্য" },
  "Mughal Empire": { mr: "मुघल साम्राज्य", hi: "मुगल साम्राज्य", as: "মোগল সাম্ৰাজ্য" },
  "Maurya Empire": { mr: "मौर्य साम्राज्य", hi: "मौर्य साम्राज्य", as: "মৌৰ্য সাম্ৰাজ্য" },
  "Gupta Empire": { mr: "गुप्त साम्राज्य", hi: "गुप्त साम्राज्य", as: "গুপ্ত সাম্ৰাজ্য" }
};

function getLocalText(text: string): string {
  const lang = LanguageService.getCurrentLanguageCode();
  if (LOCALIZED_TERMS[text] && LOCALIZED_TERMS[text][lang]) {
    return LOCALIZED_TERMS[text][lang];
  }
  return text;
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
  const lang = LanguageService.getCurrentLanguageCode();

  return selected.map(person => {
    const askName = difficulty === 1 ? true
                  : difficulty === 3 ? false
                  : Math.random() > 0.5;

    const correctAnswer = askName ? person.name : person.relationship;
    
    let questionText = askName ? "Who is this person?" : "What is your relationship with this person?";
    if (lang === 'mr') questionText = askName ? "ही व्यक्ती कोण आहे?" : "या व्यक्तीशी तुमचे काय नाते आहे?";
    else if (lang === 'hi') questionText = askName ? "यह व्यक्ति कौन है?" : "इस व्यक्ति के साथ आपका क्या रिश्ता है?";
    else if (lang === 'as') questionText = askName ? "এই ব্যক্তিজন কোন?" : "এই ব্যক্তিজনৰ সৈতে আপোনাৰ সম্পৰ্ক কি?";

    const voiceQuestion = questionText;

    let voiceHint = "";
    if (askName) {
      if (lang === 'mr') voiceHint = `ते तुमचे ${getLocalText(person.relationship)} आहेत.`;
      else if (lang === 'hi') voiceHint = `ये आपके ${getLocalText(person.relationship)} हैं।`;
      else if (lang === 'as') voiceHint = `তেওঁ আপোনাৰ ${getLocalText(person.relationship)}।`;
      else voiceHint = `They are your ${person.relationship}.`;
    } else {
      if (lang === 'mr') voiceHint = `त्यांचे नाव ${getLocalText(person.name)} आहे.`;
      else if (lang === 'hi') voiceHint = `इनका नाम ${getLocalText(person.name)} है।`;
      else if (lang === 'as') voiceHint = `তেওঁৰ নাম ${getLocalText(person.name)}।`;
      else voiceHint = `Their name is ${person.name}.`;
    }

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

    const translatedAnswer = getLocalText(correctAnswer);
    const keywords = translatedAnswer.toLowerCase().replace(/[^\p{L}\p{M}\p{N} ]/gu, '').split(' ').filter(w => w.length > 1);
    keywords.push(translatedAnswer.toLowerCase());
    if (translatedAnswer !== correctAnswer) {
      keywords.push(correctAnswer.toLowerCase());
    }

    return {
      person,
      questionType: askName ? 'name' : 'relationship',
      questionText,
      options: shuffle([correctAnswer, ...distractors]),
      correctAnswer,
      voiceQuestion,
      voiceHint,
      keywords
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

  // Filter songs by current language if language metadata exists.
  // This is crucial because demo songs are loaded into localStorage, bypassing the empty check.
  const lang = LanguageService.getCurrentLanguageCode();
  
  let languageFilteredSongs = songs.filter(song => {
    try {
      const content = JSON.parse(song.content);
      // If language is specified, it must match. If not specified, we assume it's language-agnostic.
      return !content.language || content.language === lang;
    } catch(e) {
      return true; // Not JSON or no language metadata, include it
    }
  });

  // If no songs match the current language, try Hindi as a fallback.
  if (languageFilteredSongs.length === 0) {
    languageFilteredSongs = songs.filter(song => {
      try {
        const content = JSON.parse(song.content);
        return !content.language || content.language === 'hi';
      } catch(e) {
        return true;
      }
    });
  }

  // If still no songs, just use whatever is available
  if (languageFilteredSongs.length === 0) {
    languageFilteredSongs = songs;
  }

  songs = languageFilteredSongs;

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

    // Add native keywords if provided in metadata for proper STT matching in regional languages
    if (metadata.nativeKeywords && Array.isArray(metadata.nativeKeywords)) {
       metadata.nativeKeywords.forEach((kw: string) => keywords.push(kw.toLowerCase()));
    }

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

    // Apply translations to the options for the UI
    const localizedCorrectAnswer = getLocalText(correctAnswer);
    const localizedOptions = shuffle([correctAnswer, ...distractors]).map(opt => getLocalText(opt));

    // Also add the localized correct answer to keywords so it can be matched
    const localizedKeywords = localizedCorrectAnswer.toLowerCase().replace(/[^\p{L}\p{M}\p{N} ]/gu, '').split(' ').filter((w: string) => w.length > 1);
    localizedKeywords.forEach(kw => keywords.push(kw));
    keywords.push(localizedCorrectAnswer.toLowerCase());

    return {
      song,
      options: localizedOptions,
      correctAnswer: localizedCorrectAnswer,
      voiceQuestion,
      voiceHint,
      keywords
    };
  });
}

/**
 * GAME 5: "Historical Journey"
 * Asks questions based on an embedded historical animated video.
 */
export function generateHistoryQuestions(): HistoryQuestion[] {
  const lang = LanguageService.getCurrentLanguageCode();

  const q1Correct = getLocalText("Wagh Nakh");
  const q1Distractors = ["Sword", "Spear", "Dagger"].map(getLocalText);
  
  let q1Voice = "Can you tell me the name of the weapon?";
  let q1Hint = "It is named after a tiger's claws.";
  if (lang === 'mr') {
    q1Voice = "तुम्ही मला या शस्त्राचे नाव सांगू शकता का?";
    q1Hint = "याचे नाव वाघाच्या नखांवरून ठेवले आहे.";
  } else if (lang === 'hi') {
    q1Voice = "क्या आप मुझे इस हथियार का नाम बता सकते हैं?";
    q1Hint = "इसका नाम बाघ के नाखूनों पर रखा गया है।";
  } else if (lang === 'as') {
    q1Voice = "আপুনি মোক এই অস্ত্ৰটোৰ নাম ক'ব পাৰিবনে?";
    q1Hint = "ইয়াৰ নাম বাঘৰ নখৰ ওপৰত ৰখা হৈছে।";
  }

  const q1Keywords = q1Correct.toLowerCase().replace(/[^\p{L}\p{M}\p{N} ]/gu, '').split(' ').filter((w) => w.length > 2);
  q1Keywords.push(q1Correct.toLowerCase());

  const q2Correct = getLocalText("Maratha Empire");
  const q2Distractors = ["Mughal Empire", "Maurya Empire", "Gupta Empire"].map(getLocalText);

  let q2Voice = "Which empire did he establish?";
  let q2Hint = "It was a major power in India that began in Maharashtra.";
  if (lang === 'mr') {
    q2Voice = "त्याने कोणते साम्राज्य स्थापन केले?";
    q2Hint = "ही भारतातील एक प्रमुख सत्ता होती जिची सुरुवात महाराष्ट्रात झाली.";
  } else if (lang === 'hi') {
    q2Voice = "उसने किस साम्राज्य की स्थापना की?";
    q2Hint = "यह भारत में एक प्रमुख शक्ति थी जिसकी शुरुआत महाराष्ट्र में हुई थी।";
  } else if (lang === 'as') {
    q2Voice = "তেওঁ কোনটো সাম্ৰাজ্য প্ৰতিষ্ঠা কৰিছিল?";
    q2Hint = "মহাৰাষ্ট্ৰত আৰম্ভ হোৱা ই ভাৰতৰ এক প্ৰধান শক্তি আছিল।";
  }

  const q2Keywords = q2Correct.toLowerCase().replace(/[^\p{L}\p{M}\p{N} ]/gu, '').split(' ').filter((w) => w.length > 2);
  q2Keywords.push(q2Correct.toLowerCase());

  return [
    {
      id: "history_q1",
      questionText: lang === 'mr' ? "शिवाजी महाराजांनी अफजल खानाचा पराभव करण्यासाठी कोणत्या शस्त्राचा वापर केला?"
                  : lang === 'hi' ? "शिवाजी महाराज ने अफजल खान को हराने के लिए किस हथियार का इस्तेमाल किया था?"
                  : lang === 'as' ? "শিৱাজী মহাৰাজে আফজল খানক পৰাস্ত কৰিবলৈ কোনটো অস্ত্ৰ ব্যৱহাৰ কৰিছিল?"
                  : "Which weapon did Shivaji Maharaj use to defeat Afzal Khan?",
      correctAnswer: q1Correct,
      options: shuffle([...q1Distractors, q1Correct]),
      voiceQuestion: q1Voice,
      voiceHint: q1Hint,
      keywords: q1Keywords
    },
    {
      id: "history_q2",
      questionText: lang === 'mr' ? "शिवाजी महाराजांनी कोणते साम्राज्य स्थापन केले?"
                  : lang === 'hi' ? "शिवाजी महाराज ने किस साम्राज्य की स्थापना की?"
                  : lang === 'as' ? "শিৱাজী মহাৰাজে কোনটো সাম্ৰাজ্য প্ৰতিষ্ঠা কৰিছিল?"
                  : "Which empire did Shivaji Maharaj establish?",
      correctAnswer: q2Correct,
      options: shuffle([...q2Distractors, q2Correct]),
      voiceQuestion: q2Voice,
      voiceHint: q2Hint,
      keywords: q2Keywords
    }
  ];
}
