const { Router } = require('express');
const uploadRoute = require('../features/uploadCsv/routes');

const router = Router();

router.use('/v1', uploadRoute);

module.exports = router;
