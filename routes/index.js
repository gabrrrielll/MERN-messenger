const express = require("express");
const JWT = require("jsonwebtoken");

const CONTROLLER = require("../controller/index");
const CONFIG = require("../config");
const User = require("../models/users");
const router = express.Router();

const nodemailer = require("nodemailer");
const mailValidator = require("email-validator");

router.get("/healthcheck", (req, res) => {
     res.status(200).json({ message: "Server is alive" });
});

const middleware = (req, res, next) => {
     // function middleware for check the validity of token in all requests
     if (req.headers["token"]) {
          var token = req.headers["token"];
     } else if (req.params.token) {
          var token = req.params.token;
     } else if (req.body.token) {
          var token = req.body.token;
     } else {
          res.status(403);
          res.send({ message: "Token empty", authorized: false });
          return;
     }
     JWT.verify(token, CONFIG.JWT_SECRET_KEY, (error, payload) => {
          if (error) {
               res.status(403);
               res.send({ message: "Invalid token", authorized: false });
               myEmail = undefined;
               return myEmail;
          } else {
               req.email = payload.email;
               req.token = token;
               // update Last Activity because allmost actions going over here
               User.updateOne({ email: payload.email }, { $set: { last_activity: Date.now().toString() } })
                    .then(data => {
                         if (data == null) {
                              console.log("Empty data", data);
                         }
                         // console.log("Update last activity: ", data);
                    })
                    .catch(err => {
                         console.log("Error in DB", err);
                    });
               next();
          }
     });
};

router.use("/confirm/:token", middleware);
router.use("/conversation", middleware);
router.use("/sendfriendrequest", middleware);
router.use("/revokefriendrequest", middleware);
router.use("/deniedfriendrequest", middleware);
router.use("/acceptfriendrequest", middleware);
router.use("/removefriend", middleware);
router.use("/addMessage", middleware);
router.use("/changeprofile", middleware);
router.use("/changecolorprofile", middleware);

router.get("/confirm/:token", CONTROLLER.confirmToken);
router.get("/conversation", CONTROLLER.conversation);
router.post("/sendfriendrequest", CONTROLLER.sendFriendRequest);
router.post("/revokefriendrequest", CONTROLLER.revokeFriendRequest);
router.post("/deniedfriendrequest", CONTROLLER.deniedFriendRequest);
router.post("/acceptfriendrequest", CONTROLLER.acceptFriendRequest);
router.post("/removefriend", CONTROLLER.removeFriend);
router.post("/addMessage", CONTROLLER.addMessage);
router.post("/changeprofile", CONTROLLER.changeProfile);
router.post("/changecolorprofile", CONTROLLER.setColor);

router.post("/checktoken", CONTROLLER.checkToken);

router.post("/register", CONTROLLER.register);
router.post("/login", CONTROLLER.login);

var Se ="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxI ";
/* var se = () => {
  
  return("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxI ");

};   */
//module.exports ={Se};
module.exports = router;
