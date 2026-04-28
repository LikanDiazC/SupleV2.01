'use client';

import { useState, useEffect } from 'react';
import { type Contact, type Company, type Bom } from '@/types';
import { fetchContacts } from '@/services/api/contacts';
import { fetchCompanies } from '@/services/api/companies';
import { fetchBoms } from '@/services/api/boms';

interface FormOptions {
  contacts: Contact[];
  companies: Company[];
  boms: Bom[];
  loading: boolean;
}

export function useFormOptions(enabled = true): FormOptions {
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [boms, setBoms]           = useState<Bom[]>([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    Promise.all([fetchContacts(), fetchCompanies(), fetchBoms()])
      .then(([c, co, b]) => {
        setContacts(c);
        setCompanies(co);
        setBoms(b);
      })
      .finally(() => setLoading(false));
  }, [enabled]);

  return { contacts, companies, boms, loading };
}
