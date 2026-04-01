export type DummyJsonProduct = {
  id: number;
  title: string;
  description: string;
  price: number; // USD in DummyJSON
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
  weight?: number;
};

export type DummyJsonList<T> = {
  products: T[];
  total: number;
  skip: number;
  limit: number;
};

const BASE = 'https://dummyjson.com';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed (${res.status}) ${url}${text ? `\n${text}` : ''}`);
  }
  return (await res.json()) as T;
}

export function fetchProduct(productId: number) {
  return getJson<DummyJsonProduct>(`${BASE}/products/${productId}`);
}

export function fetchProductsByCategory(category: string, limit = 15) {
  const c = encodeURIComponent(category);
  return getJson<DummyJsonList<DummyJsonProduct>>(`${BASE}/products/category/${c}?limit=${limit}`);
}

export function fetchProducts(limit = 12, skip = 0) {
  return getJson<DummyJsonList<DummyJsonProduct>>(`${BASE}/products?limit=${limit}&skip=${skip}`);
}

