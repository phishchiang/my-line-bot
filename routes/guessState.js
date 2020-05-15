const express = require('express');
const router = express.Router();
const { addGuessState } = require('../controllers/guessState');

router.route('/').post(addGuessState);

module.exports = router;
