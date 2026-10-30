const express = require('express');
const TrackingController = require('../controllers/trackingController');

const router = express.Router();

// Landing Page Routes (SmartValue)
router.get('/', TrackingController.handleLandingPage);
router.get('/us/search-2', TrackingController.handleLandingPage);
router.get('/us/search-2/', TrackingController.handleLandingPage);

// Direct Redirect Endpoints (HTTP 302)
router.get('/click', TrackingController.handleRedirect);
router.get('/r', TrackingController.handleRedirect);

// JSON API Endpoints for Frontend applications
router.get('/api/v1/tracking/resolve', TrackingController.handleResolveApi);

// System Health Check
router.get('/health', TrackingController.handleHealth);

module.exports = router;
