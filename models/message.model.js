const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Message = new Schema(
  {
    message: { type: String, required: true },
    image: { type: String }, // optional image
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", Message);
