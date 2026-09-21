import type { Person } from '../../types';
import type { DemoPerson } from '../demo/DemoMemoryData';

export interface AnswerEvaluationResult {
  result: 'CORRECT' | 'INCORRECT' | 'UNCERTAIN';
  confidence: number;
  matchedSignals: string[];
  negationDetected: boolean;
}

const NEGATION_TERMS = [
  'not', "isn't", 'isnt', 'dont', "don't", 'no', 'never',
  'नहीं', 'नाही', 'নহয়', 'नहয়'
];

const UNCERTAIN_TERMS = [
  'maybe', 'perhaps', 'might', 'think', 'guess', 'not sure', 'unsure',
  'कदाचित', 'शायद', 'হবলা', 'किंबहुना', 'मला वाटते', 'मुझे लगता है'
];

const DONT_KNOW_TERMS = [
  "don't know", "dont know", "no idea", "who is",
  "mahit nahi", "mala mahit nahi", "pata nahi", "mujhe pata nahi",
  "নাজানো", "মই নাজানো", "कोण आहे", "कौन है"
];

const RELATIONSHIP_MAP: Record<string, string[]> = {
  daughter: ['daughter', 'beti', 'पुत्री', 'बेटी', 'জীয়ৰী', 'मुलगी'],
  son: ['son', 'beta', 'पुत्र', 'बेटा', 'পুত্ৰ', "ল'ৰা", 'मुलगा'],
  sister: ['sister', 'behen', 'बहन', 'ভনীয়েক', 'बहीण'],
  brother: ['brother', 'bhai', 'भाई', 'ককায়েক', 'भाऊ'],
  wife: ['wife', 'patni', 'पत्नी', 'পত্নী'],
  husband: ['husband', 'pati', 'पति', 'স্বামী'],
  friend: ['friend', 'dost', 'mitra', 'मित्र', 'दोस्त', 'বন্ধু'],
  neighbor: ['neighbor', 'neighbour', 'padosi', 'shejari', 'पड़ोसी', 'शेजारी', 'চুবুৰীয়া'],
  grandson: ['grandson', 'pota', 'natu', 'पोता', 'নাতি', 'नातू'],
  granddaughter: ['granddaughter', 'poti', 'naat', 'पोती', 'নাতিনী', 'नात']
};

const NAME_ALIASES: Record<string, string[]> = {
  'riya': ['रिया', 'ৰিয়া', 'riya'],
  'arun': ['अरुण', 'अరుణ', 'অৰুণ', 'arun'],
  'meena': ['मीना', 'मीणा', 'মীনা', 'meena'],
  'suresh': ['सुरेश', 'সুৰেশ', 'suresh'],
  'priya': ['प्रिया', 'প্ৰিয়া', 'priya'],
  'kavita': ['कविता', 'কবিতা', 'kavita'],
  'rajesh': ['राजेश', 'ৰাজেশ', 'rajesh'],
  'anand': ['आनंद', 'आनन्द', 'আনন্দ', 'anand'],
  'sita': ['सीता', 'সীতা', 'sita'],
  'mohan': ['मोहन', 'মোহন', 'mohan']
};

class WhoIsThisAnswerEvaluatorClass {
  
  private normalize(text: string): string {
    let normalized = text.toLowerCase();
    // Remove punctuation except apostrophes, PRESERVE letters, numbers, and combining marks (Indic matras)
    normalized = normalized.replace(/[^\p{L}\p{M}\p{N}\s']/gu, '');
    // Remove extra spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
  }

  private hasNegation(text: string): boolean {
    const words = text.split(' ');
    return words.some(w => NEGATION_TERMS.includes(w));
  }

  private getExpectedRelationships(relationship: string): string[] {
    const normalizedRel = relationship.toLowerCase();
    for (const [key, aliases] of Object.entries(RELATIONSHIP_MAP)) {
      if (key === normalizedRel || aliases.includes(normalizedRel)) {
        return [key, ...aliases];
      }
    }
    return [normalizedRel]; // Fallback if not in map
  }

  private getExpectedNames(name: string): string[] {
    const normalizedName = this.normalize(name);
    return NAME_ALIASES[normalizedName] || [normalizedName];
  }

  public evaluate(
    transcript: string,
    expectedPerson: Person | DemoPerson,
    _language: string
  ): AnswerEvaluationResult {
    const normalizedTranscript = this.normalize(transcript);
    
    // Check if the user clearly stated they don't know
    if (DONT_KNOW_TERMS.some(term => normalizedTranscript.includes(term))) {
       console.log(`[Diagnostics] Evaluator: User indicated 'Don't know'.`);
       return {
         result: 'INCORRECT',
         confidence: 1.0,
         matchedSignals: [],
         negationDetected: false
       };
    }

    const isNegated = this.hasNegation(normalizedTranscript);
    const isUncertain = UNCERTAIN_TERMS.some(term => normalizedTranscript.includes(term));
    const matchedSignals: string[] = [];
    let confidence = 0;

    // 1. Check Name Matches
    const expectedName = this.normalize(expectedPerson.name);
    const nameAliases = this.getExpectedNames(expectedName);
    
    // Include aliases if they exist on the model
    for (const alias of nameAliases) {
      if (normalizedTranscript.includes(alias)) {
        matchedSignals.push(`name:${alias}`);
        confidence += 0.8;
        break;
      }
    }
    
    const nameParts = expectedName.split(' ').filter(w => w.length > 2);
    if (matchedSignals.length === 0 && nameParts.length > 0) {
       for (const part of nameParts) {
         if (normalizedTranscript.includes(part)) {
           matchedSignals.push(`name_part:${part}`);
           confidence += 0.5;
         }
       }
    }

    // 2. Check Relationship Matches
    const expectedRel = this.normalize(expectedPerson.relationship);
    const relationshipKeywords = this.getExpectedRelationships(expectedRel);
    for (const rel of relationshipKeywords) {
      if (normalizedTranscript.includes(rel)) {
        matchedSignals.push(`relationship:${rel}`);
        confidence += 0.8;
        break; 
      }
    }

    // Check for WRONG relationships (i.e. user guessed sister instead of daughter)
    let wrongRelationshipDetected = false;
    for (const [key, aliases] of Object.entries(RELATIONSHIP_MAP)) {
      if (!relationshipKeywords.includes(key)) {
        for (const alias of aliases) {
           if (normalizedTranscript.includes(alias)) {
             wrongRelationshipDetected = true;
             matchedSignals.push(`wrong_relationship:${alias}`);
             break;
           }
        }
      }
    }

    // 3. Check Context Match
    const desc = expectedPerson.description ? this.normalize(expectedPerson.description) : "";
    if (desc) {
      // Very basic semantic extraction: find words in description that are long enough and appear in transcript
      const contextWords = desc.split(' ').filter(w => w.length > 4 && !RELATIONSHIP_MAP[w]);
      let contextMatches = 0;
      for (const cw of contextWords) {
        if (normalizedTranscript.includes(cw)) {
          contextMatches++;
          matchedSignals.push(`context:${cw}`);
        }
      }
      if (contextMatches > 0) {
        confidence += 0.3 * contextMatches;
      }
    }

    // Debug print
    console.log(`[Diagnostics] Evaluator Transcript: "${transcript}"`);
    console.log(`[Diagnostics] Evaluator Matched Signals:`, matchedSignals);
    console.log(`[Diagnostics] Evaluator Negation: ${isNegated}, Uncertain: ${isUncertain}`);

    // -- Final Resolution Logic --
    
    // If negation is detected, it flips the meaning of matched signals.
    if (isNegated) {
      if (matchedSignals.length > 0 && !wrongRelationshipDetected) {
        // e.g., "She is not my daughter" -> They matched "daughter" but negated it.
        return {
          result: 'INCORRECT',
          confidence: 0.9,
          matchedSignals,
          negationDetected: true
        };
      }
    }

    // If they explicitly guessed the WRONG relationship and did NOT match the right one/name
    if (wrongRelationshipDetected && confidence < 0.5) {
      return {
        result: isUncertain ? 'UNCERTAIN' : 'INCORRECT',
        confidence: 0.8,
        matchedSignals,
        negationDetected: false
      };
    }

    // If confidence is extremely high, it's correct even if they were uncertain ("Maybe she is my daughter")
    if (confidence >= 0.8) {
      return {
        result: 'CORRECT',
        confidence: Math.min(confidence, 1.0),
        matchedSignals,
        negationDetected: false
      };
    }

    // If confidence is moderate (e.g. they only hit a context word, or a name part)
    if (confidence >= 0.3) {
      return {
        result: 'UNCERTAIN',
        confidence,
        matchedSignals,
        negationDetected: false
      };
    }

    // No meaningful signals found
    return {
      result: isUncertain ? 'UNCERTAIN' : 'INCORRECT',
      confidence: 0,
      matchedSignals,
      negationDetected: false
    };
  }
}

export const WhoIsThisAnswerEvaluator = new WhoIsThisAnswerEvaluatorClass();
