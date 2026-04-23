'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, UserCog, Settings2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { clearSession, getInitials } from '@/lib/auth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

function Divider() {
  return <div className="my-1 h-px bg-slate-100" />;
}

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

function MenuItem({ icon: Icon, label, href, onClick, danger = false }: MenuItemProps) {
  const base = cn(
    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
    danger
      ? 'text-red-600 hover:bg-red-50'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  );

  if (href) {
    return (
      <Link href={href} className={base} onClick={onClick}>
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </Link>
    );
  }
  return (
    <button type="button" className={base} onClick={onClick}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}

export default function UserMenu() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  function handleSignOut() {
    clearSession();
    router.push('/login');
  }

  const initials = getInitials(user?.name);
  const displayName = user?.name ?? 'Usuario';
  const displayEmail = user?.email ?? '—';

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-[10px] font-bold text-white">
          {initials}
        </div>
        <span className="max-w-[96px] truncate text-xs font-medium text-slate-700">
          {displayName}
        </span>
        <ChevronDown
          className={cn('h-3 w-3 text-slate-400 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
          {/* User info */}
          <div className="px-3 py-3">
            <p className="truncate text-xs font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-[11px] text-slate-400">{displayEmail}</p>
          </div>

          <Divider />

          {/* Nav items (moved from sidebar) */}
          <div className="p-1">
            <MenuItem
              icon={UserCog}
              label="Usuarios"
              href="/system/users"
              onClick={() => setOpen(false)}
            />
            <MenuItem
              icon={Settings2}
              label="Ajustes de la Empresa"
              href="/system/settings"
              onClick={() => setOpen(false)}
            />
          </div>

          <Divider />

          {/* Sign out */}
          <div className="p-1">
            <MenuItem
              icon={LogOut}
              label="Cerrar sesión"
              onClick={handleSignOut}
              danger
            />
          </div>
        </div>
      )}
    </div>
  );
}
