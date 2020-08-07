const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth");

const { check, body } = require("express-validator/check");

const User = require("../models/user");

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-mail exists already. please pick a different one!"
            );
          }
        });
      }),

    body(
      "password",
      "Please enter a password with only numbers and at least 8 characters "
    )
      .isLength({ min: 8 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password have to match");
      }
      return true;
    }),
  ],
  authController.postSignUp
);

router.get("/login", authController.getlogin);

router.post("/login", authController.postLogin);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

router.get("/logout", authController.postLogout);

module.exports = router;
