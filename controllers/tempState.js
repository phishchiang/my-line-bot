const TempState = require('../models/tempVal');

// @desc    Get getTempState
// @route   Get /api/v1/tempState/
// @access  Public
exports.getTempState = async (req, res, next) => {
  try {
    // const { groupId } = req.body;
    // get the latest one from the group
    const tempState = await TempState.find().sort({ createdAt: -1 }).limit(1);

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

// @desc    Update updateTempState
// @route   Update /api/v1/tempState/
// @access  Public
exports.updateTempState = async (req, res, next) => {
  const tempFields = {};
  tempFields.temp = req.body.temp;
  tempFields.isTesting = req.body.isTesting;
  tempFields.doneTest = req.body.doneTest;
  tempFields.createdAt = new Date();

  try {
    const tempState = await TempState.find()
      .sort({ createdAt: -1 })
      .limit(1)
      .updateOne({
        $set: tempFields,
      });
    console.log(tempFields);
    return res.status(201).json({
      success: true,
      data: tempState,
    });
  } catch (error) {
    (error) => console.log('Error', error);
  }
};
