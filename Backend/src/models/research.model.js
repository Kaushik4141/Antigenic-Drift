const mongoose = require('mongoose');

const ResearchSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  virus: { type: String, required: true, trim: true },
  fileName: { type: String, required: true }, // original file name
  storedFileName: { type: String, required: true }, // on disk
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  fileUrl: { type: String, required: true }, // absolute URL served by backend
  summary: { type: String, default: '' }, // AI generated 3-4 line summary
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ResearchPaper', ResearchSchema);
