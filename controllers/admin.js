const Product = require("../models/product");
const filehelper = require("../utils/file");
const { validationResult } = require("express-validator/check");
const Category = require("../models/category");
const moment = require("moment");

exports.getAddCategory = (req, res, next) => {
  res.render("admin/add-category", {
    pageTitle: " BoiToi | Add Category",
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddCategory = (req, res, next) => {
  const name = req.body.name;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/add-category", {
      pageTitle: "Add Product",
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const category = new Category({
    name: name,
  });
  category
    .save()
    .then((resu) => {
      console.log(resu);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddproducts = (req, res, next) => {
  Category.find()
    .then((categories) => {
      res.render("admin/edit-product", {
        pageTitle: "Add Product",
        editing: false,
        errorMessage: null,
        categories: categories,
        validationErrors: [],
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddProduct = (req, res, next) => {
  const name = req.body.name;
  const updatedName = name.toLowerCase();
  const category = req.body.category;
  const price = req.body.price;
  const description = req.body.description;
  const image = req.file;
  const uploadedDate = moment().format("LLL");

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      editing: false,
      product: {
        name: updatedName,
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
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      editing: false,
      product: {
        name: updatedName,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    name: updatedName,
    price: price,
    category: category,
    description: description,
    imageUrl: imageUrl,
    uploadTime: uploadedDate,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      console.log("Created Product");
      console.log("unpou", category);
      return Category.findOne({ name: category }).then((cat) => {
        console.log("res", result);
        console.log("categor", cat);
        cat.products.push({ Product: result });
        return cat.save().then((ree) => {
          res.redirect("/");
        });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
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
    .then((res) => {
      return req.user.clearWishList(prodId);
    })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.status(200).json({ message: "Success!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting product failed." });
    });
};
