const User = require("../models/user");

const nodemailer = require("nodemailer");

const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "dasbabuoriginals@gmail.com",
    pass: `${process.env.PASS}`,
  },
});

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "SignUp",
    errorMessage: message,
    oldInput: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      Mobile_No: "",
    },
    validationErrors: [],
  });
};

exports.postSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const mobile = req.body.mobile;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "SignUp",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name: name,
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
        Mobile_No: mobile,
      },
      validationErrors: errors.array(),
    });
  }

  return bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        Mobile_No: mobile,
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      const mailOptions = {
        from: '"Dasbabu originals" dasbabuoriginals@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Welcome to Boi-Toi!! ", // Subject line
        html: "<h1>You successfully signed up!</h1>", // html body
      };
      return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          // res.status(400).send({success: false})
        } else {
          // res.status(200).send({success: true});
          console.log(info);
        }
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getlogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    errorMessage: message,
    pageTitle: "Login",
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      errorMessage: errors.array()[0].msg,
      pageTitle: "SignUp",
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        return res.status(422).render("auth/login", {
          errorMessage: "Invalid email or password.",
          pageTitle: "Login",
          oldInput: {
            email: email,
            password: password,
            confirmPassword: req.body.confirmPassword,
          },
          validationErrors: errors.array(),
        });
      }
      bcrypt
        .compare(password, userDoc.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = userDoc;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password.");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    errorMessage: message,
    pageTitle: "ResetPassword",
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((userDoc) => {
        if (!userDoc) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }
        userDoc.resetToken = token;
        userDoc.resetTokenExpiration = Date.now() + 3600000;
        return userDoc.save();
      })
      .then((result) => {
        res.redirect("/");
        const mailOptions = {
          from: '"Dasbabu originals" dasbabuoriginals@gmail.com', // sender address
          to: req.body.email, // list of receivers
          subject: "Password reset ", // Subject line
          html: `
          <p>You requested a password reset </p>
          <p>Click this new <a href ="http://localhost:8000/reset/${token}">Link</a> to set a new password.</p>
          `, // html body
        };
        return transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            // res.status(400).send({success: false})
          } else {
            // res.status(200).send({success: true});
            console.log(info);
          }
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(`the error is ${err}`);
    res.redirect("/");
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt
        .hash(newPassword, 12)
        .then((hashedPassword) => {
          resetUser.password = hashedPassword;
          resetUser.resetToken = undefined;
          resetUser.resetTokenExpiration = undefined;
          return resetUser.save();
        })
        .then((result) => {
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
