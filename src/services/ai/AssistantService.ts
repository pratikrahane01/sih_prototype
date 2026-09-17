import { MemoryService } from '../api/MemoryService';
import { IntentService } from './IntentService';
import type { PersonalMemory } from '../../types';

class AssistantServiceClass {
  /**
   * Generates a conversational response based on patient memory retrieval.
   * Prototype response generator preventing hallucinations.
   */
  public async generateResponse(patientId: string, userQuery: string): Promise<string> {
    // Artificial latency for "thinking"
    await new Promise(resolve => setTimeout(resolve, 800));

    const { intent, entity } = IntentService.detectIntent(userQuery);

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
      memories = MemoryService.searchMemories(patientId, userQuery);
    }

    // Response Generation Strategy (Deterministic for prototype)
    if (memories.length === 0) {
      // Hallucination protection
      if (intent === 'LOCATION_OF_OBJECT') return `I don't have a saved location for your ${entity || 'object'} yet.`;
      if (intent === 'PERSON_RELATIONSHIP') return `I don't have information saved about someone named ${entity || 'that person'}.`;
      if (intent === 'DAILY_ROUTINE') return `I don't see any routines saved for you right now.`;
      if (intent === 'GET_MEMORY_CATEGORY') return `I don't see any memories saved under the ${entity} category.`;
      if (intent === 'GET_MEMORY') return `I couldn't find a memory about ${entity}.`;
      
      return "I don't have that information saved yet. You can ask your caregiver to add it.";
    }

    const memory = memories[0]; // Take best match

    // Format response based on intent to make it natural
    if (intent === 'LOCATION_OF_OBJECT') {
      return `Your ${memory.title.toLowerCase()} is ${memory.content.toLowerCase()}.`;
    }

    if (intent === 'PERSON_RELATIONSHIP') {
      return `${memory.content}`;
    }

    if (intent === 'DAILY_ROUTINE') {
      return `Your routine: ${memory.title} is ${memory.content.toLowerCase()}.`;
    }

    // Default formatting
    return `${memory.content}`;
  }
}

export const AssistantService = new AssistantServiceClass();
