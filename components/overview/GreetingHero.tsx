'use client';

import { useEffect, useState } from 'react';
import { Sun, Sunset, Moon } from 'lucide-react';

function getGreeting(): { text: string; icon: React.ElementType } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12)  return { text: 'Buenos días',   icon: Sun    };
  if (hour >= 12 && hour < 20) return { text: 'Buenas tardes', icon: Sunset };
  return                               { text: 'Buenas noches', icon: Moon   };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function GreetingHero() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const greeting = getGreeting();
  const Icon = greeting.icon;

  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <Icon className="h-5 w-5 text-amber-400" />
          <span className="text-sm font-medium text-slate-400">{greeting.text}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Hola, Likan 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Aquí tienes el resumen de tu empresa hoy.
        </p>
      </div>

      {now && (
        <div className="hidden text-right md:block">
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">Hoy</p>
          <p className="text-sm font-semibold capitalize text-slate-700">{formatDate(now)}</p>
        </div>
      )}
    </div>
  );
}
