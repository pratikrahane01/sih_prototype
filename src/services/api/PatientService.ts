import type { Patient } from '../../types';
import { StorageService } from '../storage/local';

const PATIENT_KEY = 'calm_intelligence_patient_profile';

export const PatientService = {
  getProfile(): Patient | null {
    return StorageService.get<Patient>(PATIENT_KEY);
  },

  saveProfile(profile: Patient): void {
    StorageService.set(PATIENT_KEY, profile);
  },

  updateProfile(updates: Partial<Patient>): Patient {
    const current = this.getProfile() || {} as Patient;
    const updated = { ...current, ...updates };
    this.saveProfile(updated);
    return updated;
  },

  clearProfile(): void {
    StorageService.remove(PATIENT_KEY);
  }
};
