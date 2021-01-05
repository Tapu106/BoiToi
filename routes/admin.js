const path = require("path");

const express = require("express");

const { body } = require("express-validator/check");

const adminController = require("../controllers/admin");

const isAuth = require("../middlewares/isAuth");

const router = express.Router();

router.get(
  "/add-product",
  [
    body("name").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.getAddproducts
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product/",
  [
    body("name").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post(
  "/add-product",
  [
    body("name").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  adminController.postAddProduct
);

router.get("/add-category", isAuth, adminController.getAddCategory);

router.post(
  "/add-category",
  [body("name").isString().isAlpha().isLength({ min: 3 }).trim()],
  isAuth,
  adminController.postAddCategory
);

router.get("/products", isAuth, adminController.getProduct);

router.delete("/product/:productId", adminController.deleteProduct);

module.exports = router;
