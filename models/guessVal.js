const mongoose = require('mongoose');

const GuessGameSchema = new mongoose.Schema({
  text: {
    type: String,
    trim: true,
    // required: [true, 'Please add some text'],
  },
  winner: {
    type: Boolean,
  },
  amount: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GuessState', GuessGameSchema);
