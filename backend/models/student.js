const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  class: String,
  board: String,
  totalFee: Number,
  feePaid: Number,
  email: String,
  address: String
});

module.exports = mongoose.model("Student", studentSchema);
