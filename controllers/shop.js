const Product = require("../models/product");
const helpCart = require("../utils/manageCart");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const moment = require("moment");

const PDFDocument = require("pdfkit");

const stripe = require("stripe")(process.env.STRIPE_KEY);


/* -------------------- Home Page ------------------------ */

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Boi-Toi A online Book shop platform",
        cart: helpCart.cart,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const stringProdId = req.params.productId;
  const prodId = mongoose.Types.ObjectId(stringProdId);
  console.log(typeof prodId);
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: product.name,
        prod: product,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      // console.log(err);
    });
};

/* --------------------- Search Product ---------------------- */

exports.searchProduct = (req, res, next) => {
  const searchedProduct = req.query.q;
  const finalQuery = searchedProduct.toLowerCase();

  Product.find({
    $or: [
      { category: { $regex: finalQuery } },
      { name: { $regex: finalQuery } },
    ],
  })
    .then((result) => {
      res.render("shop/search-result", {
        pageTitle: "Search Results",
        prods: result,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/* ---------- Cart Controller ---------------  */

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      let total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      res.render("shop/cart", {
        pageTitle: "Cart",
        products: products,
        sum: total,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartWithQty = (req, res, next) => {
  const prodId = req.body.productId;
  const quantity = parseInt(req.body.quantity);

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCartWithQty(product, quantity);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeItemFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/* ------ Wishlist Controller ----------- */

exports.postWishlist = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToWishlist(product);
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.removeFromWhislist = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeFromWishlist(prodId)
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteWishlisttItem = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .clearWishList(prodId)
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


/* ----------------Checkout Controller---------------*/

exports.getCheckout = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      let total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      res.render("shop/checkout", {
        pageTitle: "checkout",
        product: products,
        sum: total,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


/* -------------- Order Controller --------------*/

exports.postOrder = (req, res, next) => {
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      user.cart.items.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });

      const order = new Order({
        products: products,
        user: {
          email: req.user.email,
          userId: req.user,
        },
        orderTime: moment().format("LLL"),
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrderStripe = (req, res, next) => {
  const token = req.body.stripeToken;
  let totalSum = 0;

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      user.cart.items.forEach((p) => {
        totalSum += p.quantity * p.productId.price;
      });

      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
        orderTime: moment().format("LLL"),
      });
      return order.save();
    })
    .then((result) => {
      const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: "usd",
        description: "Demo Order",
        source: token,
        metadata: { order_id: result._id.toString() },
      });
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrder = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      let total = 0;

      res.render("shop/order1", {
        pageTitle: "Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("-----------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.name +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price
          );
      });
      pdfDoc.text("---------");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);

      pdfDoc.end();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


/* -------------------- Review Controller --------------- */

exports.reviewProduct = (req, res, next) => {
  const userName = req.body.name;
  const userEmail = req.body.email;
  const userReview = req.body.product_review;
  const starReview = parseInt(req.body.rating, 10);
  const prodId = req.body.productId;
  console.log(typeof starReview);

  Product.findById(req.body.productId)
    .then((product) => {
      req.product = product;
      // console.log(req.product);
      // product.reviews.push({
      //   name: userName,
      //   email: userEmail,
      //   review: userReview,
      //   rating: starReview,
      // });
      // return product.save().then((product) => {
      //   console.log(product);
      //   return prod.ratingStarFull(product, starReview);
      // });
      return req.product.ratingStarFull(
        product,
        userName,
        userEmail,
        userReview,
        starReview
      );
    })
    .then((result) => {
      res.redirect("back");
    })
    .catch((err) => {
      console.log(err);
    });
};
