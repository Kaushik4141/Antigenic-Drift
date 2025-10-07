const express = require('express');
const mongoose = require('mongoose');
const dataRoutes = require('./routes/data.routes');
const cors = require('cors');
const covidRoutes = require('./routes/covid.routes');
const path = require('path');
const researchRoutes = require('./routes/research.routes');

const app = express();

// --- Middleware ---
// This allows the app to parse incoming JSON request bodies.
app.use(express.json());
// Enable CORS for frontend requests
app.use(cors());

// Serve uploaded research files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully. '))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// --- API Routes ---
// This tells Express that any request to '/api/data' should be
// handled by the router defined in 'dataRoutes.js'.
app.use('/api/data', dataRoutes);
// COVID data routes for choropleth map
app.use('/api/covid', covidRoutes);
// Research upload/list routes
app.use('/api/research', researchRoutes);

module.exports = app;