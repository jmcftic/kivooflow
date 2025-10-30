import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { NetworkResponse } from '@/types/network';

export interface GetNetworkParams {
  levelStart: number;
  levelEnd: number;
  usersLimit: number;
  usersOffset: number;
}

export async function getNetwork(params: GetNetworkParams): Promise<NetworkResponse> {
  const query = {
    levelStart: params.levelStart,
    levelEnd: params.levelEnd,
    usersLimit: params.usersLimit,
    usersOffset: params.usersOffset,
  } as Record<string, string | number>;

  const res = await apiService.get<NetworkResponse>(API_ENDPOINTS.NETWORK.GET, query);
  return res as unknown as NetworkResponse; // el apiService puede envolver respuestas
}


