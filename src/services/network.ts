import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { NetworkResponse, DescendantSubtreeResponse } from '@/types/network';

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

export interface GetSubtreeParams {
  descendantId: number;
  maxDepth?: number; // default 3
  limit?: number; // default 100
  offset?: number; // default 0
}

export async function getDescendantSubtree({ descendantId, maxDepth = 3, limit = 100, offset = 0 }: GetSubtreeParams): Promise<DescendantSubtreeResponse> {
  const endpoint = apiService.buildEndpoint(API_ENDPOINTS.NETWORK.SUBTREE, { descendantId });
  const res = await apiService.get<DescendantSubtreeResponse>(endpoint, { maxDepth, limit, offset });
  return res as unknown as DescendantSubtreeResponse;
}


