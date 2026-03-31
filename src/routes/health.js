// src/routes/health.js
const express = require("express");
const router = express.Router();

// Health check - used by CI/CD pipeline to verify deployment
router.get("/", (req, res) => {
    const healthCheck = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: require("../../package.json").version,
        memoryUsage: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        },
    };

    res.status(200).json(healthCheck);
});

module.exports = router;