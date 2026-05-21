import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { Toaster as Sonner } from 'sonner';

// Pages
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import CompanyProfile from './pages/CompanyProfile';
import ICPs from './pages/ICPs';
import Team from './pages/Team';
import SuperAdmin from './pages/SuperAdmin';
import AcceptInvite from './pages/AcceptInvite';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/company-profile" element={<CompanyProfile />} />
      <Route path="/icps" element={<ICPs />} />
      <Route path="/team" element={<Team />} />
      <Route path="/super-admin" element={<SuperAdmin />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <Sonner position="bottom-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;