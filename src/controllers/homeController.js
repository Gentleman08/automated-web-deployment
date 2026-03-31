// src/controllers/homeController.js

const getHome = (req, res) => {
    res.json({
        message: "Welcome to the Automated CI/CD Web Application!",
        documentation: "/api/info",
        health: "/health",
        version: require("../../package.json").version,
    });
};

const getInfo = (req, res) => {
    res.json({
        application: "Automated CI/CD Web Application",
        version: require("../../package.json").version,
        description:
            "A demonstration of automated CI/CD pipeline for web deployment",
        technology: {
            runtime: "Node.js",
            framework: "Express.js",
            containerization: "Docker",
            ci_cd: "GitHub Actions",
            deployment: "AWS EC2",
        },
        endpoints: [
            { method: "GET", path: "/", description: "Home page" },
            { method: "GET", path: "/api/info", description: "Application info" },
            { method: "GET", path: "/health", description: "Health check" },
        ],
    });
};

module.exports = { getHome, getInfo };