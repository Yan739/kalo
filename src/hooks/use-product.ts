import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getFood, upsertFood } from '@/db/repositories/foodCacheRepo';
import { fetchProduct } from '@/services/openfoodfacts';
import type { FoodItem } from '@/types/domain';

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

async function resolveProduct(barcode: string): Promise<FoodItem> {
  const cached = await getFood(barcode);
  if (cached) {
    return cached;
  }
  const fetched = await fetchProduct(barcode);
  await upsertFood(fetched);
  return fetched;
}

export function useProduct(
  barcode: string | null,
): UseQueryResult<FoodItem, Error> {
  return useQuery({
    queryKey: ['product', barcode],
    queryFn: () => resolveProduct(barcode as string),
    enabled: barcode !== null,
    staleTime: ONE_DAY_MS * 30,
    gcTime: ONE_DAY_MS * 30,
    retry: false,
  });
}
