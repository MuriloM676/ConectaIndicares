const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface DashboardData {
  revenue: number | null;
  expense: number | null;
  result: number | null;
  population: number;
  educationPercent: number | null;
  healthPercent: number | null;
  personnelPercent: number | null;
}

export interface ComparisonData {
  municipalityA: any;
  municipalityB: any;
}

export interface RankingItem {
  ibgeCode: string;
  name: string;
  uf: string;
  population: number;
  score: number;
  revenue: number;
  expense: number;
  result: number;
}

export interface RankingResponse {
  items: RankingItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DeliveryItem {
  id: string;
  municipalityId: string;
  reportType: string;
  status: string;
  deliveredAt: string | null;
  year: number;
  periodicity: string | null;
}

export function getDashboard(ibgeCode: string, year: number) {
  return fetchApi<DashboardData>(
    `/municipalities/${ibgeCode}/dashboard?year=${year}`,
  );
}

export function getComparison(
  municipalityA: string,
  municipalityB: string,
  year: number,
) {
  return fetchApi<ComparisonData>(
    `/comparison?municipalityA=${municipalityA}&municipalityB=${municipalityB}&year=${year}`,
  );
}

export function getRanking(uf?: string, year?: number, page = 1, limit = 100) {
  const params = new URLSearchParams();
  if (uf) params.set("uf", uf);
  if (year) params.set("year", String(year));
  params.set("page", String(page));
  params.set("limit", String(limit));
  return fetchApi<RankingResponse>(`/ranking?${params}`);
}

export function getDeliveries(
  ibgeCode: string,
  year?: number,
  reportType?: string,
) {
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (reportType) params.set("reportType", reportType);
  const qs = params.toString();
  return fetchApi<DeliveryItem[]>(
    `/municipalities/${ibgeCode}/deliveries${qs ? `?${qs}` : ""}`,
  );
}

export function getMunicipalities() {
  return fetchApi<{ ibgeCode: string; name: string; uf: string }[]>(
    "/municipalities",
  );
}
