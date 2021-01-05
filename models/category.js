const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  products: [
    {
      Product: {
        type: Object,
      },
    },
  ],
});

module.exports = mongoose.model("Category", categorySchema);
