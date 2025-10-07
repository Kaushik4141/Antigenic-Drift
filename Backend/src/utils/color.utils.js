// Color utilities for choropleth mapping
// Gradient: light blue -> yellow -> dark red

const DEFAULT_GREY_HEX = '#B0B0B0';

// Colors chosen for clear contrast and accessibility
const LOW_COLOR = { r: 173, g: 216, b: 230 };   // light blue (#ADD8E6)
const MID_COLOR = { r: 255, g: 255, b: 0 };     // yellow (#FFFF00)
const HIGH_COLOR = { r: 139, g: 0, b: 0 };      // dark red (#8B0000)

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function lerpColor(c1, c2, t) {
  return {
    r: lerp(c1.r, c2.r, t),
    g: lerp(c1.g, c2.g, t),
    b: lerp(c1.b, c2.b, t),
  };
}

// Compute color given a value, with a three-stop gradient.
// If maxValue <= 0 or value is null/undefined, returns default grey.
function valueToColorHex(value, maxValue) {
  if (value == null || !isFinite(value) || maxValue == null || maxValue <= 0) {
    return DEFAULT_GREY_HEX;
  }
  const t = clamp01(value / maxValue);
  // Piecewise: [0,0.5] from LOW -> MID, (0.5,1] from MID -> HIGH
  let color;
  if (t <= 0.5) {
    const lt = t / 0.5; // 0..1
    color = lerpColor(LOW_COLOR, MID_COLOR, lt);
  } else {
    const ht = (t - 0.5) / 0.5; // 0..1
    color = lerpColor(MID_COLOR, HIGH_COLOR, ht);
  }
  return rgbToHex(color);
}

function getLegend(maxValue) {
  // Provide legend information for the frontend
  return {
    defaultColor: DEFAULT_GREY_HEX,
    stops: [
      { position: 0, color: rgbToHex(LOW_COLOR), label: 'Low' },
      { position: 0.5, color: rgbToHex(MID_COLOR), label: 'Medium' },
      { position: 1, color: rgbToHex(HIGH_COLOR), label: 'High' },
    ],
    maxValue: maxValue ?? null,
  };
}

module.exports = {
  DEFAULT_GREY_HEX,
  valueToColorHex,
  getLegend,
};
