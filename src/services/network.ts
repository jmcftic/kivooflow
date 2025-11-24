import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import {
  NetworkResponse,
  DescendantSubtreeResponse,
  B2CNetworkResponse,
  AvailableMlmModelsData,
  AvailableMlmModelsResponse,
  NetworkLeadersResponse,
  NetworkLeadersResult,
  NetworkLeaderOwnedToB2C,
  NetworkLeadersPagination,
  ClaimsResponse,
  ClaimsApiResponse,
} from '@/types/network';

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

export interface GetB2CNetworkParams {
  level?: number; // default 1
  limit?: number; // default 10
  offset?: number; // default 0
}

export async function getSingleLevelNetwork({ level = 1, limit = 10, offset = 0 }: GetB2CNetworkParams): Promise<B2CNetworkResponse> {
  const query = {
    level,
    limit,
    offset,
  } as Record<string, string | number>;

  const res = await apiService.get<B2CNetworkResponse>(API_ENDPOINTS.NETWORK.SINGLE_LEVEL, query);
  return res as unknown as B2CNetworkResponse;
}

export async function getB2CNetworkExcludingB2BB2T({ level = 1, limit = 10, offset = 0 }: GetB2CNetworkParams): Promise<B2CNetworkResponse> {
  const query = {
    level,
    limit,
    offset,
  } as Record<string, string | number>;

  const res = await apiService.get<B2CNetworkResponse>(API_ENDPOINTS.NETWORK.B2C_EXCLUDING_B2B_B2T, query);
  return res as unknown as B2CNetworkResponse;
}

export async function getAvailableMlmModels(): Promise<AvailableMlmModelsData> {
  const res = await apiService.get<AvailableMlmModelsResponse>(API_ENDPOINTS.NETWORK.AVAILABLE_MODEL);
  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    user_id: data?.user_id ?? 0,
    my_model: data?.my_model ?? '',
    show_b2c_tab: data?.show_b2c_tab === true,
    show_b2t_tab: data?.show_b2t_tab === true,
    show_b2b_tab: data?.show_b2b_tab === true,
  };
}

export interface GetNetworkLeadersParams {
  limit?: number;
  offset?: number;
}

function normalizeLeader(row: any): NetworkLeaderOwnedToB2C {
  const depth = Number(row?.depth ?? row?.Depth ?? 0) || 0;

  return {
    userId: Number(row?.userId ?? row?.user_id ?? row?.descendant_id ?? 0),
    depth,
    fullName: row?.fullName ?? row?.full_name ?? '',
    email: row?.email ?? '',
    phone: row?.phone ?? null,
    referralCode: row?.referralCode ?? row?.referral_code ?? '',
    profileIconUrl: row?.profileIconUrl ?? row?.profile_icon_url ?? null,
    isEnterprice: row?.isEnterprice ?? row?.is_enterprice ?? false,
    status: row?.status ?? '',
    createdAt: row?.createdAt ?? row?.created_at ?? '',
    parentName: row?.parentName ?? row?.parent_name ?? null,
    parentReferralCode: row?.parentReferralCode ?? row?.parent_referral_code ?? null,
    teamId: row?.teamId != null ? Number(row?.teamId) : row?.team_id != null ? Number(row?.team_id) : null,
    teamName: row?.teamName ?? row?.team_name ?? null,
    teamBannerUrl: row?.teamBannerUrl ?? row?.team_banner_url ?? null,
    mlmCode: row?.mlmCode ?? row?.mlm_code ?? null,
    mlmName: row?.mlmName ?? row?.mlm_name ?? null,
    isTeamLeader: typeof row?.isTeamLeader === 'boolean'
      ? row.isTeamLeader
      : row?.is_team_leader != null
        ? row?.is_team_leader === true || row?.is_team_leader === 1
        : null,
    networkDepth: row?.networkDepth != null
      ? Number(row.networkDepth)
      : row?.network_depth != null
        ? Number(row.network_depth)
        : null,
    card1Url: row?.card1Url ?? row?.card1_url ?? null,
    card2Url: row?.card2Url ?? row?.card2_url ?? null,
    card3Url: row?.card3Url ?? row?.card3_url ?? null,
  };
}

function normalizePagination(limit: number, offset: number, total: number, pagination?: Partial<NetworkLeadersPagination>): NetworkLeadersPagination {
  if (pagination && typeof pagination.totalPages === 'number') {
    return {
      totalPages: Number(pagination.totalPages),
      currentPage: Number(pagination.currentPage ?? Math.floor(offset / limit) + 1),
      hasNextPage: Boolean(pagination.hasNextPage),
      hasPreviousPage: Boolean(pagination.hasPreviousPage),
    };
  }

  const safeLimit = limit > 0 ? limit : 1;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const currentPage = Math.max(1, Math.floor(offset / safeLimit) + 1);

  return {
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

function normalizeLeadersResult(
  payload: NetworkLeadersResponse | NetworkLeadersResult | undefined,
  fallbackType: 'B2B' | 'B2T',
  limit: number,
  offset: number,
): NetworkLeadersResult {
  const data: any = (payload as NetworkLeadersResponse)?.data ?? payload ?? {};
  const resolvedLimit = data?.limit != null ? Number(data.limit) : limit;
  const resolvedOffset = data?.offset != null ? Number(data.offset) : offset;
  const total = data?.total != null ? Number(data.total) : 0;
  const leadersArray = Array.isArray(data?.leaders) ? data.leaders : [];

  const leaders = leadersArray.map(normalizeLeader);
  const pagination = normalizePagination(resolvedLimit, resolvedOffset, total, data?.pagination);

  return {
    type: (data?.type as 'B2B' | 'B2T') ?? fallbackType,
    total,
    limit: resolvedLimit,
    offset: resolvedOffset,
    pagination,
    leaders,
  };
}

export async function getB2BLeadersOwnedToB2C({ limit = 20, offset = 0 }: GetNetworkLeadersParams = {}): Promise<NetworkLeadersResult> {
  const query = {
    limit,
    offset,
  } as Record<string, number>;

  const res = await apiService.get<NetworkLeadersResponse>(
    API_ENDPOINTS.NETWORK.B2B_LEADERS_OWNED_TO_B2C,
    query,
  );

  return normalizeLeadersResult(res as unknown as NetworkLeadersResponse, 'B2B', limit, offset);
}

export async function getB2TLeadersOwnedToB2C({ limit = 20, offset = 0 }: GetNetworkLeadersParams = {}): Promise<NetworkLeadersResult> {
  const query = {
    limit,
    offset,
  } as Record<string, number>;

  const res = await apiService.get<NetworkLeadersResponse>(
    API_ENDPOINTS.NETWORK.B2T_LEADERS_OWNED_TO_B2C,
    query,
  );

  return normalizeLeadersResult(res as unknown as NetworkLeadersResponse, 'B2T', limit, offset);
}

export interface GetClaimsParams {
  page?: number;
  pageSize?: number;
  status?: string | string[]; // Puede ser un estado o múltiples estados separados por comas
}

export async function getClaims({ page = 1, pageSize = 10, status }: GetClaimsParams = {}): Promise<ClaimsResponse> {
  const query: Record<string, string> = {
    page: page.toString(),
    pageSize: pageSize.toString(),
  };

  // Agregar status si se proporciona
  if (status) {
    if (Array.isArray(status)) {
      query.status = status.join(',');
    } else {
      query.status = status;
    }
  }

  const res = await apiService.get<ClaimsApiResponse>(
    API_ENDPOINTS.NETWORK.CLAIMS,
    query,
  );

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    items: data?.items ?? [],
    pagination: data?.pagination ?? {
      page: page,
      pageSize: pageSize,
      total: 0,
      totalPages: 0,
    },
  };
}

