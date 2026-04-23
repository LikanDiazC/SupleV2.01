'use client';

import { useState, useEffect } from 'react';
import { type Contact, type Company, type Product } from '@/types';
import { fetchContacts } from '@/services/api/contacts';
import { fetchCompanies } from '@/services/api/companies';
import { fetchProducts } from '@/services/api/products';

interface FormOptions {
  contacts: Contact[];
  companies: Company[];
  products: Product[];
  loading: boolean;
}

export function useFormOptions(enabled = true): FormOptions {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    Promise.all([fetchContacts(), fetchCompanies(), fetchProducts()])
      .then(([c, co, p]) => {
        setContacts(c);
        setCompanies(co);
        setProducts(p);
      })
      .finally(() => setLoading(false));
  }, [enabled]);

  return { contacts, companies, products, loading };
}
