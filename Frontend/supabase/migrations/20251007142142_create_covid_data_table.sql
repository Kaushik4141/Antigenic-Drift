/*
  # Create COVID-19 Data Cache Table

  1. New Tables
    - `covid_data`
      - `id` (uuid, primary key) - Unique identifier for each record
      - `country_name` (text) - Name of the country
      - `country_code` (text) - ISO country code
      - `total_cases` (bigint) - Total confirmed COVID-19 cases
      - `total_deaths` (bigint) - Total COVID-19 deaths
      - `total_recovered` (bigint) - Total recovered cases
      - `active_cases` (bigint) - Currently active cases
      - `new_cases` (bigint) - New cases in the last 24 hours
      - `new_deaths` (bigint) - New deaths in the last 24 hours
      - `critical_cases` (bigint) - Critical cases
      - `cases_per_million` (decimal) - Cases per million population
      - `deaths_per_million` (decimal) - Deaths per million population
      - `total_tests` (bigint) - Total tests conducted
      - `tests_per_million` (decimal) - Tests per million population
      - `population` (bigint) - Country population
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `covid_data` table
    - Add policy for public read access (COVID data is public information)
    
  3. Indexes
    - Add index on country_name for faster lookups
    - Add index on country_code for faster lookups
    - Add index on updated_at for cache validation

  4. Notes
    - Data is cached to reduce API calls
    - Public read access since COVID statistics are public information
*/

CREATE TABLE IF NOT EXISTS covid_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_name text NOT NULL,
  country_code text,
  total_cases bigint DEFAULT 0,
  total_deaths bigint DEFAULT 0,
  total_recovered bigint DEFAULT 0,
  active_cases bigint DEFAULT 0,
  new_cases bigint DEFAULT 0,
  new_deaths bigint DEFAULT 0,
  critical_cases bigint DEFAULT 0,
  cases_per_million decimal DEFAULT 0,
  deaths_per_million decimal DEFAULT 0,
  total_tests bigint DEFAULT 0,
  tests_per_million decimal DEFAULT 0,
  population bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE covid_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read COVID data"
  ON covid_data
  FOR SELECT
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_covid_data_country_name ON covid_data(country_name);
CREATE INDEX IF NOT EXISTS idx_covid_data_country_code ON covid_data(country_code);
CREATE INDEX IF NOT EXISTS idx_covid_data_updated_at ON covid_data(updated_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_covid_data_unique_country ON covid_data(country_name);