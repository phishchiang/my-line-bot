const TempState = require('../models/tempVal');

// @desc    Get getTempState
// @route   Get /api/v1/tempState/
// @access  Public
exports.getTempState = async (req, res, next) => {
  try {
    // const { groupId } = req.body;
    // get the latest one from the group
    const tempState = await TempState.find();
    // .limit(1);

    return res.status(201).json({
      success: true,
      data: tempState,
    });
  } catch (error) {
    (error) => console.log('Error', error);
  }
};

// @desc    Add addTempState
// @route   POST /api/v1/tempState
// @access  Public
exports.addTempState = async (req, res, next) => {
  try {
    // const { groupId, winner, amount } = req.body;
    const tempState = await TempState.create(req.body);
    return res.status(201).json({
      success: true,
      data: tempState,
    });
  } catch (error) {
    (error) => console.log('Error', error);
  }
};
