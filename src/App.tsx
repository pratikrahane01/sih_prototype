import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';

import { LanguageProvider } from './contexts/LanguageContext';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import CaregiverLayout from './layouts/CaregiverLayout';

// Patient Pages
import {
  PatientHome,
  GamesList,
  SingleGame,
  Insights
} from './pages/patient';
import { DailyRoutine } from './pages/patient/Routine';
import { DietPreferenceView } from './pages/patient/DietPreference';
import { Onboarding } from './pages/patient/Onboarding';

// Caregiver Pages
import {
  CaregiverDashboard,
  PatientsList,
  SinglePatient,
  FamilyManager,
  RoutineManager,
  DietPreferenceManager,
  ReminderManager,
  MemoriesManager
} from './pages/caregiver';

function App() {
  useEffect(() => {
    // Check if there's a selected patient in local storage on mount
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Patient Routes */}
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<PatientHome />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="games" element={<GamesList />} />
            <Route path="game/:id" element={<SingleGame />} />
            <Route path="insights" element={<Insights />} />
            <Route path="routine" element={<DailyRoutine />} />
            <Route path="diet" element={<DietPreferenceView />} />
          </Route>

          {/* Caregiver Routes */}
          <Route path="/caregiver" element={<CaregiverLayout />}>
            <Route index element={<CaregiverDashboard />} />
            <Route path="patients" element={<PatientsList />} />
            <Route path="patient/:id" element={<SinglePatient />} />
            <Route path="family" element={<FamilyManager />} />
            <Route path="routine" element={<RoutineManager />} />
            <Route path="diet" element={<DietPreferenceManager />} />
            <Route path="reminders" element={<ReminderManager />} />
            <Route path="memories" element={<MemoriesManager />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
