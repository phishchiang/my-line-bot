const mongoose = require('mongoose');

const BodyTempSchema = new mongoose.Schema({
  temp: {
    type: Number,
  },
  isTesting: {
    type: Boolean,
  },
  doneTest: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TempState', BodyTempSchema);
