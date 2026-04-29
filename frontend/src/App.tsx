import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import AreaSelector from './components/AreaSelector';
import TodayPage from './pages/TodayPage';
import TomorrowPage from './pages/TomorrowPage';
import CheapestPage from './pages/CheapestPage';
import BestWindowPage from './pages/BestWindowPage';
import SummaryPage from './pages/SummaryPage';

const queryClient = new QueryClient();

const TABS = [
  { path: '/today',       label: 'I dag' },
  { path: '/tomorrow',    label: 'I morgen' },
  { path: '/cheapest',    label: 'Billigste timer' },
  { path: '/best-window', label: 'Bedste vindue' },
  { path: '/summary',     label: 'Oversigt' },
];

function AppInner() {
  const [area, setArea] = useState<string>(() => localStorage.getItem('area') ?? 'DK2');

  const handleAreaChange = (a: string) => {
    setArea(a);
    localStorage.setItem('area', a);
    queryClient.invalidateQueries();
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAFAF9' }}>
      <Navbar area={area} />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Area selector */}
        <div className="flex justify-center mb-6">
          <AreaSelector area={area} onChange={handleAreaChange} />
        </div>

        {/* Underline-style tab bar */}
        <div className="relative mb-6">
          <div
            className="flex gap-0 overflow-x-auto no-scrollbar"
            style={{ borderBottom: '2px solid #E5E7EB' }}
          >
            {TABS.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="no-underline"
                style={({ isActive }) => ({
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#16A34A' : '#6B7280',
                  borderBottom: isActive ? '2px solid #16A34A' : '2px solid transparent',
                  marginBottom: '-2px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  textDecoration: 'none',
                  transition: 'color 0.15s, border-color 0.15s',
                  background: 'none',
                  cursor: 'pointer',
                })}
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
          {/* Fade to indicate more tabs on narrow screens */}
          <div
            className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent, #FAFAF9)' }}
          />
        </div>

        {/* Page content */}
        <Routes>
          <Route path="/"             element={<Navigate to="/today" replace />} />
          <Route path="/today"        element={<TodayPage area={area} />} />
          <Route path="/tomorrow"     element={<TomorrowPage area={area} />} />
          <Route path="/cheapest"     element={<CheapestPage area={area} />} />
          <Route path="/best-window"  element={<BestWindowPage area={area} />} />
          <Route path="/summary"      element={<SummaryPage area={area} />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
