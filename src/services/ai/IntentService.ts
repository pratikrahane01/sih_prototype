export type IntentType = 
  | 'LOCATION_OF_OBJECT'
  | 'PERSON_RELATIONSHIP'
  | 'PLACE_INFORMATION'
  | 'DAILY_ROUTINE'
  | 'TODAY_ACTIVITY'
  | 'APPOINTMENT'
  | 'GET_MEMORY'
  | 'GET_PERSON'
  | 'GET_PLACE'
  | 'GET_LIFE_EVENT'
  | 'GET_MEMORY_CATEGORY'
  | 'GENERAL_SAVED_MEMORY'
  | 'UNKNOWN';

export interface IntentResult {
  intent: IntentType;
  entity: string;
  confidence: number;
}

class IntentServiceClass {
  /**
   * Mock NLP intent detection for the prototype.
   * A real implementation would use an LLM or NLU model.
   */
  public detectIntent(query: string): IntentResult {
    const lowerQuery = query.toLowerCase();
    
    // Pattern matching rules
    if (lowerQuery.includes('where') && (lowerQuery.includes('glasses') || lowerQuery.includes('keys') || lowerQuery.includes('wallet') || lowerQuery.includes('phone') || lowerQuery.includes('is my') || lowerQuery.includes('are my'))) {
      const entityMatch = lowerQuery.match(/my ([\w\s]+)/);
      const entity = entityMatch ? entityMatch[1].replace('?', '').trim() : '';
      
      // Fallback entity extraction
      let finalEntity = entity;
      if (!entity) {
        if (lowerQuery.includes('glasses')) finalEntity = 'glasses';
        else if (lowerQuery.includes('keys')) finalEntity = 'keys';
        else if (lowerQuery.includes('wallet')) finalEntity = 'wallet';
        else if (lowerQuery.includes('phone')) finalEntity = 'phone';
      }

      return {
        intent: 'LOCATION_OF_OBJECT',
        entity: finalEntity,
        confidence: 0.8
      };
    }

    if (lowerQuery.includes('who is')) {
      const entityMatch = lowerQuery.match(/who is ([\w\s]+)/);
      const entity = entityMatch ? entityMatch[1].replace('?', '').trim() : '';
      return {
        intent: 'PERSON_RELATIONSHIP',
        entity,
        confidence: 0.9
      };
    }

    if (lowerQuery.includes('where is') && (lowerQuery.includes('clinic') || lowerQuery.includes('hospital') || lowerQuery.includes('market') || lowerQuery.includes('doctor'))) {
      const entityMatch = lowerQuery.match(/my ([\w\s]+)/) || lowerQuery.match(/the ([\w\s]+)/);
      const entity = entityMatch ? entityMatch[1].replace('?', '').trim() : 'clinic';
      return {
        intent: 'PLACE_INFORMATION',
        entity,
        confidence: 0.8
      };
    }

    if (lowerQuery.includes('routine') || lowerQuery.includes('medicine') || lowerQuery.includes('breakfast') || lowerQuery.includes('morning')) {
      return {
        intent: 'DAILY_ROUTINE',
        entity: 'routine',
        confidence: 0.75
      };
    }

    if (lowerQuery.includes('today') || lowerQuery.includes('what do i have')) {
      return {
        intent: 'TODAY_ACTIVITY',
        entity: 'today',
        confidence: 0.7
      };
    }

    if (lowerQuery.includes('wedding') || lowerQuery.includes('marriage')) {
      return {
        intent: 'GET_MEMORY_CATEGORY',
        entity: 'Marriage',
        confidence: 0.9
      };
    }

    if (lowerQuery.includes('childhood') || lowerQuery.includes('young')) {
      return {
        intent: 'GET_MEMORY_CATEGORY',
        entity: 'Childhood',
        confidence: 0.9
      };
    }

    if (lowerQuery.includes('show me') || lowerQuery.includes('tell me about')) {
      const match = lowerQuery.match(/tell me about ([\w\s]+)/) || lowerQuery.match(/show me ([\w\s]+)/);
      const entity = match ? match[1].replace('?', '').trim() : '';
      return {
        intent: 'GET_MEMORY',
        entity,
        confidence: 0.8
      };
    }

    // Default unknown
    return {
      intent: 'UNKNOWN',
      entity: query, // Just pass the whole query to search if unknown
      confidence: 0.3
    };
  }
}

export const IntentService = new IntentServiceClass();
