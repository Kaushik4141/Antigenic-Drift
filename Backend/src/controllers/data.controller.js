// Change the import to use the new model
const AnalysisResult = require('../models/data.models');

// This function handles the logic for saving data.
exports.saveData = async (req, res) => {
  try {
    console.log('Received data:', req.body);

    // Accept either a single object or an array with one object (from some JSON exports)
    let payload = req.body;
    if (Array.isArray(payload)) {
      if (payload.length === 0) return res.status(400).json({ message: 'Empty array provided' });
      payload = payload[0];
    }

    // Normalize timestamp if provided as { $date: string }
    if (payload && typeof payload.timestamp === 'object' && payload.timestamp?.$date) {
      payload.timestamp = new Date(payload.timestamp.$date);
    }

    const newResult = new AnalysisResult(payload);
    const savedResult = await newResult.save();

    return res.status(201).json({
      message: 'Analysis result saved successfully!',
      data: savedResult,
    });
  } catch (error) {
    console.error('Error saving data:', error);
    return res.status(500).json({ message: 'Failed to save data.' });
  }
};

// GET /api/data/latest -> return the most recent analysis result (by timestamp desc)
exports.getLatest = async (_req, res) => {
  try {
    const doc = await AnalysisResult.findOne({}).sort({ timestamp: -1 }).lean();
    if (!doc) return res.status(404).json({ message: 'No analysis results found' });
    return res.json(doc);
  } catch (error) {
    console.error('Error fetching latest analysis:', error);
    return res.status(500).json({ message: 'Failed to fetch latest analysis.' });
  }
};

// GET /api/data -> list all analysis results (newest first)
exports.getAll = async (_req, res) => {
  try {
    const docs = await AnalysisResult.find({}).sort({ timestamp: -1 }).lean();
    return res.json(docs);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return res.status(500).json({ message: 'Failed to fetch analyses.' });
  }
};

// GET /api/data/:id -> fetch a specific analysis result by id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await AnalysisResult.findById(id).lean();
    if (!doc) return res.status(404).json({ message: 'Analysis result not found' });
    return res.json(doc);
  } catch (error) {
    console.error('Error fetching analysis by id:', error);
    return res.status(500).json({ message: 'Failed to fetch analysis.' });
  }
};