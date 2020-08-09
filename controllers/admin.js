const Product = require("../models/product");
const filehelper = require("../utils/file");
const { validationResult } = require("express-validator/check");

exports.getAddproducts = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    editing: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const name = req.body.name;
  const category = req.body.category;
  const price = req.body.price;
  const description = req.body.description;
  const image = req.file;

  if (!image) {
    return res.status(422).render("admin/add-product", {
      pageTitle: "Add Product",
      product: {
        name: name,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not image",
      validationErrors: [],
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/add-product", {
      pageTitle: "Add Product",
      product: {
        name: name,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    name: name,
    price: price,
    category: category,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      console.log("Created Product");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        prods: product,

        editing: editMode,
        validationErrors: [],
        errorMessage: null,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedName = req.body.name;
  const updatedCategory = req.body.category;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const image = req.file;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      editing: true,
      prods: {
        name: updatedName,
        price: updatedPrice,
        description: updatedDesc,
        category: updatedCategory,
        _id: prodId,
      },
      user: req.user,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redierect("/");
      }
      product.name = updatedName;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.category = updatedCategory;

      if (image) {
        filehelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then((result) => {
        console.log("Product Updated");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        pageTitle: "Admin Products",
        prods: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        console.log("there is no product");
        return res.redierect("/");
      }
      filehelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.status(200).json({ message: "Success!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting product failed." });
    });
};
