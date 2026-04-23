'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Inbox,
  ClipboardList,
  Package,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredUser } from '@/lib/auth';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'GENERAL',
    items: [
      { label: 'Inicio', href: '/overview', icon: LayoutDashboard },
    ],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Pipeline',   href: '/crm/pipeline',  icon: BarChart3   },
      { label: 'Contactos',  href: '/crm/contacts',  icon: Users       },
      { label: 'Empresas',   href: '/crm/companies', icon: Building2   },
      { label: 'Inbox',      href: '/crm/inbox',     icon: Inbox       },
    ],
  },
  {
    title: 'PRODUCCIÓN',
    items: [
      { label: 'Órdenes',        href: '/scm/orders',    icon: ClipboardList },
      { label: 'Inventario',     href: '/scm/inventory', icon: Package       },
      { label: 'Recetas (BOMs)', href: '/scm/boms',      icon: BookOpen      },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-brand-50 text-brand-600'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'
        )}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-semibold text-white">
          {item.badge}
        </span>
      )}
      {isActive && <ChevronRight className="h-3 w-3 text-brand-400" />}
    </Link>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [tenantName, setTenantName] = useState('Cargando empresa...');

  useEffect(() => {
    const user = getStoredUser();
    if (user?.tenantName) setTenantName(user.tenantName);
  }, []);

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-100 bg-white">
      {/* Logo */}
      <div className="flex h-16 shrink-0 flex-col justify-center border-b border-slate-100 px-5">
        <p className="text-lg font-bold tracking-tight text-slate-900">Suple</p>
        <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {tenantName}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
