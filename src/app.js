// src/app.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

// Routes
const indexRoutes = require("./routes/index");
const healthRoutes = require("./routes/health");

app.use("/", indexRoutes);
app.use("/health", healthRoutes);

// Error handling middleware
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Start server only when run directly (not imported by tests)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
    ========================================
      Server running in ${NODE_ENV} mode
      URL: http://localhost:${PORT}
      Health: http://localhost:${PORT}/health
    ========================================
    `);
    });
}

// Export for testing
module.exports = app;