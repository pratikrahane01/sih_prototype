import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import CaregiverLayout from './layouts/CaregiverLayout';

// Patient Pages
import {
  PatientHome,
  GamesList,
  SingleGame,
  Assistant,
  FamiliarRoutesList,
  SingleRouteGame
} from './pages/patient';
import { Onboarding } from './pages/patient/Onboarding';

// Caregiver Pages
import {
  CaregiverDashboard,
  PatientsList,
  SinglePatient,
  FamilyManager,
  RouteManager,
  ReminderManager,
  MemoriesManager
} from './pages/caregiver';

// Services
import { MemoryService } from './services/api/MemoryService';
import { PatientService } from './services/api/PatientService';

function App() {
  // Seed demo data on every app boot so the personalized games always have content.
  // This is a no-op if caregiver data already exists in localStorage.
  useEffect(() => {
    const patientId = PatientService.getProfile()?.id;
    MemoryService.initializeDemoData(patientId);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Patient Routes */}
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientHome />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="games" element={<GamesList />} />
          <Route path="game/:id" element={<SingleGame />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="routes" element={<FamiliarRoutesList />} />
          <Route path="route/:id" element={<SingleRouteGame />} />
        </Route>

        {/* Caregiver Routes */}
        <Route path="/caregiver" element={<CaregiverLayout />}>
          <Route index element={<CaregiverDashboard />} />
          <Route path="patients" element={<PatientsList />} />
          <Route path="patient/:id" element={<SinglePatient />} />
          <Route path="family" element={<FamilyManager />} />
          <Route path="routes" element={<RouteManager />} />
          <Route path="reminders" element={<ReminderManager />} />
          <Route path="memories" element={<MemoriesManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
