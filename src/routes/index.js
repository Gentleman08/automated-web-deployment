// src/routes/index.js
const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

// Home page
router.get("/", homeController.getHome);

// API info endpoint
router.get("/api/info", homeController.getInfo);

module.exports = router;