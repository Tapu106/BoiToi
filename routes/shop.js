const express = require("express");

const router = express.Router();

const shopController = require("../controllers/shop");
const isAuth = require("../middlewares/isAuth");

router.get("/", shopController.getIndex);

router.get("/products/:productId", shopController.getProduct);

router.get("/search", shopController.searchProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.deleteCartItem);

router.post("/cart-wishlist-item", isAuth, shopController.deleteWishlisttItem);

router.post("/add-cart-with-quantity", isAuth, shopController.postCartWithQty);

router.post("/add-to-whishlist", isAuth, shopController.postWishlist);

router.post("/remove-from-whishlist", shopController.removeFromWhislist);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/create-order", shopController.postOrder);

router.get("/orders", shopController.getOrder);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
