// Load environment variables from .env file at the very beginning
require('dotenv').config(); 

const app = require('./app'); // Imports the configured Express app
const { startCovidScheduler } = require('./services/covid.service');

const PORT = process.env.PORT || 8000;

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🎧`);
    // Start 30-min COVID data scheduler
    startCovidScheduler(30 * 60 * 1000);
});