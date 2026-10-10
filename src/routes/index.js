const express = require('express');
const v1Router = require('./v1/index');

const router = express.Router();

// Mount v1 router at /api/v1 and /api for full backwards compatibility
router.use('/v1', v1Router);
router.use('/', v1Router);

module.exports = router;

