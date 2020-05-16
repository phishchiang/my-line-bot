const express = require('express');
const router = express.Router();
const { addGuessState, getGuessState } = require('../controllers/guessState');

router.route('/').post(addGuessState).get(getGuessState);

module.exports = router;
