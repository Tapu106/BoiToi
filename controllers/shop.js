const Product = require("../models/product");
const helpCart = require("../utils/manageCart");
const { checkout } = require("../routes/shop");

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
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: product.name,
        prod: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.searchProduct = (req, res, next) => {
  try {
    Product.find({
      $or: [
        { category: { $regex: req.query.q } },
        { name: { $regex: req.query.q } },
      ],
    })
      .then((result) => {
        console.log(result);
        res.render("shop/search-result", {
          pageTitle: "Search Results",
          prods: result,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
};

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
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
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
      console.log(result);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeItemFromCart(prodId)
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

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
      console.log(err);
    });
};
