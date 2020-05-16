const GuessState = require('../models/guessVal');

// @desc    Update addGuessState
// @route   Update /api/v1/guessState/:groupID
// @access  Public
exports.updateGuessState = async (req, res, next) => {
  if (req.body.restart) {
    const magicNum = Math.floor(Math.random() * 10);
    try {
      const guessState = await GuessState.updateOne(
        { groupId: req.params.id },
        {
          $set: {
            amount: magicNum,
          },
        }
      );

      return res.status(201).json({
        success: true,
        data: guessState,
      });
    } catch (error) {
      (error) => console.log('Error', error);
    }
  } else {
    try {
      // const { groupId } = req.body;
      // get the latest one from the group
      const guessState = await GuessState.updateOne(
        { groupId: req.params.id },
        {
          $set: {
            winner: true,
          },
        }
      );

      return res.status(201).json({
        success: true,
        data: guessState,
      });
    } catch (error) {
      (error) => console.log('Error', error);
    }
  }
};

// @desc    Get addGuessState
// @route   Get /api/v1/guessState/:groupID
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
// @route   POST /api/v1/guessState
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
