const express = require("express");

const router = express.Router();

const shopController = require("../controllers/shop");
const isAuth = require("../middlewares/isAuth");

router.get("/", shopController.getIndex);

router.get("/products/:productId", shopController.getProduct);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.deleteCartItem);

router.post('/add-cart-with-quantity', isAuth, shopController.postCartWithQty);

module.exports = router;
