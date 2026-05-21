import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function AppLayout({ children, requiredRoles }) {
  const { authUser, userRecord, organization, loading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!authUser) {
      navigate('/login');
      return;
    }
    if (requiredRoles && userRecord && !requiredRoles.includes(userRecord.role)) {
      navigate('/dashboard');
    }
  }, [authUser, userRecord, loading, navigate, requiredRoles]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar userRecord={userRecord} organization={organization} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}