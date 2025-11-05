
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/AdminLayout';
import VoterDashboard from './pages/VoterDashboard';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-cyan-500 to-blue-600 font-sans text-white">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, view } = useAuth();

  if (view === 'landing') {
    return <LandingPage />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user === 'admin') {
    return <AdminLayout />;
  }

  if (user.startsWith('V')) {
    return <VoterDashboard />;
  }
  
  // Fallback, though ideally this state is never reached
  return <LoginPage />;
};

export default App;
