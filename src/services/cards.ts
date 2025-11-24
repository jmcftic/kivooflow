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

