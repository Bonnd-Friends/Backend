const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  username: String,
  likedUsers: [String],
  matches: [String],    
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;