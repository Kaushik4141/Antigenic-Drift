const mongoose = require('mongoose');

const covidCountrySchema = new mongoose.Schema(
  {
    country: { type: String, required: true, unique: true, index: true },
    casesTotal: { type: Number, default: null },
    deathsTotal: { type: Number, default: null },
    hasData: { type: Boolean, default: false },
    // Optional: store last API error message
    lastError: { type: String, default: null },
    // Raw payload for debugging/audit (can be trimmed later)
    raw: { type: mongoose.Schema.Types.Mixed, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('CovidCountry', covidCountrySchema);
