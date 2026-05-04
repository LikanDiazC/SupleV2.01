'use client';

import { useEffect, useState } from 'react';

export type ExtensionStatus = 'unknown' | 'installed' | 'not_installed';

export function useExtensionStatus(): ExtensionStatus {
  const [status, setStatus] = useState<ExtensionStatus>('unknown');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'SUPLEV_ACK') {
        clearTimeout(timer);
        window.removeEventListener('message', handleMessage);
        setStatus('installed');
      }
    }

    window.addEventListener('message', handleMessage);
    window.postMessage({ type: 'SUPLEV_PING' }, '*');

    timer = setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      setStatus('not_installed');
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return status;
}
