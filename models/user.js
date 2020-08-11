const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  password: {
    type: String,
    required: true,
  },
  Mobile_No: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },

  whishList: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        isWishListed: {
          type: Boolean,
          default: false,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const CartProdIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  let newPrice;

  updatedItems = [...this.cart.items];

  if (CartProdIndex >= 0) {
    newQuantity = this.cart.items[CartProdIndex].quantity + 1;
    newPrice = this.cart.items[CartProdIndex].price * newQuantity;
    updatedItems[CartProdIndex].quantity = newQuantity;
    updatedItems[CartProdIndex].price = newPrice;
  } else {
    updatedItems.push({
      productId: product._id,
      quantity: newQuantity,
      productName: product.name,
      price: product.price,
    });
  }
  const updatedCart = {
    items: updatedItems,
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.addToCartWithQty = function (product, quantity) {
  const CartProdIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  const updatedQuantity = quantity;
  let newQuantity, newPrice;

  updatedItems = [...this.cart.items];

  if (CartProdIndex >= 0) {
    newQuantity = this.cart.items[CartProdIndex].quantity + updatedQuantity;
    newPrice = this.cart.items[CartProdIndex].price * newQuantity;
    updatedItems[CartProdIndex].quantity = newQuantity;
    updatedItems[CartProdIndex].price = newPrice;
  } else {
    updatedItems.push({
      productId: product._id,
      quantity: updatedQuantity,
      productName: product.name,
      price: product.price,
    });
  }
  const updatedCart = {
    items: updatedItems,
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeItemFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.addToWishlist = function (product) {
  const updatedItems = [...this.whishList.items];

  updatedItems.push({
    productId: product._id,
    productName: product.name,
    isWishListed: true,
    price: product.price,
  });

  const updatedWishlist = {
    items: updatedItems,
  };
  this.whishList = updatedWishlist;

  return this.save();
};

userSchema.methods.removeFromWishlist = function (productId) {
  const updatedCartItems = this.whishList.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });

  this.whishList.items = updatedCartItems;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
