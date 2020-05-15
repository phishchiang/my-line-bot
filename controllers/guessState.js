const GuessState = require('../models/guessVal');

// @desc    Add addGuessState
// @route   POST /api/v1/transactions
// @access  Public
exports.addGuessState = async (req, res, next) => {
  try {
    const { text, winner, amount } = req.body;
    const guessState = await GuessState.create(req.body);
    return res.status(201).json({
      success: true,
      data: guessState,
    });
  } catch (error) {
    (error) => console.log('Error', error);
  }
};
