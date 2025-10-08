// summarize.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const pdfParse = require("pdf-parse");

// Ensure env is loaded by server.js, but also load here if invoked directly
dotenv.config();

// Lazily create model instance to avoid crashing the app if key is missing at boot
let _model = null;
function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (_model) return _model;
  const genAI = new GoogleGenerativeAI({ apiKey });
  _model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  return _model;
}

/**
 * Summarize a local file using Gemini into 3–4 lines.
 * Currently supports only PDFs. Extracts text and prompts Gemini.
 * @param {string} filePath absolute path to the file
 * @param {string} mimeType mime type, default 'application/pdf'
 * @returns {Promise<string>} summary text
 */
async function summarizeFile(filePath, mimeType = "application/pdf") {
  try {
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid filePath provided");
    }
    const abs = path.resolve(filePath);
    if (!fs.existsSync(abs)) {
      throw new Error(`File not found: ${abs}`);
    }
    if (mimeType !== "application/pdf") {
      throw new Error(`Unsupported mime type for summarization: ${mimeType}`);
    }

    // Extract text from PDF
    const dataBuffer = fs.readFileSync(abs);
    const parsed = await pdfParse(dataBuffer);
    let text = (parsed && parsed.text ? parsed.text : "").replace(/\s+/g, " ").trim();
    if (!text) {
      throw new Error("No extractable text found in the PDF");
    }
    // Limit input size to keep prompt efficient
    const MAX_CHARS = 8000;
    if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS);

    const model = getModel();
    const prompt = [
      "You are an expert scientific assistant.",
      "Given the following paper content, write a crisp 3–4 sentence summary covering:",
      "objective, methods, key findings, and conclusion. Keep under 80 words."
    ].join(" ");

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${prompt}\n\n--- Paper Content ---\n${text}` }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 120 }
    });
    const summary = result && result.response && typeof result.response.text === "function"
      ? result.response.text()
      : "";
    return String(summary || "").trim();
  } catch (err) {
    // Surface the error to caller; controller will decide whether to fail or continue
    console.error("summarizeFile error:", err?.message || err);
    throw err;
  }
}

module.exports = { summarizeFile };