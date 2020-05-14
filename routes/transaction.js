const express = require('express');
const router = express.Router();
const { addTransaction } = require('../controllers/transactions');

router.route('/').post(addTransaction);

module.exports = router;
