'use client';

import { useEffect } from 'react';
import { sendHeartbeat } from '@/services/api/hr';

const INTERVAL_MS = 60_000; // 60 seconds

export function useHeartbeat() {
  useEffect(() => {
    sendHeartbeat().catch(() => {}); // immediate ping on mount
    const id = setInterval(() => {
      sendHeartbeat().catch(() => {});
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
