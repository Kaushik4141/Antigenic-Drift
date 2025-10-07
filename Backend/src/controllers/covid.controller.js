const { getCountryFromDB, getBatchFromDB, refreshCountries, getCountryTimeSeries } = require('../services/covid.service');
const { getLegend } = require('../utils/color.utils');
const CovidCountry = require('../models/covid.models');

// GET /api/covid/country/:name?max=<number>
exports.getCountry = async (req, res) => {
  try {
    const { name } = req.params;
    const data = await getCountryFromDB(name);
    // Background refresh for this country (non-blocking)
    refreshCountries([name]).catch((e) => console.warn('Background refreshCountry failed:', e));
    return res.json(data);
  } catch (err) {
    console.error('getCountry error:', err);
    return res.status(500).json({ message: 'Failed to fetch country data' });
  }
};

// POST /api/covid/batch
// Body: { countries: string[] }
exports.getBatch = async (req, res) => {
  try {
    const countries = Array.isArray(req.body?.countries) ? req.body.countries : [];
    if (countries.length === 0) {
      return res.status(400).json({ message: 'countries array is required' });
    }
    const { maxValue, results } = await getBatchFromDB(countries);
    // Trigger background refresh (non-blocking)
    refreshCountries(countries).catch((e) => console.warn('Background refreshCountries failed:', e));
    return res.json({ maxValue, results });
  } catch (err) {
    console.error('getBatch error:', err);
    return res.status(500).json({ message: 'Failed to fetch batch data' });
  }
};

// GET /api/covid/legend?max=<number>
exports.getLegend = async (req, res) => {
  try {
    const max = req.query.max ? Number(req.query.max) : undefined;
    return res.json(getLegend(max));
  } catch (err) {
    console.error('getLegend error:', err);
    return res.status(500).json({ message: 'Failed to get legend' });
  }
};

// POST /api/covid/seed
// Body: { countries: string[] }
exports.seed = async (req, res) => {
  try {
    const countries = Array.isArray(req.body?.countries) ? req.body.countries : [];
    if (countries.length === 0) {
      return res.status(400).json({ message: 'countries array is required' });
    }
    // Trigger refresh and return immediately
    refreshCountries(countries)
      .then(() => console.log('Seed refresh completed for', countries.length, 'countries'))
      .catch((e) => console.warn('Seed refresh failed:', e?.message || e));
    return res.status(202).json({ message: 'Seed started', count: countries.length });
  } catch (err) {
    console.error('seed error:', err);
    return res.status(500).json({ message: 'Failed to start seed' });
  }
};

// GET /api/covid/status
exports.status = async (_req, res) => {
  try {
    const count = await CovidCountry.estimatedDocumentCount();
    const latest = await CovidCountry.findOne({}).sort({ updatedAt: -1 }).select('updatedAt').lean();
    return res.json({ count, lastUpdatedAt: latest?.updatedAt || null });
  } catch (err) {
    console.error('status error:', err);
    return res.status(500).json({ message: 'Failed to get status' });
  }
};

// GET /api/covid/timeseries/:name
exports.getTimeSeries = async (req, res) => {
  try {
    const { name } = req.params;
    const out = await getCountryTimeSeries(name);
    // Kick a background refresh to keep it fresh
    refreshCountries([name]).catch(() => {});
    return res.json(out);
  } catch (err) {
    console.error('getTimeSeries error:', err);
    return res.status(500).json({ message: 'Failed to get time series' });
  }
};
