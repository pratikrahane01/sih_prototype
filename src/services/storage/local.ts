// Checks if localStorage is available (e.g. won't work in some private browsing modes)
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const localStorageAvailable = isLocalStorageAvailable();

export const StorageService = {
  isAvailable(): boolean {
    return localStorageAvailable;
  },

  get<T>(key: string): T | null {
    if (!localStorageAvailable) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (!localStorageAvailable) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota exceeded or unavailable — fail silently in production
    }
  },

  remove(key: string): void {
    if (!localStorageAvailable) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },

  clear(): void {
    if (!localStorageAvailable) return;
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  }
};
