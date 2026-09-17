import { StorageService } from '../storage/local';
import type { RoutineItem } from '../../types';

const ROUTINE_KEY = 'calm_intelligence_routine';

const defaultDemoRoutine: RoutineItem[] = [
  {
    id: 'r1',
    patientId: 'demo-patient',
    title: 'Wake Up',
    time: '07:30',
    category: 'Morning',
    completed: false,
    reminderEnabled: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'r2',
    patientId: 'demo-patient',
    title: 'Breakfast',
    time: '08:00',
    category: 'Meals',
    completed: false,
    reminderEnabled: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'r3',
    patientId: 'demo-patient',
    title: 'Morning Walk',
    time: '09:00',
    category: 'Activity',
    completed: false,
    reminderEnabled: true,
    description: 'Take a short walk around the garden.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'r4',
    patientId: 'demo-patient',
    title: 'Cognitive Activity',
    time: '10:30',
    category: 'Activity',
    completed: false,
    reminderEnabled: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'r5',
    patientId: 'demo-patient',
    title: 'Lunch',
    time: '13:00',
    category: 'Meals',
    completed: false,
    reminderEnabled: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'r6',
    patientId: 'demo-patient',
    title: 'Medicine Reminder',
    time: '14:00',
    category: 'Medicine',
    completed: false,
    reminderEnabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'r7',
    patientId: 'demo-patient',
    title: 'Family Time',
    time: '16:30',
    category: 'Family',
    completed: false,
    reminderEnabled: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'r8',
    patientId: 'demo-patient',
    title: 'Light Activity',
    time: '18:00',
    category: 'Activity',
    completed: false,
    reminderEnabled: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'r9',
    patientId: 'demo-patient',
    title: 'Prepare for Bed',
    time: '21:00',
    category: 'Evening',
    completed: false,
    reminderEnabled: false,
    createdAt: new Date().toISOString()
  }
];

export const RoutineService = {
  getPatientRoutine(patientId: string): RoutineItem[] {
    const routines = StorageService.get<RoutineItem[]>(`${ROUTINE_KEY}_${patientId}`);
    if (!routines || routines.length === 0) {
      this.savePatientRoutine(patientId, defaultDemoRoutine.map(r => ({ ...r, patientId })));
      return this.getPatientRoutine(patientId);
    }
    // Sort by time
    return routines.sort((a, b) => a.time.localeCompare(b.time));
  },

  savePatientRoutine(patientId: string, routines: RoutineItem[]): void {
    StorageService.set(`${ROUTINE_KEY}_${patientId}`, routines);
  },

  addRoutineItem(item: Omit<RoutineItem, 'id' | 'createdAt'>): void {
    const newItem: RoutineItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    const current = this.getPatientRoutine(item.patientId);
    current.push(newItem);
    this.savePatientRoutine(item.patientId, current);
  },

  updateRoutineItem(patientId: string, itemId: string, updates: Partial<RoutineItem>): void {
    const current = this.getPatientRoutine(patientId);
    const updated = current.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    this.savePatientRoutine(patientId, updated);
  },

  deleteRoutineItem(patientId: string, itemId: string): void {
    const current = this.getPatientRoutine(patientId);
    const updated = current.filter(item => item.id !== itemId);
    this.savePatientRoutine(patientId, updated);
  },

  toggleCompletion(patientId: string, itemId: string): void {
    const current = this.getPatientRoutine(patientId);
    const item = current.find(i => i.id === itemId);
    if (item) {
      this.updateRoutineItem(patientId, itemId, { completed: !item.completed });
    }
  }
};
