import { useState } from 'react';
import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/Clients/ClientList';
import ClientProfile from './pages/Clients/ClientProfile';
import Interactions from './pages/Interactions/Interactions';
import Tasks from './pages/Tasks/Tasks';
import KnowledgeBase from './pages/KnowledgeBase/KnowledgeBase';
import IntrospectionLogs from './pages/IntrospectionLogs/IntrospectionLogs';
import MacroDashboard from './pages/MacroDashboard/MacroDashboard';
import SOPs from './pages/SOPs/SOPs';
import AIAssistant from './pages/AIAssistant/AIAssistant';
import WorkTracker from './pages/WorkTracker/WorkTracker';

function AppLayout() {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: theme.pageBg, fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/:id" element={<ClientProfile />} />
            <Route path="/interactions" element={<Interactions />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/introspection" element={<IntrospectionLogs />} />
            <Route path="/macro" element={<MacroDashboard />} />
            <Route path="/sops" element={<SOPs />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/tracker" element={<WorkTracker />} />
          </Routes>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.fog}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.steel}; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${theme.isDark ? 'invert(1)' : 'none'}; }
      `}</style>
    </div>
  );
}

function AppContent() {
  const { user, ready } = useAuth();
  const theme = useTheme();
  if (!ready) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: theme.pageBg, fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <div style={{ color: theme.steel, fontSize: '13px' }}>Loading…</div>
    </div>
  );
  if (!user) return <Login />;
  return <AppLayout />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
