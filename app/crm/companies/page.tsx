'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Building2, Search, Settings, ExternalLink } from 'lucide-react';
import { type Company } from '@/types';
import { fetchCompanies } from '@/services/api/companies';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies().then(c => {
      setCompanies(c);
      setLoading(false);
    });
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Empresas" subtitle="CRM · Directorio Corporativo">
      <div className="mb-6 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar empresas..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all">
          <Building2 className="h-4 w-4" />
          Nueva Empresa
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          ))
        ) : filteredCompanies.length > 0 ? (
          filteredCompanies.map(company => (
            <div key={company.id} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:border-indigo-100 hover:shadow-card-hover">
              <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-xl font-black text-slate-400 shadow-sm transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    {company.name.slice(0, 1).toUpperCase()}
                  </div>
                  <button className="rounded-full p-2 text-slate-300 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="truncate text-lg font-bold text-slate-800">{company.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                      {company.industry || 'General'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
                  <p className="text-xs font-semibold text-slate-400">ID: {company.id.split('-')[0].toUpperCase()}</p>
                  <button className="flex flex-row items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Ver perfil <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-500">
            <Building2 className="mx-auto mb-3 h-8 w-8 opacity-20" />
            <p className="font-medium">No se encontraron empresas</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
