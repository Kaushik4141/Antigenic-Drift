import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CovidData {
  id: string;
  country_name: string;
  country_code: string | null;
  total_cases: number;
  total_deaths: number;
  total_recovered: number;
  active_cases: number;
  new_cases: number;
  new_deaths: number;
  critical_cases: number;
  cases_per_million: number;
  deaths_per_million: number;
  total_tests: number;
  tests_per_million: number;
  population: number;
  updated_at: string;
  created_at: string;
}
