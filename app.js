//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
//Level 2 - ENCRYPTION
// const encrypt = require('mongoose-encryption');

//Level 3 - HASHING
// const md5 = require('md5');

//LEVEL 4 - SALTING AND HASHING - bcrypt
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

const app = express();

// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

app.use(session({
  secret: "Our dear little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
// mongoose.set("useCreateIndex", true); // to avoid deprecation warning

const userSchema = new mongoose.Schema({ //schema should be mongoose schema to have a plugin(not only a javascript object)
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose); //shortens the code compared to passport local

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

//Making and breaking cookies
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function (req,res) {
  res.render("home");
});

app.get("/login",function (req,res) {
  res.render("login");
});

app.get("/register",function (req,res) {
  res.render("register");
});

app.get("/secrets", function (req,res) {
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
});

app.get("/logout", function (req,res) {
  req.logout(function(err) { //logout should be a callback function acc to latest version
    if (err) { return err; }
    res.redirect('/');
  });
});

app.post("/register", function(req,res) {

  User.register({username: req.body.username}, req.body.password, function (err,user) {
    if(err)
    {
      console.log(err);
      res.redirect("/register");
    }
    else
    {
      passport.authenticate("local")(req,res,function () {
        res.redirect("/secrets");
      });
    }
  });

  // bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
  //   const newUser = new User({
  //     email: req.body.username,
  //     password: hash
  //   });
  //
  //   newUser.save(function (err){
  //     if(err){
  //       console.log(err);
  //     }else{
  //       res.render("secrets");
  //     }
  //   });
  // });
});

// console.log(md5("allnumbers"));

app.post("/login", function (req,res) {

const user = new User({
  username: req.body.username,
  password: req.body.password
});

req.login(user, function (err) {
  if(err){
    console.log(err);
  }
  else {
    passport.authenticate("local")(req,res,function () {
      res.redirect("/secrets");
    });
  }
});

  // const username = req.body.username;
  // const password = md5(req.body.password);
  //
  // User.findOne({email:username}, function (err, foundUser){
  //   if(err)
  //   {
  //     console.log(err);
  //   }
  //   else
  //   {
  //     if(foundUser)
  //     {
  //       bcrypt.compare(password, foundUser.password, function(err, result)
  //       {
  //         if(result ===true)
  //         {
  //           res.render("secrets");
  //         }
  //       });
  //     }
  //   }
  // });
});

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
