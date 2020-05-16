const express = require('express');
const router = express.Router();
const {
  addGuessState,
  getGuessState,
  updateGuessState,
} = require('../controllers/guessState');

router.route('/').post(addGuessState);

router.route('/:id').post(getGuessState).put(updateGuessState);

module.exports = router;
