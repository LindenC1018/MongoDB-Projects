//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

const aboutContent = "A Mongoose Blog Website is a web-based platform that uses Mongoose as a database tool to manage and store blog content (like articles, users, and comments). It is typically built using the MongoDB database, Node.js, and Express.js. Mongoose is an Object-Document Mapping (ODM) library for MongoDB and Node.js that provides a convenient way to interact with MongoDB databases using JavaScript objects. Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It acts as a bridge between your application's JavaScript code and the database, translating objects in code into documents in the database. Because native MongoDB is inherently schema-less (allowing data to be stored without strict rules), Mongoose is primarily used to impose structure and safety on unstructured data. ";
const contactContent = "This simple blog website was made by LBC. If you want to get in touch with him, the best way to get in touch with hime is through his email address which is ang_pogi_ko_talaga_walang_biro_10_18@gmail.com. Please wait at least 5 to 7 business days for him to reply and if he does not get back to you then forward your email by self replying on it.";

const app = express();
const port = 4007;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//how to use nodejs express passport async await login example

mongoose.connect("mongodb://localhost:27017/blogDB");

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

/*
app.get("/login", (req, res) => {
  res.render("login");
});
*/

app.get("/", async (req, res) => {
  try{
    const Posts = await Post.find({});
    res.render("home.ejs", {
      posts: Posts
    });
  }catch(err){
    console.error(err);
  }
});

app.get("/compose", function(req, res){
  res.render("compose");
});



app.post("/compose", async (req, res) => {
  try{
    const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody
    });

    const savedPost = await post.save();
    res.redirect("/");
  }catch(err){
    console.error(err);
  }
});


app.get("/posts/:postId", async (req, res) => {

  const requestedPostId = req.params.postId;

  try{
    
    const post = await Post.findOne({_id: requestedPostId});
    res.render("post", {
      title: post.title,
      content: post.content
    });
  }catch(err){
    console.error(err);
  }

});


app.get("/edit/:postId", async (req, res) => {

  try{

    const post = await Post.findById(req.params.postId);
    res.render("edit", { post: post } );

  }catch(err){
    console.log(err);
  }
});

app.post("/edit/:postId", async (req, res) => {

  const postId = req.params.postId;

  try{

      const title = req.body.postTitle;
      const content = req.body.postBody;

      const post = await Post.findByIdAndUpdate({_id: postId}, {
        title, content
      });

      if(req.body.postTitle){
        post.title = req.body.postTitle;
      }

      if(req.body.postBody){
        post.content = req.body.postBody;
      }
      res.redirect("/");


  }catch(err){
    console.log(err);
  }
});


app.get("/delete/:postId", async (req, res) => {

  const postId = req.params.postId;

  try{

    await Post.findByIdAndDelete({_id: postId});
    res.redirect("/");

  }catch(err){
    console.error(err);
  }
});



app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});




app.listen(port, function() {
  console.log("Server started on port 3000");
});
