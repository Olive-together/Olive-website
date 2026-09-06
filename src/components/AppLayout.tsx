import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';

export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
