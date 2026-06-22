import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Laptop } from 'lucide-react';
import { useState } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const appContent = !isAuthenticated ? (
    <AuthPage onLogin={() => setIsAuthenticated(true)} />
  ) : (
    <BrowserRouter basename="/moodtracker">
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );

  return (
    <>
      <div className="mobile-fallback">
        <div className="mobile-fallback-icon">{<Laptop />}</div>
        <h1>Desktop Only</h1>
        <p>
          This application is highly detailed and optimized for larger screens. 
          Please use a computer or tablet in landscape mode.
        </p>
      </div>

      <div className="app-content">
        {appContent}
      </div>
    </>
  );
}