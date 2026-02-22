// ========================================
// Journl — App Shell
// ========================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Habits from './pages/Habits';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
