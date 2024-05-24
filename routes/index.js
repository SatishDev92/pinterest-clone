const express = require('express');
const bcrypt = require('bcrypt');
const userModel = require('./users'); // Ensure this path is correct
const router = express.Router();
const jwt = require("jsonwebtoken");
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/signup', function(req, res) {
  res.render('signup');
});

router.get("/login", function (req, res){
  res.render("login");
});

router.post('/signupping', async function(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send("All fields are required.");
  }
  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters long.");
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      username,
      password: hash,
      email
    });
    const token = jwt.sign({ email: email }, JWT_SECRET);
    res.cookie("token", token);
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});

router.get("/logout", function(req, res) {
  try {
    res.cookie("token", "");
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error.");
  }
});

router.post("/loginn", async function(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("All fields are required.");
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid credentials.");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET);
      res.cookie("token", token);
      res.redirect("/home");
    } else {
      res.status(400).send("Invalid credentials.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});

router.get("/close", function(req, res) {
  res.redirect("/");
});

router.get("/home", isLogIn, function(req, res) {
  res.render("home");
});

router.get("/profile", isLogIn, function(req, res) {
  res.send("Welcome to the profile page.");
});

router.get("/create", isLogIn, function(req, res) {
  res.send("Create something.");
});

function isLogIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/");
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
}

module.exports = router;
