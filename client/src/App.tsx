import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';

// Theme
import theme from './theme/theme';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AgentHub from './pages/agent-hub';
import Conversations from './pages/conversations';
import Calls from './pages/calls';
import Contacts from './pages/contacts';
import Analytics from './pages/analytics';
import Integrations from './pages/settings/Integrations';

// Context
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Create a wrapper component for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};



function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="agent-hub" element={<AgentHub />} />
                <Route path="conversations" element={<Conversations />} />
                <Route path="calls" element={<Calls />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings/integrations" element={<Integrations />} />
              </Route>
              
              {/* Catch all other routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
