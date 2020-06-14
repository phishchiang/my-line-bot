const express = require('express');
const router = express.Router();
const { getTempState, addTempState } = require('../controllers/tempState');

router.route('/').post(addTempState).get(getTempState);

module.exports = router;
