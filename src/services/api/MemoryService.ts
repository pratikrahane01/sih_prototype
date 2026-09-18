import type { PersonalMemory, MemoryCategory, Person } from '../../types';
import { DEMO_PEOPLE, DEMO_MEMORIES, DEMO_PATIENT_ID } from '../demo/DemoMemoryData';

const MEMORY_STORAGE_KEY = 'sih_patient_memories';
const PERSON_STORAGE_KEY = 'sih_patient_people';
// Bump this version to force re-seed (wipes old demo data and replaces with fresh data)
const DEMO_SEED_VERSION_KEY = 'sih_demo_seed_version';
const DEMO_SEED_VERSION = '6'; // v6 = 15 songs total (5 per language)

class MemoryServiceClass {
  private getMemories(): PersonalMemory[] {
    try {
      const data = localStorage.getItem(MEMORY_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load memories from local storage', e);
      return [];
    }
  }

  private saveMemories(memories: PersonalMemory[]): void {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
    } catch (e) {
      console.error('Failed to save memories to local storage', e);
    }
  }

  public getPatientMemories(patientId: string): PersonalMemory[] {
    return this.getMemories().filter(m => m.patientId === patientId);
  }

  public getMemory(id: string): PersonalMemory | undefined {
    return this.getMemories().find(m => m.id === id);
  }

  public addMemory(memory: Omit<PersonalMemory, 'id' | 'createdAt' | 'updatedAt'>): PersonalMemory {
    const memories = this.getMemories();
    
    const newMemory: PersonalMemory = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memories.push(newMemory);
    this.saveMemories(memories);
    return newMemory;
  }

  public updateMemory(id: string, updates: Partial<Omit<PersonalMemory, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>>): PersonalMemory | null {
    const memories = this.getMemories();
    const index = memories.findIndex(m => m.id === id);
    
    if (index === -1) return null;

    const updatedMemory = {
      ...memories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    memories[index] = updatedMemory;
    this.saveMemories(memories);
    return updatedMemory;
  }

  public deleteMemory(id: string): boolean {
    const memories = this.getMemories();
    const index = memories.findIndex(m => m.id === id);
    
    if (index === -1) return false;

    memories.splice(index, 1);
    this.saveMemories(memories);
    return true;
  }

  /**
   * Simple structured search for prototype memory retrieval
   */
  public searchMemories(patientId: string, query?: string, category?: MemoryCategory): PersonalMemory[] {
    let results = this.getPatientMemories(patientId);

    if (category) {
      results = results.filter(m => m.category === category);
    }

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.content.toLowerCase().includes(q)
      );
    }

    return results;
  }

  // --- Person CRUD ---

  private getPeople(): Person[] {
    try {
      const data = localStorage.getItem(PERSON_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load people from local storage', e);
      return [];
    }
  }

  private savePeople(people: Person[]): void {
    try {
      localStorage.setItem(PERSON_STORAGE_KEY, JSON.stringify(people));
    } catch (e) {
      console.error('Failed to save people to local storage', e);
    }
  }

  public getPatientPeople(patientId: string): Person[] {
    return this.getPeople().filter(p => p.patientId === patientId);
  }

  public getPerson(id: string): Person | undefined {
    return this.getPeople().find(p => p.id === id);
  }

  public addPerson(person: Omit<Person, 'id' | 'createdAt'>): Person {
    const people = this.getPeople();
    const newPerson: Person = {
      ...person,
      id: `per_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    people.push(newPerson);
    this.savePeople(people);
    return newPerson;
  }

  public deletePerson(id: string): boolean {
    const people = this.getPeople();
    const index = people.findIndex(p => p.id === id);
    if (index === -1) return false;
    people.splice(index, 1);
    this.savePeople(people);
    return true;
  }

  // ── Demo Data ────────────────────────────────────────────────────────────────

  /**
   * Seeds localStorage with demo data from DemoMemoryData.ts.
   * Called once at App boot. If caregiver data already exists, this is a no-op.
   * The patientId parameter is accepted but we always seed for DEMO_PATIENT_ID
   * so the games can find the data regardless of what the onboarding saved.
   */
  public initializeDemoData(patientId?: string) {
    const targetId = patientId || DEMO_PATIENT_ID;

    // Check if we need to re-seed (version bump or first run)
    const storedVersion = localStorage.getItem(DEMO_SEED_VERSION_KEY);
    const needsReseed = storedVersion !== DEMO_SEED_VERSION;

    if (needsReseed) {
      // Wipe old stale demo data (e.g., previous seed with Anita/Ramesh/Meena)
      const allMemories = this.getMemories();
      const demoMemIds = new Set(DEMO_MEMORIES.map(m => m.id));
      const userMemories = allMemories.filter(m => !demoMemIds.has(m.id) && m.id !== 'demo_mem_song');
      this.saveMemories(userMemories);

      const allPeople = this.getPeople();
      const demoPeopleIds = new Set(DEMO_PEOPLE.map(p => p.id));
      const oldDemoNames = new Set(['Anita', 'Ramesh', 'Meena', 'Arun']);
      const userPeople = allPeople.filter(p => !demoPeopleIds.has(p.id) && !oldDemoNames.has(p.name));
      this.savePeople(userPeople);

      localStorage.setItem(DEMO_SEED_VERSION_KEY, DEMO_SEED_VERSION);
    }

    // Seed memories if none exist for this patient OR for demo_patient_1
    const existingForTarget = this.getPatientMemories(targetId);
    const existingForDemo   = this.getPatientMemories(DEMO_PATIENT_ID);

    if (existingForTarget.length === 0 && existingForDemo.length === 0) {
      DEMO_MEMORIES.forEach(m => {
        const memories = this.getMemories();
        // Avoid duplicate IDs
        if (!memories.find(existing => existing.id === m.id)) {
          memories.push({
            ...m,
            patientId: targetId,
            id: m.id,
            type: m.type,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt
          } as PersonalMemory);
          this.saveMemories(memories);
        }
      });
    }

    const existingPeopleForTarget = this.getPatientPeople(targetId);
    const existingPeopleForDemo   = this.getPatientPeople(DEMO_PATIENT_ID);

    if (existingPeopleForTarget.length === 0 && existingPeopleForDemo.length === 0) {
      DEMO_PEOPLE.forEach(p => {
        const people = this.getPeople();
        if (!people.find(existing => existing.id === p.id)) {
          people.push({
            ...p,
            patientId: targetId,
            id: p.id,
            createdAt: p.createdAt
          } as Person);
          this.savePeople(people);
        }
      });
    }
  }

  /**
   * Returns memories for a patient, automatically falling back to DEMO_PATIENT_ID
   * if the given patientId has no entries. This ensures the games always work.
   */
  public getPatientMemoriesWithFallback(patientId: string): PersonalMemory[] {
    const direct = this.getPatientMemories(patientId);
    if (direct.length > 0) return direct;
    return this.getPatientMemories(DEMO_PATIENT_ID);
  }

  /**
   * Returns people for a patient, automatically falling back to DEMO_PATIENT_ID.
   */
  public getPatientPeopleWithFallback(patientId: string): Person[] {
    const direct = this.getPatientPeople(patientId);
    if (direct.length > 0) return direct;
    return this.getPatientPeople(DEMO_PATIENT_ID);
  }
}

export const MemoryService = new MemoryServiceClass();
