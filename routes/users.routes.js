const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv/config");
//registration
router.get("/", (req, res) => {
  User.find()
    .then(allusers => {
      for (user in allusers) {
        allusers[user].password =
          "password is hashed , u r not allowed to see it";
      }
      res.json(allusers);
    })
    .catch(err => res.send(err));
});

//get all stylists
router.get("/stylists", (req, res) => {
  User.find({ role: "stylist" })
    .then(allstylists => {
      for (stylist in allstylists) {
        allstylists[stylist].password =
          "password is hashed , u r not allowed to see it";
      }
      res.json(allstylists);
    })
    .catch(err => res.send(err));
});

//get specific stylist by his id
router.get("/stylists/:id", (req, res) => {
  User.findById(req.params.id)
    .then(stylist => {
      res.json(stylist);
    })
    .catch(err => res.send(err));
});

router.post("/register", (req, res) => {
  const newUser = { ...req.body };
  User.findOne({ email: newUser.email })
    .then(user => {
      if (!user) {
        bcrypt.hash(newUser.password, 10, (err, hash) => {
          newUser.password = hash;
          User.create(newUser)
            .then(user =>
              res.json(`user ${newUser.email} created successfully`)
            )
            .catch(err => res.send(err));
        });
      } else {
        res.send("email exists , please use a different email ");
      }
    })
    .catch(err => res.send(err));
});

//login
router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          user.password = "";
          let payload = { user };
          let token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: "24h"
          });
          res.json({ msg: "logged in successfully", token: token });
        } else {
          res.send("password is not correct");
        }
      } else {
        res.send("email not found");
      }
    })
    .catch(err => {res.send(err)});
});
//get user
//get user will be from the frontend
router.get("/profile/:id", (req, res) => {
  User.findById(req.params.id)
    .then(user => {
      user.password = "";
      user ? res.json(user) : res.json("user not found");
    })
    .catch(err => res.send(err));
});

//edit user
router.put("/profile/:id", (req, res) => {
  let edited = req.body;
  if (edited.password) {
    bcrypt.hash(edited.password, 10, (err, hash) => {
      edited.password = hash;
    });
  }
  setTimeout(() => {
    User.findByIdAndUpdate(req.params.id, edited)
      .then(response => {
        res.json({ msg: "edited successfully", user: response });
      })
      .catch(err => {
        res.json({ msg: "something went wrong", err: err });
      });
  }, 3000);
});
module.exports = router;
