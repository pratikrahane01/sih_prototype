import type { FamiliarRoute } from '../../types';

const ROUTE_STORAGE_KEY = 'sih_patient_routes';

class RouteServiceClass {
  private getRoutesFromStorage(): FamiliarRoute[] {
    try {
      const data = localStorage.getItem(ROUTE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load routes from local storage', e);
      return [];
    }
  }

  private saveRoutesToStorage(routes: FamiliarRoute[]): void {
    try {
      localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(routes));
    } catch (e) {
      console.error('Failed to save routes to local storage', e);
    }
  }

  public getPatientRoutes(patientId: string): FamiliarRoute[] {
    return this.getRoutesFromStorage().filter(r => r.patientId === patientId);
  }

  public getRoute(id: string): FamiliarRoute | undefined {
    return this.getRoutesFromStorage().find(r => r.id === id);
  }

  public createRoute(route: Omit<FamiliarRoute, 'id' | 'createdAt' | 'updatedAt'>): FamiliarRoute {
    const routes = this.getRoutesFromStorage();
    
    const newRoute: FamiliarRoute = {
      ...route,
      id: `route_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    routes.push(newRoute);
    this.saveRoutesToStorage(routes);
    return newRoute;
  }

  public updateRoute(id: string, updates: Partial<Omit<FamiliarRoute, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>>): FamiliarRoute | null {
    const routes = this.getRoutesFromStorage();
    const index = routes.findIndex(r => r.id === id);
    
    if (index === -1) return null;

    const updatedRoute = {
      ...routes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    routes[index] = updatedRoute;
    this.saveRoutesToStorage(routes);
    return updatedRoute;
  }

  public deleteRoute(id: string): boolean {
    const routes = this.getRoutesFromStorage();
    const index = routes.findIndex(r => r.id === id);
    
    if (index === -1) return false;

    routes.splice(index, 1);
    this.saveRoutesToStorage(routes);
    return true;
  }
}

export const RouteService = new RouteServiceClass();
