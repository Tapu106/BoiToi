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
        default: () => moment().format("l, h:mm a"),
      },
      rating: {
        type: Number,
      },
    },
  ],
  rating_five: {
    type: Number,
    default: 0,
  },
  rating_four: {
    type: Number,
    default: 0,
  },
  rating_three: {
    type: Number,
    default: 0,
  },
  rating_two: {
    type: Number,
    default: 0,
  },
  rating_one: {
    type: Number,
    default: 0,
  },
  ratingSum: {
    type: Number,
    default: 0,
  },
});

productSchema.methods.ratingStarFull = function (
  product,
  userName,
  userEmail,
  userReview,
  starReview
) {
  console.log("what prpoduct", this);
  const updatedReviews = [...this.reviews];

  updatedReviews.push({
    name: userName,
    email: userEmail,
    review: userReview,
    rating: starReview,
  });
  this.reviews = updatedReviews;
  // return this.save();

  let quantity = 1;
  let sum = 0;
  let ratingStar;
  switch (starReview) {
    case 5:
      ratingStar = this.rating_five;
      ratingStar += quantity;
      sum = ratingStar * 5;
      this.ratingSum = this.ratingSum + starReview;
      this.rating_five = ratingStar;

      return this.save();
      break;
    case 4:
      ratingStar = this.rating_four;
      ratingStar += quantity;
      sum = ratingStar * 4;
      this.ratingSum = this.ratingSum + starReview;
      this.rating_four = ratingStar;
      return this.save();
      break;
    case 3:
      ratingStar = this.rating_three;
      ratingStar += quantity;
      sum = ratingStar * 3;
      this.ratingSum = this.ratingSum + starReview;
      this.rating_three = ratingStar;
      return this.save();
      break;
    case 2:
      ratingStar = this.rating_two;
      ratingStar += quantity;
      sum = ratingStar * 2;
      this.ratingSum = this.ratingSum + starReview;
      this.rating_two = ratingStar;
      return this.save();
      break;
    case 1:
      ratingStar = this.rating_one;
      ratingStar += quantity;
      sum = ratingStar * 1;
      this.ratingSum = this.ratingSum + starReview;
      this.rating_one = ratingStar;
      return this.save();
      break;
    default:
      ratingStar = this.rating_one;
      break;
  }
};

module.exports = mongoose.model("Product", productSchema);
