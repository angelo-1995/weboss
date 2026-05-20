'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Network } from '../types/network.types';

const NETWORKS_KEY = 'networks';

export function useNetworks() {
  return useQuery({
    queryKey: [NETWORKS_KEY],
    queryFn: () => api.get<Network[]>('/networks'),
    staleTime: 60_000,
  });
}
