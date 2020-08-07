const Product = require("../models/product");

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        user: req.user,
        prods: products,
        pageTitle: "Boi-Toi A online Book shop platform",
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
        user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
