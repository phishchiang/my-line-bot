const GuessState = require('../models/guessVal');

// @desc    Get addGuessState
// @route   Get /api/v1/transactions
// @access  Public
exports.getGuessState = async (req, res, next) => {
  try {
    // const { groupId } = req.body;
    // get the latest one from the group
    const guessState = await GuessState.find({
      groupId: req.params.id,
    }).sort({ createdAt: -1 });
    // .limit(1);

    return res.status(201).json({
      success: true,
      data: guessState,
    });
  } catch (error) {
    (error) => console.log('Error', error);
  }
};

// @desc    Add addGuessState
// @route   POST /api/v1/transactions
// @access  Public
exports.addGuessState = async (req, res, next) => {
  try {
    const { groupId, winner, amount } = req.body;
    const guessState = await GuessState.create(req.body);
    return res.status(201).json({
      success: true,
      data: guessState,
    });
  } catch (error) {
    (error) => console.log('Error', error);
  }
};
