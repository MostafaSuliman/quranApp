/**
 * Network Hook
 * Provides network state to components
 */

import { useState, useEffect } from 'react';
import { networkService } from '../services/network';
import type { NetworkState } from '../types/api';

export function useNetwork(): NetworkState & { isOffline: boolean } {
  const [state, setState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
  });

  useEffect(() => {
    const unsubscribe = networkService.addListener((newState) => {
      setState(newState);
    });

    return () => unsubscribe();
  }, []);

  return {
    ...state,
    isOffline: !state.isConnected,
  };
}
