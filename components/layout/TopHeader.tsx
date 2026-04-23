'use client';

import { useState } from 'react';
import { Search, Bell, Command } from 'lucide-react';
import UserMenu from './UserMenu';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
}

export default function TopHeader({ title, subtitle }: TopHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
      {/* Page title */}
      <div>
        <h1 className="text-[15px] font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-150 ${
            searchFocused
              ? 'border-brand-300 bg-white shadow-sm ring-2 ring-brand-100'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-44 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
          <div className="flex items-center gap-0.5 rounded border border-slate-200 px-1 py-0.5">
            <Command className="h-2.5 w-2.5 text-slate-400" />
            <span className="text-[10px] text-slate-400">K</span>
          </div>
        </div>

        {/* Notifications */}
        <button
          aria-label="Notificaciones"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Bell className="h-4 w-4 text-slate-500" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
        </button>

        {/* User menu dropdown */}
        <UserMenu />
      </div>
    </header>
  );
}
