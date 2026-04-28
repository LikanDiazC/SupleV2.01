'use client';

import { useState, useEffect, useCallback } from 'react';
import { type TeamMember } from '@/types';
import { fetchTeam } from '@/services/api/hr';

interface UseTeamReturn {
  team:          TeamMember[];
  loading:       boolean;
  error:         string | null;
  notRegistered: boolean;
  isEmployee:    boolean;
  refresh:       () => Promise<void>;
}

export function useTeam(): UseTeamReturn {
  const [team, setTeam]                   = useState<TeamMember[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);
  const [isEmployee, setIsEmployee]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotRegistered(false);
    setIsEmployee(false);
    try {
      const result = await fetchTeam();
      setTeam(result.team);
      setNotRegistered(result.notRegistered ?? false);
      setIsEmployee(result.isEmployee ?? false);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar el equipo');
      setTeam([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { team, loading, error, notRegistered, isEmployee, refresh: load };
}
