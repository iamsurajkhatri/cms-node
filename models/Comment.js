const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  body: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Comment", CommentSchema);
