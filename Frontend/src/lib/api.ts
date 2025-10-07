// Simple API client for backend COVID endpoints
// Configure backend base URL via VITE_BACKEND_URL; defaults to http://localhost:8000

const BASE = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:8000';

export interface BackendCountry {
  country: string;
  casesTotal: number | null;
  deathsTotal: number | null;
  colorHex: string;
  hasData: boolean;
}

export interface BatchResponse {
  maxValue: number;
  results: BackendCountry[];
}

export async function getBatch(countries: string[]): Promise<BatchResponse> {
  const res = await fetch(`${BASE}/api/covid/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countries }),
  });
  if (!res.ok) throw new Error(`Batch request failed: ${res.status}`);
  return res.json();
}

export async function getCountry(name: string, max?: number): Promise<BackendCountry> {
  const url = new URL(`${BASE}/api/covid/country/${encodeURIComponent(name)}`);
  if (typeof max === 'number' && isFinite(max) && max > 0) url.searchParams.set('max', String(max));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Country request failed: ${res.status}`);
  return res.json();
}

export interface LegendStop { position: number; color: string; label: string }
export interface LegendResponse { defaultColor: string; stops: LegendStop[]; maxValue: number | null }

export async function getLegend(max?: number): Promise<LegendResponse> {
  const url = new URL(`${BASE}/api/covid/legend`);
  if (typeof max === 'number' && isFinite(max) && max > 0) url.searchParams.set('max', String(max));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Legend request failed: ${res.status}`);
  return res.json();
}

export interface TimePoint { date: string; total: number; new: number }
export interface TimeSeries { cases: TimePoint[]; deaths: TimePoint[] }
export interface TimeSeriesStats {
  totalCases: number | null;
  totalDeaths: number | null;
  startDate: string | null;
  endDate: string | null;
  peakDailyCases: number | null;
  peakCasesDate: string | null;
  peakDailyDeaths: number | null;
  peakDeathsDate: string | null;
}
export interface TimeSeriesResponse { country: string; series: TimeSeries; stats: TimeSeriesStats | null }

export async function getTimeSeries(name: string): Promise<TimeSeriesResponse> {
  const url = `${BASE}/api/covid/timeseries/${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Timeseries request failed: ${res.status}`);
  return res.json();
}

// ---- Prediction analysis endpoints ----
export interface PredictionItem {
  virus_name: string;
  base_sequence_snippet: string;
  future_sequence_snippet: string;
  predicted_escape_probability: number; // 0..1
  risk_level: string; // e.g., Low | Moderate | High
}

export interface AnalysisResultDoc {
  _id?: string;
  model_accuracy: number; // 0..1
  predictions: PredictionItem[];
  timestamp?: string;
}

export async function getLatestAnalysis(): Promise<AnalysisResultDoc> {
  const res = await fetch(`${BASE}/api/data/latest`);
  if (!res.ok) throw new Error(`Latest analysis request failed: ${res.status}`);
  return res.json();
}

export async function getAnalyses(): Promise<AnalysisResultDoc[]> {
  const res = await fetch(`${BASE}/api/data`);
  if (!res.ok) throw new Error(`Analyses list request failed: ${res.status}`);
  return res.json();
}

export async function getAnalysisById(id: string): Promise<AnalysisResultDoc> {
  const res = await fetch(`${BASE}/api/data/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Analysis by id request failed: ${res.status}`);
  return res.json();
}
