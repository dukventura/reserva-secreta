import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { ModerationProvider } from './context/ModerationContext';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/HomePage';
import { CityPage } from './pages/CityPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdvertisePage } from './pages/AdvertisePage';
import { ClientSignupPage } from './pages/ClientSignupPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfessionalDashboard } from './pages/dashboard/ProfessionalDashboard';
import { ManagerDashboard } from './pages/dashboard/ManagerDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';

export function App() {
  return (
    <SessionProvider>
      <ModerationProvider>
        <BrowserRouter>
          <Routes>
            {/* Jornada publica: Navbar + Footer + portao de idade */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/cidade/:cidade" element={<CityPage />} />
              <Route path="/perfil/:id" element={<ProfilePage />} />
              <Route path="/anunciar" element={<AdvertisePage />} />
              <Route path="/cadastro" element={<ClientSignupPage />} />
              <Route path="/entrar" element={<LoginPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Paineis logados: casca propria (sidebar), sem Navbar/Footer publicos */}
            <Route path="/painel/profissional" element={<ProfessionalDashboard />} />
            <Route path="/painel/gerente" element={<ManagerDashboard />} />
            <Route path="/painel/admin" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
      </ModerationProvider>
    </SessionProvider>
  );
}

export default App;
