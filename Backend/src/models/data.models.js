const mongoose = require('mongoose');
// Define a schema for the individual prediction objects within the predictions array.
const PredictionSchema = new mongoose.Schema({
    virus_name: { type: String, required: true },
    base_sequence_snippet: { type: String, required: true },
    future_sequence_snippet: { type: String, required: true },
    predicted_escape_probability: { type: Number, required: true },
    risk_level: { type: String, required: true }
}, { _id: false });

// Define the main schema for the entire document that will be stored.
const analysisResultSchema = new mongoose.Schema({
    model_accuracy: {
        type: Number,
        required: true
    },
    predictions: [PredictionSchema], // This defines an array of objects matching the PredictionSchema
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const AnalysisResult = mongoose.model('AnalysisResult', analysisResultSchema);

module.exports = AnalysisResult;