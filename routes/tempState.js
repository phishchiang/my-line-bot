const express = require('express');
const router = express.Router();
const {
  getTempState,
  addTempState,
  updateTempState,
} = require('../controllers/tempState');

router.route('/').post(addTempState).get(getTempState).put(updateTempState);

module.exports = router;
