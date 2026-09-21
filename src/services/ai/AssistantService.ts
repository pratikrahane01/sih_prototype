import { MemoryService } from '../api/MemoryService';
import { IntentService } from './IntentService';
import { LanguageService } from '../accessibility/LanguageService';
import type { PersonalMemory } from '../../types';

class AssistantServiceClass {
  /**
   * Generates a conversational response based on patient memory retrieval.
   * Prototype response generator preventing hallucinations.
   */
  public async generateResponse(patientId: string, userQuery: string): Promise<string> {
    // Artificial latency for "thinking"
    await new Promise(resolve => setTimeout(resolve, 800));

    // 1. Normalize query to English so intent detection works
    const normalizedQuery = LanguageService.normalizeQueryToEnglish(userQuery);

    const { intent, entity } = IntentService.detectIntent(normalizedQuery);

    let memories: PersonalMemory[] = [];

    // Map intent to category search
    if (intent === 'LOCATION_OF_OBJECT') {
      memories = MemoryService.searchMemories(patientId, entity, 'object');
    } else if (intent === 'PERSON_RELATIONSHIP') {
      memories = MemoryService.searchMemories(patientId, entity, 'person');
    } else if (intent === 'PLACE_INFORMATION') {
      memories = MemoryService.searchMemories(patientId, entity, 'place');
    } else if (intent === 'DAILY_ROUTINE') {
      memories = MemoryService.searchMemories(patientId, undefined, 'routine');
    } else if (intent === 'GET_MEMORY_CATEGORY') {
      memories = MemoryService.searchMemories(patientId, undefined, entity as any);
    } else if (intent === 'GET_MEMORY') {
      memories = MemoryService.searchMemories(patientId, entity);
    } else {
      // General search fallback
      memories = MemoryService.searchMemories(patientId, normalizedQuery);
    }

    let response = "";

    // Response Generation Strategy (Deterministic for prototype)
    if (memories.length === 0) {
      // Hallucination protection
      if (intent === 'LOCATION_OF_OBJECT') response = `I don't have a saved location for your ${entity || 'object'} yet.`;
      else if (intent === 'PERSON_RELATIONSHIP') response = `I don't have information saved about someone named ${entity || 'that person'}.`;
      else if (intent === 'DAILY_ROUTINE') response = `I don't see any routines saved for you right now.`;
      else if (intent === 'GET_MEMORY_CATEGORY') response = `I don't see any memories saved under the ${entity} category.`;
      else if (intent === 'GET_MEMORY') response = `I couldn't find a memory about ${entity}.`;
      else response = "I don't have that information saved yet. You can ask your caregiver to add it.";
    } else {
      const memory = memories[0]; // Take best match

      // Format response based on intent to make it natural
      if (intent === 'LOCATION_OF_OBJECT') {
        response = `Your ${memory.title.toLowerCase()} is ${memory.content.toLowerCase()}.`;
      } else if (intent === 'PERSON_RELATIONSHIP') {
        response = `${memory.content}`;
      } else if (intent === 'DAILY_ROUTINE') {
        response = `Your routine: ${memory.title} is ${memory.content.toLowerCase()}.`;
      } else {
        // Default formatting
        response = `${memory.content}`;
      }
    }

    // 2. Localize the English response back to the patient's language
    return LanguageService.localizeResponse(response);
  }
}

export const AssistantService = new AssistantServiceClass();
