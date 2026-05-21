import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useOnboardingState() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await base44.functions.invoke('getOnboardingState', {});
    setState(res.data);
    setLoading(false);
    return res.data;
  }, []);

  return { state, loading, refresh };
}