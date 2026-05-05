'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { CartProvider } from '@/context/CartContext';
import ChangePasswordModal from './ChangePasswordModal';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    function onExpired() { router.push('/login'); }
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [router]);

  if (loading || user === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {user.mustChangePassword && <ChangePasswordModal />}
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader title={title} subtitle={subtitle} />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </CartProvider>
  );
}
