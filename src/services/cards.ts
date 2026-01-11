import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { MisTarjetasResponse, MisTarjetasApiResponse } from '@/types/card';

export async function getMisTarjetas(): Promise<MisTarjetasResponse> {
  const res = await apiService.get<MisTarjetasApiResponse>(
    API_ENDPOINTS.CARDS.MIS_TARJETAS
  );

  const payload: any = res;
  const data = payload?.data ?? payload;

  return {
    cards: data?.cards ?? [],
    totalCards: data?.totalCards ?? 0,
    isDefault: data?.isDefault ?? false,
    stats: data?.stats,
  };
}

export interface CheckDescendantActiveCardResponse {
  statusCode: number;
  message: string;
  data: {
    hasActiveCard: boolean;
  };
}

export async function checkDescendantActiveCard(userId: number): Promise<boolean> {
  const res = await apiService.post<CheckDescendantActiveCardResponse>(
    API_ENDPOINTS.CARDS.CHECK_DESCENDANT_ACTIVE_CARD,
    { userId }
  );
  
  const payload: any = res;
  const data = payload?.data ?? payload;
  
  // El endpoint retorna un objeto con formato estándar: { statusCode, message, data: { hasActiveCard } }
  if (data?.hasActiveCard !== undefined) {
    return data.hasActiveCard;
  }
  
  // Fallback por si acaso el formato cambia
  return Boolean(data);
}

