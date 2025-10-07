const axios = require('axios');
const { DEFAULT_GREY_HEX, valueToColorHex } = require('../utils/color.utils');
const CovidCountry = require('../models/covid.models');

const API_URL = 'https://api.api-ninjas.com/v1/covid19';
const API_KEY = process.env.API_NINJAS_KEY;

// Simple in-memory cache with TTL
const cache = new Map(); // key: countryLower -> { data, expiresAt }

// Build aggregated time series for cases and deaths + summary stats from stored raw payload
// Returns { country, series: { cases: [{date,total,new}], deaths: [{date,total,new}] }, stats: {...} }
async function getCountryTimeSeries(countryName) {
  const doc = await CovidCountry.findOne({ country: countryName }).lean();
  if (!doc || !Array.isArray(doc.raw) || doc.raw.length === 0) {
    return { country: countryName, series: { cases: [], deaths: [] }, stats: null };
  }

  const items = doc.raw;
  const agg = items.find(
    (x) => String(x?.region || x?.province || x?.state || '').toLowerCase() === 'all'
  );

  const casesMap = new Map(); // date -> { date, total, new }
  const deathsMap = new Map(); // date -> { date, total, new }

  function addFromSeries(map, input) {
    const dict = input || {};
    for (const [date, rec] of Object.entries(dict)) {
      const d = String(date);
      const t = Number(rec?.total) || 0;
      const n = Number(rec?.new) || 0;
      const prev = map.get(d) || { date: d, total: 0, new: 0 };
      prev.total = Math.max(prev.total, t);
      prev.new = (prev.new || 0) + n;
      map.set(d, prev);
    }
  }

  function addFromItem(it) {
    if (!it) return;
    addFromSeries(casesMap, it.cases);
    addFromSeries(deathsMap, it.deaths);
  }

  if (agg) addFromItem(agg);
  else for (const it of items) addFromItem(it);

  const cases = Array.from(casesMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  const deaths = Array.from(deathsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  function computeStats(arr) {
    if (!arr || arr.length === 0) return null;
    let peakNew = 0; let peakDate = null;
    for (const p of arr) {
      if (p.new > peakNew) { peakNew = p.new; peakDate = p.date; }
    }
    const last = arr[arr.length - 1];
    return {
      startDate: arr[0].date,
      endDate: last.date,
      total: last.total,
      peakNew,
      peakDate,
    };
  }

  const casesStats = computeStats(cases);
  const deathsStats = computeStats(deaths);

  const stats = {
    totalCases: casesStats?.total ?? null,
    totalDeaths: deathsStats?.total ?? null,
    startDate: casesStats?.startDate || deathsStats?.startDate || null,
    endDate: casesStats?.endDate || deathsStats?.endDate || null,
    peakDailyCases: casesStats?.peakNew ?? null,
    peakCasesDate: casesStats?.peakDate ?? null,
    peakDailyDeaths: deathsStats?.peakNew ?? null,
    peakDeathsDate: deathsStats?.peakDate ?? null,
  };

  return { country: doc.country, series: { cases, deaths }, stats };
}

// -------------------- DB-backed getters --------------------
function docToDto(doc) {
  if (!doc) return {
    country: '', casesTotal: null, deathsTotal: null, colorHex: DEFAULT_GREY_HEX, hasData: false,
  };
  return {
    country: doc.country,
    casesTotal: doc.casesTotal ?? null,
    deathsTotal: doc.deathsTotal ?? null,
    colorHex: DEFAULT_GREY_HEX, // color applied in batch based on max
    hasData: !!doc.hasData,
  };
}

async function getCountryFromDB(countryName) {
  const doc = await CovidCountry.findOne({ country: countryName }).lean();
  return docToDto(doc || { country: countryName, hasData: false });
}

async function getBatchFromDB(countryNames = []) {
  const names = Array.from(new Set(countryNames || []));
  const docs = await CovidCountry.find({ country: { $in: names } }).lean();
  const byName = new Map(docs.map(d => [d.country, d]));
  const results = names.map(name => docToDto(byName.get(name) || { country: name, hasData: false }));
  const max = results.reduce((m, r) => {
    const v = r.casesTotal;
    return v != null && isFinite(v) && v > m ? v : m;
  }, 0);
  const withColors = results.map(r => ({ ...r, colorHex: valueToColorHex(r.casesTotal, max) }));
  return { maxValue: max, results: withColors };
}

// -------------------- Refresh + Scheduler (Queue-based) --------------------
async function upsertCountryDoc(dto, raw) {
  await CovidCountry.updateOne(
    { country: dto.country },
    {
      $set: {
        casesTotal: dto.casesTotal,
        deathsTotal: dto.deathsTotal,
        hasData: dto.hasData,
        lastError: dto.error || null,
        raw: raw ?? null,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

// Single-worker queue to process countries sequentially with delay
const PENDING_COUNTRIES = new Set();
let workerRunning = false;
const GAP_MS = 2 * 60 * 1000; // 2 minutes between API calls

function enqueueCountries(countryNames = []) {
  for (const n of Array.from(new Set(countryNames || []))) {
    if (n) PENDING_COUNTRIES.add(n);
  }
  if (!workerRunning) {
    workerRunning = true;
    processQueue().catch((e) => {
      console.error('processQueue fatal error:', e);
      workerRunning = false;
    });
  }
  console.log(`[COVID][QUEUE] Enqueued ${Array.from(new Set(countryNames || [])).length} countries. Pending size: ${PENDING_COUNTRIES.size}`);
}

async function processQueue() {
  while (PENDING_COUNTRIES.size > 0) {
    const iterator = PENDING_COUNTRIES.values();
    const name = iterator.next().value;
    PENDING_COUNTRIES.delete(name);
    const startedAt = Date.now();
    console.log(`[COVID][QUEUE] Fetching ${name}. Remaining after dequeue: ${PENDING_COUNTRIES.size}`);
    try {
      const apiData = await fetchCountryFromAPI(name);
      const shaped = shapeCountryData(name, apiData);
      await upsertCountryDoc(shaped, apiData);
      console.log(`[COVID] Updated ${name} in ${Date.now() - startedAt}ms: cases=${shaped.casesTotal ?? '—'} deaths=${shaped.deathsTotal ?? '—'}`);
    } catch (err) {
      const shaped = {
        country: name,
        casesTotal: null,
        deathsTotal: null,
        hasData: false,
        error: err?.message || 'Failed to fetch',
      };
      await upsertCountryDoc(shaped, null);
      console.warn(`[COVID] Failed ${name} in ${Date.now() - startedAt}ms: ${shaped.error}`);
    }
    // Wait between requests to respect provider constraints
    console.log(`[COVID][QUEUE] Sleeping ${GAP_MS}ms before next fetch...`);
    await sleep(GAP_MS);
  }
  workerRunning = false;
}

// Backwards-compatible alias used by controllers
async function refreshCountries(countryNames = []) {
  enqueueCountries(countryNames);
}

let schedulerHandle = null;
async function refreshAllKnown() {
  const names = await CovidCountry.distinct('country');
  if (names.length === 0) return; // nothing to refresh yet
  console.log(`[COVID][SCHED] Enqueuing ${names.length} known countries for refresh.`);
  enqueueCountries(names);
}

function startCovidScheduler(intervalMs = 30 * 60 * 1000) {
  if (schedulerHandle) return; // already started
  // run once shortly after start, then on interval
  setTimeout(() => {
    refreshAllKnown().catch(err => console.error('Initial refreshAllKnown failed:', err));
  }, 5000);
  schedulerHandle = setInterval(() => {
    refreshAllKnown().catch(err => console.error('Scheduled refreshAllKnown failed:', err));
  }, intervalMs);
  console.log(`[COVID][SCHED] Scheduler started. Interval: ${intervalMs}ms`);
}
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

function now() {
  return Date.now();
}

// Common alias mapping to help match API expectations
const COUNTRY_ALIASES = new Map(
  [
    ['usa', 'United States'],
    ['us', 'United States'],
    ['u.s.a.', 'United States'],
    ['u.s.', 'United States'],
    ['united states of america', 'United States'],
    ['uk', 'United Kingdom'],
    ['south korea', 'Korea, South'],
    ['north korea', 'Korea, North'],
    ['russia', 'Russia'],
    ['russian federation', 'Russia'],
    ['uae', 'United Arab Emirates'],
    ['vietnam', 'Vietnam'],
    ['laos', "Lao People's Democratic Republic"],
    ['iran', 'Iran'],
    ['syria', 'Syria'],
    ['czechia', 'Czechia'],
    ['czech republic', 'Czechia'],
    ['slovakia', 'Slovakia'],
    ['myanmar', 'Myanmar'],
    ['burma', 'Myanmar'],
    ['ivory coast', `Cote d'Ivoire`],
    ['cote d\'ivoire', `Cote d'Ivoire`],
    ['côte d\'ivoire', `Cote d'Ivoire`],
    ['congo (kinshasa)', 'Congo (Kinshasa)'],
    ['congo (brazzaville)', 'Congo (Brazzaville)'],
    ['democratic republic of the congo', 'Congo (Kinshasa)'],
    ['republic of the congo', 'Congo (Brazzaville)'],
    ['dem. rep. congo', 'Congo (Kinshasa)'],
    ['dominican rep.', 'Dominican Republic'],
    ['dominican republic', 'Dominican Republic'],
    ['eq. guinea', 'Equatorial Guinea'],
    ['equatorial guinea', 'Equatorial Guinea'],
    ['w. sahara', 'Western Sahara'],
    ['falkland is.', 'Falkland Islands'],
    ['falkland islands', 'Falkland Islands'],
    ['fr. s. antarctic lands', 'French Southern Territories'],
    ['timor-leste', 'Timor-Leste'],
    ['palestine', 'Palestine'],
    ['s. sudan', 'South Sudan'],
  ]
);
function normalizeCountryName(name) {
  const raw = (name || '').trim();
  const key = raw.toLowerCase();
  return COUNTRY_ALIASES.get(key) || raw;
}

function cacheGet(countryLower) {
  const entry = cache.get(countryLower);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt > now()) return entry.data;
  cache.delete(countryLower);
  return null;
}

function cacheSet(countryLower, data, ttlMs = DEFAULT_TTL_MS) {
  cache.set(countryLower, {
    data,
    expiresAt: now() + ttlMs,
  });
}

function coerceNumber(val) {
  if (val == null) return null;
  const n = Number(val);
  return isFinite(n) ? n : null;
}

function pickBestAggregate(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  if (items.length === 1) return items[0];
  // Prefer region: 'All' if exists; otherwise, max by cases.total
  const all = items.find(
    (x) => String(x.region || x.province || x.state || '').toLowerCase() === 'all'
  );
  if (all) return all;
  let best = items[0];
  let bestTotal = coerceNumber(items[0]?.cases?.total) ?? 0;
  for (const item of items) {
    const t = coerceNumber(item?.cases?.total) ?? 0;
    if (t > bestTotal) {
      best = item;
      bestTotal = t;
    }
  }
  return best;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchCountryFromAPI(countryName) {
  if (!API_KEY) {
    const err = new Error('Missing API_NINJAS_KEY in environment');
    err.code = 'NO_API_KEY';
    throw err;
  }
  const name = normalizeCountryName(countryName);
  const url = `${API_URL}?country=${encodeURIComponent(name)}`;
  const maxAttempts = 3;
  const baseDelay = 500; // ms
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[COVID][FETCH] Attempt ${attempt}/${maxAttempts} for ${name}`);
      const res = await axios.get(url, {
        headers: { 'X-Api-Key': API_KEY },
        timeout: 20000,
      });
      return res.data;
    } catch (err) {
      lastErr = err;
      const code = err?.code;
      const status = err?.response?.status;
      console.warn(`[COVID][FETCH] Attempt ${attempt} failed for ${name}: ${err?.message} (code=${code || 'n/a'}, status=${status || 'n/a'})`);
      // Retry only on transient network errors
      const transient = code === 'ENOTFOUND' || code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'EAI_AGAIN';
      if (!transient || attempt === maxAttempts) break;
      const delay = baseDelay * Math.pow(3, attempt - 1);
      console.log(`[COVID][FETCH] Retrying ${name} in ${delay}ms...`);
      await sleep(delay);
    }
  }
  console.error(`[COVID][FETCH] Giving up for ${name} after ${maxAttempts} attempts.`);
  throw lastErr;
}

function shapeCountryData(countryName, apiData) {
  // apiData can be an array; pick the best aggregate
  const best = Array.isArray(apiData) ? pickBestAggregate(apiData) : apiData;
  if (!best) {
    return {
      country: countryName,
      casesTotal: null,
      deathsTotal: null,
      colorHex: DEFAULT_GREY_HEX,
      hasData: false,
    };
  }
  const casesTotal = coerceNumber(best?.cases?.total);
  const deathsTotal = coerceNumber(best?.deaths?.total);
  return {
    country: countryName,
    casesTotal,
    deathsTotal,
    colorHex: DEFAULT_GREY_HEX, // set later when we know max
    hasData: casesTotal != null || deathsTotal != null,
  };
}

async function getCountryDataRaw(countryName) {
  const key = String(countryName || '').toLowerCase();
  const cached = cacheGet(key);
  if (cached) return cached;
  try {
    const data = await fetchCountryFromAPI(countryName);
    const shaped = shapeCountryData(countryName, data);
    cacheSet(key, shaped);
    return shaped;
  } catch (err) {
    // Log error details to server console for debugging
    const status = err?.response?.status;
    const body = err?.response?.data;
    console.warn('COVID API fetch failed for', countryName, '- status:', status, 'message:', err?.message, 'body:', body);
    // Network or API error; return no-data shape but do not cache for long
    const shaped = {
      country: countryName,
      casesTotal: null,
      deathsTotal: null,
      colorHex: DEFAULT_GREY_HEX,
      hasData: false,
      error: err?.message || 'Failed to fetch',
    };
    // short TTL on errors to avoid hammering API
    cacheSet(key, shaped, 60 * 1000);
    return shaped;
  }
}

async function getCountryData(countryName, options = {}) {
  const data = await getCountryDataRaw(countryName);
  const max = options.maxValue;
  if (typeof max === 'number' && isFinite(max) && max > 0) {
    data.colorHex = valueToColorHex(data.casesTotal, max);
  }
  return data;
}

async function getBatchCountryData(countryNames = []) {
  const names = Array.from(new Set(countryNames || [])); // dedupe

  // Concurrency-limited mapper to avoid API rate limits
  const limit = 5; // at most 5 in-flight requests
  const delayMs = 100; // small spacing between task starts
  const results = new Array(names.length);
  let i = 0;

  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= names.length) break;
      const name = names[idx];
      try {
        results[idx] = await getCountryDataRaw(name);
      } catch (e) {
        results[idx] = {
          country: name,
          casesTotal: null,
          deathsTotal: null,
          colorHex: DEFAULT_GREY_HEX,
          hasData: false,
          error: e?.message || 'Failed to fetch',
        };
      }
      // spacing between task starts
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  const workers = Array.from({ length: Math.min(limit, names.length) }, () => worker());
  await Promise.all(workers);
  // compute max among those with data
  const max = results.reduce((m, r) => {
    const v = r.casesTotal;
    return v != null && isFinite(v) && v > m ? v : m;
  }, 0);
  const withColors = results.map((r) => ({
    ...r,
    colorHex: valueToColorHex(r.casesTotal, max),
  }));
  return { maxValue: max, results: withColors };
}

module.exports = {
  // Direct API helpers (kept for internal use/testing)
  getCountryData,
  getBatchCountryData,
  // DB-backed getters for production use by controllers
  getCountryFromDB,
  getBatchFromDB,
  // Refreshing and scheduler
  refreshCountries,
  startCovidScheduler,
  // Timeseries
  getCountryTimeSeries,
};
