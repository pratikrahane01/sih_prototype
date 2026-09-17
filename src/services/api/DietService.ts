import { StorageService } from '../storage/local';
import type { DietPreference } from '../../types';

const DIET_KEY = 'calm_intelligence_diet';

const defaultDemoDiet: DietPreference = {
  patientId: 'demo-patient',
  preferredFoods: ['Rice', 'Dal', 'Vegetables', 'Fruit'],
  foodsToAvoid: ['Very spicy food', 'Excessive sugar'],
  mealNotes: 'Light dinner. Provide water with all meals.',
  updatedAt: new Date().toISOString()
};

export const DietService = {
  getDietPreference(patientId: string): DietPreference {
    const preference = StorageService.get<DietPreference>(`${DIET_KEY}_${patientId}`);
    if (!preference) {
      this.saveDietPreference(patientId, { ...defaultDemoDiet, patientId });
      return this.getDietPreference(patientId);
    }
    return preference;
  },

  saveDietPreference(patientId: string, preference: DietPreference): void {
    StorageService.set(`${DIET_KEY}_${patientId}`, preference);
  },

  updateDietPreference(patientId: string, updates: Partial<DietPreference>): void {
    const current = this.getDietPreference(patientId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.saveDietPreference(patientId, updated);
  }
};
