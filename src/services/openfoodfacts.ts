import type { FoodItem } from '@/types/domain';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS = 'product_name,brands,nutriments,nutriscore_grade,serving_size';
const USER_AGENT = 'TrackerPerso/1.0';

export class ProductNotFoundError extends Error {
  constructor(public readonly barcode: string) {
    super(`Product not found for barcode ${barcode}`);
    this.name = 'ProductNotFoundError';
  }
}

interface OffNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  sugars_100g?: number;
  salt_100g?: number;
}

interface OffProduct {
  product_name?: string;
  brands?: string;
  nutriments?: OffNutriments;
}

interface OffResponse {
  status: number;
  product?: OffProduct;
}

function numOrNull(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mapToFoodItem(barcode: string, product: OffProduct): FoodItem {
  const n = product.nutriments ?? {};
  return {
    barcode,
    name: product.product_name?.trim() || 'Produit sans nom',
    brand: product.brands?.split(',')[0]?.trim() || null,
    kcal100g: numOrNull(n['energy-kcal_100g']),
    protein100g: numOrNull(n.proteins_100g),
    carb100g: numOrNull(n.carbohydrates_100g),
    fat100g: numOrNull(n.fat_100g),
    sugar100g: numOrNull(n.sugars_100g),
    salt100g: numOrNull(n.salt_100g),
  };
}

export async function fetchProduct(barcode: string): Promise<FoodItem> {
  const url = `${BASE_URL}/${encodeURIComponent(barcode)}?fields=${FIELDS}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts HTTP ${response.status}`);
  }

  const data = (await response.json()) as OffResponse;
  if (data.status !== 1 || !data.product) {
    throw new ProductNotFoundError(barcode);
  }

  return mapToFoodItem(barcode, data.product);
}
