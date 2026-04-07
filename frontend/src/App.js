import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar, { TopBar } from './components/shared/Sidebar';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/dashboard/Dashboard';
import TransactionsPage from './components/transactions/TransactionsPage';
import EMIPage from './components/emi/EMIPage';
import ReportsPage from './components/reports/ReportsPage';
import InsightsPage from './components/insights/InsightsPage';
import SettingsPage from './components/shared/SettingsPage';
import './styles/index.css';

const ProtectedLayout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
    <Route path="/transactions" element={<ProtectedLayout><TransactionsPage /></ProtectedLayout>} />
    <Route path="/emi" element={<ProtectedLayout><EMIPage /></ProtectedLayout>} />
    <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
    <Route path="/insights" element={<ProtectedLayout><InsightsPage /></ProtectedLayout>} />
    <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px', fontWeight: '500' },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
          error: { style: { background: '#fff1f2', color: '#9f1239', border: '1px solid #fecdd3' } },
        }}
      />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
