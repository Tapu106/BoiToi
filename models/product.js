const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  uploadTime: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviews: [
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      review: {
        type: String,
        required: true,
      },
      uploadTime: {
        type: String,
        default: () => moment().format("M/d/YYYY, h:mm a"),
      },
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
