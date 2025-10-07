const express = require('express');
const router = express.Router();
const covidController = require('../controllers/covid.controller');

// GET single country
router.get('/country/:name', covidController.getCountry);

// POST batch of countries
router.post('/batch', covidController.getBatch);

// GET legend for gradient
router.get('/legend', covidController.getLegend);

// POST seed DB with country list (starts background refresh)
router.post('/seed', covidController.seed);

// GET status of data population
router.get('/status', covidController.status);

// GET time series for a country
router.get('/timeseries/:name', covidController.getTimeSeries);

module.exports = router;
