const ResearchPaper = require('../models/research.model');

// Create/upload a new research paper (expects multer to have processed the file)
exports.create = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const { title, virus } = req.body;
    if (!title || !virus) {
      return res.status(400).json({ message: 'Title and virus are required' });
    }

    const storedFileName = req.file.filename;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${storedFileName}`;

    const doc = await ResearchPaper.create({
      title,
      virus,
      fileName: req.file.originalname,
      storedFileName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      fileUrl,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating research paper:', err);
    return res.status(500).json({ message: 'Failed to upload research paper' });
  }
};

// List all research papers (newest first)
exports.getAll = async (_req, res) => {
  try {
    const docs = await ResearchPaper.find({}).sort({ uploadedAt: -1 }).lean();
    return res.json(docs);
  } catch (err) {
    console.error('Error listing research papers:', err);
    return res.status(500).json({ message: 'Failed to list research papers' });
  }
};

// Get a research paper by id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ResearchPaper.findById(id).lean();
    if (!doc) return res.status(404).json({ message: 'Research paper not found' });
    return res.json(doc);
  } catch (err) {
    console.error('Error getting research paper by id:', err);
    return res.status(500).json({ message: 'Failed to fetch research paper' });
  }
};
