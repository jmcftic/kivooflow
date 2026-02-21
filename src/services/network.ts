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
  TeamDetailsResponse,
  TeamDetailsData,
  B2BCommissionsResponse,
  B2BCommissionsData,
  B2BCommission,
  ClaimB2BCommissionRequest,
  ClaimMlmTransactionRequest,
  ClaimMlmTransactionResponse,
  Claim,
  RequestAllClaimsResponse,
  TotalToClaimInUSDTResponse,
  OrdersResponse,
  Order,
  OrderClaimsResponse,
  OrderClaimItem,
  CreateManualCommissionRequest,
  ManualCommissionResponse,
  KfNotification,
  NotificationsResponse,
  MarkNotificationAsReadResponse,
  MarkAllNotificationsAsReadResponse,
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
  childUserId?: number; // Opcional: ID del usuario hijo desde el cual consultar descendientes
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

export async function getB2CNetworkExcludingB2BB2T({ level = 1, limit = 10, offset = 0, childUserId }: GetB2CNetworkParams): Promise<B2CNetworkResponse> {
  const query = {
    level,
    limit,
    offset,
    ...(childUserId !== undefined && { childUserId }),
  } as Record<string, string | number>;

  const res = await apiService.get<B2CNetworkResponse>(API_ENDPOINTS.NETWORK.B2C_EXCLUDING_B2B_B2T, query);
  return res as unknown as B2CNetworkResponse;
}

const AVAILABLE_MLM_MODELS_STORAGE_KEY = 'availableMlmModels';

/** Obtiene el user_id del usuario actual desde localStorage (sin depender de authService para evitar ciclos) */
function getCurrentUserIdFromStorage(): number | null {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    const id = user?.id ?? user?.user_id;
    if (id == null) return null;
    return typeof id === 'number' ? id : parseInt(String(id), 10);
  } catch {
    return null;
  }
}

export async function getAvailableMlmModels(forceRefresh: boolean = false): Promise<AvailableMlmModelsData> {
  // Primero verificar localStorage (a menos que se fuerce la actualización)
  if (!forceRefresh) {
    try {
      const cachedStr = localStorage.getItem(AVAILABLE_MLM_MODELS_STORAGE_KEY);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        // Validar estructura y que el cache pertenece al usuario actual
        const currentUserId = getCurrentUserIdFromStorage();
        const cacheBelongsToCurrentUser = currentUserId != null && cached?.user_id === currentUserId;
        if (cached && typeof cached === 'object' &&
          typeof cached.user_id === 'number' &&
          typeof cached.my_model === 'string' &&
          typeof cached.show_b2c_tab === 'boolean' &&
          typeof cached.show_b2t_tab === 'boolean' &&
          typeof cached.show_b2b_tab === 'boolean' &&
          cacheBelongsToCurrentUser) {
          return cached as AvailableMlmModelsData;
        }
        // Si el cache es de otro usuario, eliminarlo para evitar confusiones
        if (cached?.user_id != null && currentUserId != null && cached.user_id !== currentUserId) {
          localStorage.removeItem(AVAILABLE_MLM_MODELS_STORAGE_KEY);
        }
      }
    } catch (error) {
      // Si hay error al leer localStorage, continuar con la llamada al API
      console.warn('Error leyendo availableMlmModels del localStorage:', error);
    }
  }

  // Si no hay cache válido, hacer la llamada al API
  const res = await apiService.get<AvailableMlmModelsResponse>(API_ENDPOINTS.NETWORK.AVAILABLE_MODEL);
  const payload: any = res;
  const data = payload?.data ?? payload;

  const result: AvailableMlmModelsData = {
    user_id: data?.user_id ?? 0,
    my_model: data?.my_model ?? '',
    show_b2c_tab: data?.show_b2c_tab === true,
    show_b2t_tab: data?.show_b2t_tab === true,
    show_b2b_tab: data?.show_b2b_tab === true,
  };

  // Guardar en localStorage para próximas llamadas
  try {
    localStorage.setItem(AVAILABLE_MLM_MODELS_STORAGE_KEY, JSON.stringify(result));
  } catch (error) {
    // Si hay error al guardar, no es crítico, solo registrar
    console.warn('Error guardando availableMlmModels en localStorage:', error);
  }

  return result;
}

export interface GetNetworkLeadersParams {
  limit?: number;
  offset?: number;
}

function normalizeLeader(row: any): NetworkLeaderOwnedToB2C {
  const depth = Number(row?.depth ?? row?.Depth ?? 0) || 0;

  // Manejar team cuando viene como objeto anidado o como campos directos
  const team = row?.team ?? {};
  const teamId = row?.teamId != null
    ? Number(row?.teamId)
    : row?.team_id != null
      ? Number(row?.team_id)
      : team?.id != null
        ? Number(team.id)
        : null;
  const teamName = row?.teamName ?? row?.team_name ?? team?.name ?? null;
  const teamBannerUrl = row?.teamBannerUrl ?? row?.team_banner_url ?? team?.bannerUrl ?? null;

  // Manejar mlm cuando viene como objeto anidado o como campos directos
  const mlm = row?.mlm ?? {};
  const mlmCode = row?.mlmCode ?? row?.mlm_code ?? mlm?.code ?? null;
  const mlmName = row?.mlmName ?? row?.mlm_name ?? mlm?.name ?? null;

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
    teamId,
    teamName,
    teamBannerUrl,
    mlmCode,
    mlmName,
    isTeamLeader: typeof row?.isTeamLeader === 'boolean'
      ? row.isTeamLeader
      : row?.is_team_leader != null
        ? row?.is_team_leader === true || row?.is_team_leader === 1
        : mlm?.isTeamLeader != null
          ? mlm.isTeamLeader === true || mlm.isTeamLeader === 1
          : null,
    networkDepth: row?.networkDepth != null
      ? Number(row.networkDepth)
      : row?.network_depth != null
        ? Number(row.network_depth)
        : mlm?.networkDepth != null
          ? Number(mlm.networkDepth)
          : null,
    card1Url: row?.card1Url ?? row?.card1_url ?? mlm?.card1Url ?? null,
    card2Url: row?.card2Url ?? row?.card2_url ?? mlm?.card2Url ?? null,
    card3Url: row?.card3Url ?? row?.card3_url ?? mlm?.card3Url ?? null,
    comisiones_generadas: row?.comisiones_generadas != null ? Number(row.comisiones_generadas) : undefined,
    volumen: row?.volumen != null ? Number(row.volumen) : undefined,
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

  const result = normalizeLeadersResult(res as unknown as NetworkLeadersResponse, 'B2B', limit, offset);

  // No pre-cargar detalles de equipos automáticamente
  // Los detalles se cargarán solo cuando el usuario haga clic en "Ver detalle"

  return result;
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

/**
 * Obtiene un líder específico por userId desde la lista de líderes B2B o B2T
 */
export async function getLeaderByUserId(userId: number, type: 'B2B' | 'B2T'): Promise<NetworkLeaderOwnedToB2C | null> {
  // Buscar en la lista de líderes (puede requerir múltiples páginas si hay muchos líderes)
  let offset = 0;
  const limit = 100; // Obtener un número razonable de líderes por página

  while (true) {
    const result = type === 'B2B'
      ? await getB2BLeadersOwnedToB2C({ limit, offset })
      : await getB2TLeadersOwnedToB2C({ limit, offset });

    // Buscar el líder por userId
    const leader = result.leaders.find(l => l.userId === userId);
    if (leader) {
      return leader;
    }

    // Si no hay más páginas, no se encontró el líder
    if (!result.pagination.hasNextPage) {
      return null;
    }

    // Continuar en la siguiente página
    offset += limit;
  }
}

/**
 * Obtiene los detalles de un equipo por teamId
 * @param teamId - ID del equipo
 * @returns Datos del equipo o null si no se encuentra
 * @throws Error con código de estado si hay problemas de autenticación o autorización
 */
export async function getTeamDetails(teamId: number): Promise<TeamDetailsData | null> {
  const endpoint = apiService.buildEndpoint(API_ENDPOINTS.NETWORK.TEAM_DETAILS, { teamId });

  try {
    const res = await apiService.get<TeamDetailsResponse>(endpoint);
    const payload: any = res;
    const data = payload?.data ?? payload;

    return {
      teamName: data?.teamName ?? '',
      level: data?.level ?? 0,
      leaderEmail: data?.leaderEmail ?? '',
      leaderFullName: data?.leaderFullName ?? '',
      totalEarnings: data?.totalEarnings ?? 0,
      availableBalance: data?.availableBalance ?? 0,
      activeReferrals: data?.activeReferrals ?? 0,
      totalReferrals: data?.totalReferrals ?? 0,
      totalVolume: data?.totalVolume ?? 0,
    };
  } catch (error: any) {
    // El apiService ya maneja los errores 401, 403, 404 automáticamente
    // Solo necesitamos propagar el error o retornar null según sea necesario
    if (error?.status === 404) {
      return null;
    }
    throw error;
  }
}

export interface GetClaimsParams {
  page?: number;
  pageSize?: number;
  /**
   * Estado o estados a filtrar. Soporta múltiples formatos:
   * - Array: ['claimed', 'requested']
   * - String con comas: 'claimed,requested'
   * - String con &: 'claimed&requested'
   */
  status?: string | string[];
  claimType?: 'B2C' | 'B2B' | 'B2T';
}

export async function getClaims({ page = 1, pageSize = 10, status, claimType }: GetClaimsParams = {}): Promise<ClaimsResponse> {
  const query: Record<string, string | string[]> = {
    page: page.toString(),
    pageSize: pageSize.toString(),
  };

  // Agregar status si se proporciona
  // Soporta múltiples formatos:
  // - Array: ['claimed', 'requested']
  // - String con comas: 'claimed,requested'
  // - String con &: 'claimed&requested'
  if (status) {
    if (Array.isArray(status)) {
      // Si ya es un array, pasarlo directamente
      query.status = status;
    } else if (typeof status === 'string') {
      // Si es un string, dividir por comas o &
      const statusArray = status.split(/[&,]/).map(s => s.trim()).filter(s => s.length > 0);
      if (statusArray.length > 0) {
        query.status = statusArray;
      }
    }
  }

  // Agregar claimType si se proporciona
  if (claimType) {
    query.claimType = claimType;
  }

  const res = await apiService.get<ClaimsApiResponse>(
    API_ENDPOINTS.NETWORK.CLAIMS,
    query,
  );

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    summary: data?.summary ?? null,
    items: data?.items ?? [],
    pagination: data?.pagination ?? {
      page: page,
      pageSize: pageSize,
      total: 0,
      totalPages: 0,
    },
  };
}

export interface GetB2BCommissionsParams {
  limit?: number;
  offset?: number;
}

export async function getB2BCommissions({ limit = 20, offset = 0 }: GetB2BCommissionsParams = {}): Promise<B2BCommissionsData> {
  const query: Record<string, number> = {
    limit,
    offset,
  };

  const res = await apiService.get<B2BCommissionsResponse>(
    API_ENDPOINTS.NETWORK.B2B_COMMISSIONS,
    query,
  );

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    total: data?.total ?? 0,
    available: data?.available ?? 0,
    commissions: data?.commissions ?? [],
    pagination: data?.pagination ?? {
      totalPages: 1,
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    summary: data?.summary ?? null,
  };
}

// Función materializeB2BCommission eliminada - ya no es necesaria
// Las comisiones se crean automáticamente cuando se consultan por primera vez

export async function claimB2BCommission(request: ClaimB2BCommissionRequest): Promise<B2BCommission> {
  const res = await apiService.post<{ statusCode: number; message: string; data: B2BCommission }>(
    API_ENDPOINTS.NETWORK.CLAIM_B2B_COMMISSION,
    request,
  );

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    id: data?.id ?? 0, // Ya no es nullable, siempre tiene ID
    teamId: data?.teamId ?? 0,
    teamName: data?.teamName ?? '',
    level: data?.level ?? 0,
    commissionPercentage: data?.commissionPercentage ?? 0,
    periodType: data?.periodType ?? 'biweekly', // Cambiado de 'monthly' a 'biweekly'
    periodStartDate: data?.periodStartDate ?? '',
    periodEndDate: data?.periodEndDate ?? '',
    totalVolume: data?.totalVolume ?? 0,
    commissionAmount: data?.commissionAmount ?? 0,
    totalTransactions: data?.totalTransactions ?? 0,
    currency: data?.currency ?? 'USDT',
    status: data?.status ?? '',
    calculationDetails: data?.calculationDetails,
    createdAt: data?.createdAt ?? new Date().toISOString(),
    commissionType: data?.commissionType,
    userEmail: data?.userEmail || data?.calculationDetails?.userEmail,
    isMaterialized: data?.isMaterialized ?? true, // Siempre será true ahora
  };
}

export async function claimMlmTransaction(request: ClaimMlmTransactionRequest): Promise<ClaimMlmTransactionResponse> {
  const res = await apiService.post<{ statusCode: number; message: string; data: Claim }>(
    API_ENDPOINTS.NETWORK.CLAIM_MLM_TRANSACTION,
    request,
  );

  const payload: any = res;
  const message = payload?.message || 'Comisión reclamada exitosamente';
  const data = payload?.data ?? payload;

  const claim: Claim = {
    id: data?.id ?? 0,
    userId: data?.userId ?? 0,
    commissionType: data?.commissionType ?? '',
    baseAmount: data?.baseAmount ?? 0,
    commissionPercentage: data?.commissionPercentage !== undefined ? data.commissionPercentage : null,
    commissionAmount: data?.commissionAmount ?? 0,
    leaderMarkupAmount: data?.leaderMarkupAmount ?? null,
    markupPercentage: data?.markupPercentage ?? null,
    currency: data?.currency ?? 'USDT',
    status: data?.status ?? '',
    cryptoTransactionId: data?.cryptoTransactionId ?? null,
    createdAt: data?.createdAt ?? new Date().toISOString(),
    concept: data?.concept,
    creationType: data?.creationType,
    userCreatorId: data?.userCreatorId ?? null,
    calculationDetails: data?.calculationDetails,
    ...data, // Incluir otros campos adicionales (esto sobrescribirá los campos anteriores si vienen en data)
  };

  return {
    claim,
    message,
  };
}

export async function requestAllClaims(claimType?: 'mlm_transactions' | 'b2c_commissions'): Promise<RequestAllClaimsResponse> {
  // Construir los parámetros de query si se proporciona claimType
  const queryParams = claimType ? `?claimType=${claimType}` : '';

  const res = await apiService.post<RequestAllClaimsResponse>(
    `${API_ENDPOINTS.NETWORK.REQUEST_ALL_CLAIMS}${queryParams}`,
    {},
  );

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    statusCode: payload?.statusCode ?? 200,
    message: payload?.message ?? 'Comisiones solicitadas exitosamente',
    data: {
      success: data?.success ?? true,
      message: data?.message ?? '',
      mlmTransactionsRequested: data?.mlmTransactionsRequested ?? 0,
      b2cFromB2BCommissionsRequested: data?.b2cFromB2BCommissionsRequested ?? 0,
      totalRequested: data?.totalRequested ?? 0,
      errors: data?.errors ?? [],
    },
  };
}

export async function getTotalToClaimInUSDT(claimType?: 'mlm_transactions' | 'b2c_commissions'): Promise<TotalToClaimInUSDTResponse> {
  // Construir los parámetros de query si se proporciona claimType
  const query: Record<string, string> = {};
  if (claimType) {
    query.claimType = claimType;
  }

  const res = await apiService.get<TotalToClaimInUSDTResponse>(
    API_ENDPOINTS.NETWORK.TOTAL_USDT,
    query,
  );
  const payload: any = res;
  const data = payload?.data ?? payload;
  return {
    statusCode: payload?.statusCode ?? 200,
    message: payload?.message ?? 'Total calculado exitosamente',
    data: {
      totalInUSDT: data?.totalInUSDT ?? 0,
      mlmTransactionsTotal: data?.mlmTransactionsTotal ?? 0,
      b2cCommissionsTotalMXN: data?.b2cCommissionsTotalMXN ?? 0,
      b2cCommissionsTotalUSDT: data?.b2cCommissionsTotalUSDT ?? 0,
      mlmTransactionsCount: data?.mlmTransactionsCount ?? 0,
      b2cCommissionsCount: data?.b2cCommissionsCount ?? 0,
      exchangeRateMXNToUSDT: data?.exchangeRateMXNToUSDT ?? 17.5,
      userEmail: data?.userEmail,
    },
  };
}

export interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  /**
   * Estado o estados a filtrar. Soporta múltiples formatos:
   * - Array: ['pending', 'paid']
   * - String con comas: 'pending,paid'
   */
  status?: string | string[];
  claimType?: 'B2C' | 'B2B';
}

export async function getOrders({
  page = 1,
  pageSize = 10,
  status,
  claimType
}: GetOrdersParams = {}): Promise<OrdersResponse> {
  const query: Record<string, string | string[]> = {
    page: page.toString(),
    pageSize: pageSize.toString(),
  };

  // Agregar status si se proporciona
  if (status) {
    if (Array.isArray(status)) {
      query.status = status;
    } else if (typeof status === 'string') {
      const statusArray = status.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (statusArray.length > 0) {
        query.status = statusArray;
      }
    }
  }

  // Agregar claimType si se proporciona
  if (claimType) {
    query.claimType = claimType;
  }

  const res = await apiService.get<OrdersResponse>(
    API_ENDPOINTS.NETWORK.ORDERS,
    query,
  );

  return res as unknown as OrdersResponse;
}

export interface GetOrderClaimsParams {
  orderId: number;
  claimType?: 'B2C' | 'B2B';
  /**
   * Estado o estados a filtrar. Soporta múltiples formatos:
   * - Array: ['available', 'requested', 'claimed']
   * - String con comas: 'available,requested'
   */
  status?: string | string[];
}

export async function getOrderClaims({
  orderId,
  claimType,
  status
}: GetOrderClaimsParams): Promise<OrderClaimsResponse> {
  const query: Record<string, string | string[]> = {};

  // Agregar claimType si se proporciona
  if (claimType) {
    query.claimType = claimType;
  }

  // Agregar status si se proporciona
  if (status) {
    if (Array.isArray(status)) {
      query.status = status;
    } else if (typeof status === 'string') {
      const statusArray = status.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (statusArray.length > 0) {
        query.status = statusArray;
      }
    }
  }

  const endpoint = apiService.buildEndpoint(API_ENDPOINTS.NETWORK.ORDER_CLAIMS, { id: orderId });
  const res = await apiService.get<any>(endpoint, query);

  const payload: any = res;
  const data = payload?.data ?? payload;

  // Mapear la respuesta del API a nuestro tipo
  return {
    statusCode: payload?.statusCode ?? 200,
    message: payload?.message ?? 'Claims de la orden obtenidas exitosamente',
    data: {
      orderId: data?.orderId ?? orderId,
      orderStatus: data?.orderStatus ?? 'pending',
      orderTotalAmount: data?.orderTotalAmount ?? 0,
      items: (data?.items ?? []).map((item: any) => ({
        id: item.id ?? 0,
        baseTransactionId: item.baseTransactionId ?? null,
        cryptoTransactionId: item.cryptoTransactionId ?? null,
        userId: item.userId ?? 0,
        teamId: item.teamId ?? null,
        commissionType: item.commissionType ?? '',
        baseAmount: item.baseAmount ?? 0,
        commissionPercentage: item.commissionPercentage ?? null,
        commissionAmount: item.commissionAmount ?? 0,
        markupPercentage: item.markupPercentage ?? null,
        leaderMarkupAmount: item.leaderMarkupAmount ?? null,
        currency: item.currency ?? 'USDT',
        status: item.status ?? 'available',
        processedAt: item.processedAt ?? null,
        createdAt: item.createdAt ?? new Date().toISOString(),
        origin: item.origin ?? (item.mlmTransactionId ? 'mlm_transaction' : 'b2c_from_b2b_commission'),
        calculationDetails: item.calculationDetails ?? {},
      })),
      total: data?.total ?? 0,
    },
  };
}

export async function createManualCommission(request: CreateManualCommissionRequest): Promise<ManualCommissionResponse> {
  const res = await apiService.post<ManualCommissionResponse>(
    API_ENDPOINTS.NETWORK.MANUAL_COMMISSIONS,
    request,
  );

  const payload: any = res;
  const message = payload?.message || 'Comisión manual creada exitosamente';
  const data = payload?.data ?? payload;

  return {
    statusCode: payload?.statusCode ?? 201,
    message,
    data: data as Claim,
  };
}

export interface GetUserNotificationsParams {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}

export async function getUserNotifications({
  page = 1,
  pageSize = 20,
  isRead,
}: GetUserNotificationsParams = {}): Promise<NotificationsResponse> {
  const query: Record<string, string | number> = {
    page: page.toString(),
    pageSize: pageSize.toString(),
  };

  if (isRead !== undefined) {
    query.isRead = isRead.toString();
  }

  const res = await apiService.get<NotificationsResponse>(
    API_ENDPOINTS.NETWORK.NOTIFICATIONS,
    query,
  );

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    statusCode: payload?.statusCode ?? 200,
    message: payload?.message ?? 'Notificaciones obtenidas exitosamente',
    data: {
      notifications: (data?.notifications ?? []).map((notif: any) => ({
        id: notif.id ?? 0,
        userId: notif.userId ?? 0,
        title: notif.title ?? '',
        message: notif.message ?? '',
        body: notif.body ?? '',
        type: notif.type as 'info' | 'success' | 'warning' | 'error' | undefined,
        isRead: notif.isRead ?? false,
        metadata: notif.metadata ?? {},
        createdAt: notif.createdAt ?? new Date().toISOString(),
        updatedAt: notif.updatedAt ?? new Date().toISOString(),
        deletedAt: notif.deletedAt ?? null,
      })),
      total: data?.total ?? 0,
      unreadCount: data?.unreadCount ?? 0,
      page: data?.page ?? page,
      pageSize: data?.pageSize ?? pageSize,
    },
  };
}

export async function markNotificationAsRead(notificationId: number): Promise<MarkNotificationAsReadResponse> {
  const endpoint = apiService.buildEndpoint(API_ENDPOINTS.NETWORK.NOTIFICATION_MARK_READ, { id: notificationId });
  const res = await apiService.put<MarkNotificationAsReadResponse>(endpoint, {});

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    statusCode: payload?.statusCode ?? 200,
    message: payload?.message ?? 'Notificación marcada como leída exitosamente',
    data: {
      id: data?.id ?? notificationId,
      userId: data?.userId ?? 0,
      title: data?.title ?? '',
      message: data?.message ?? '',
      body: data?.body ?? '',
      type: data?.type as 'info' | 'success' | 'warning' | 'error' | undefined,
      isRead: data?.isRead ?? true,
      metadata: data?.metadata ?? {},
      createdAt: data?.createdAt ?? new Date().toISOString(),
      updatedAt: data?.updatedAt ?? new Date().toISOString(),
      deletedAt: data?.deletedAt ?? null,
    },
  };
}

export async function markAllNotificationsAsRead(): Promise<MarkAllNotificationsAsReadResponse> {
  const res = await apiService.put<MarkAllNotificationsAsReadResponse>(
    API_ENDPOINTS.NETWORK.NOTIFICATIONS_MARK_ALL_READ,
    {},
  );

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    statusCode: payload?.statusCode ?? 200,
    message: payload?.message ?? 'Todas las notificaciones marcadas como leídas exitosamente',
    data: {
      updatedCount: data?.updatedCount ?? 0,
    },
  };
}

export interface TestingUserResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    email: string;
    full_name: string;
    document_type: string;
    document_number: string;
    phone: string;
    country_code: string;
    dial_code: string;
    address?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
    referral_code: string;
    referred_by_code?: string;
    is_email_verified: boolean;
    is_phone_verified: boolean;
    is_document_verified: boolean;
    has_card: boolean;
    status: string;
    created_at: string;
    updated_at: string;
    last_login?: string;
    mlm_model?: string;
    network_model?: string;
  };
}

export async function getTestingUser(): Promise<TestingUserResponse> {
  const res = await apiService.get<TestingUserResponse>(
    API_ENDPOINTS.NETWORK.TESTING_USER,
  );

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    statusCode: payload?.statusCode ?? 200,
    message: payload?.message ?? 'Usuario obtenido exitosamente',
    data: data,
  };
}

export interface ResetUserClaimsResponse {
  statusCode: number;
  message: string;
  data: {
    userId: number;
    claimsReset: number;
    message: string;
  };
}

export async function resetUserClaims(userId: number): Promise<ResetUserClaimsResponse> {
  const endpoint = apiService.buildEndpoint(API_ENDPOINTS.NETWORK.RESET_USER_CLAIMS, { userId });
  const res = await apiService.post<ResetUserClaimsResponse>(endpoint, {});

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    statusCode: payload?.statusCode ?? 200,
    message: payload?.message ?? 'Claims reseteados exitosamente',
    data: {
      userId: data?.userId ?? userId,
      claimsReset: data?.claimsReset ?? 0,
      message: data?.message ?? 'Claims reseteados exitosamente',
    },
  };
}

