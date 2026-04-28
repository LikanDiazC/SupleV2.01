'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Mail, Phone, Building2, Search } from 'lucide-react';
import { type Contact } from '@/types';
import { fetchContacts } from '@/services/api/contacts';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts().then(c => {
      setContacts(c);
      setLoading(false);
    });
  }, []);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Contactos" subtitle="CRM · Directorio">
      <div className="mb-6 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar contactos..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all">
          <Users className="h-4 w-4" />
          Nuevo Contacto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          ))
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <div key={contact.id} className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition-all hover:-translate-y-1 hover:border-slate-200 hover:shadow-card-hover">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 text-base font-bold text-indigo-600 shadow-sm">
                  {contact.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-slate-800">{contact.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{contact.companyId || 'Sin Empresa'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{contact.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{contact.phone || '—'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-500">
            <Users className="mx-auto mb-3 h-8 w-8 opacity-20" />
            <p className="font-medium">No se encontraron contactos</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
