const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const bcrypt = require('bcrypt');

const aboutContent = "A Mongoose Blog Website is a web-based platform that uses Mongoose as a database tool to manage and store blog content (like articles, users, and comments). It is typically built using the MongoDB database, Node.js, and Express.js. Mongoose is an Object-Document Mapping (ODM) library for MongoDB and Node.js that provides a convenient way to interact with MongoDB databases using JavaScript objects. Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It acts as a bridge between your application's JavaScript code and the database, translating objects in code into documents in the database. Because native MongoDB is inherently schema-less (allowing data to be stored without strict rules), Mongoose is primarily used to impose structure and safety on unstructured data. ";
const contactContent = "This simple blog website was made by LBC. If you want to get in touch with him, the best way to get in touch with hime is through his email address which is ang_pogi_ko_talaga_walang_biro_10_18@gmail.com. Please wait at least 5 to 7 business days for him to reply and if he does not get back to you then forward your email by self replying on it.";

const app = express();

const UserModel = require("./models/User");
const mongoURI = "mongodb://localhost:27017/blogDB";

const store = new MongoDBSession({
  uri: mongoURI,
  collection: 'mySessions'
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  store: store
}));

mongoose.connect(mongoURI);

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

const isAuth = (req, res, next) => {
  if(req.session.isAuth){
    next();
  }else{
    res.redirect("/login");
  }
}

app.get("/", isAuth, async (req, res) => {
  try{
    const Posts = await Post.find({});
    res.render("home.ejs", {
      posts: Posts
    });
  }catch(err){
    console.error(err);
  }
});

app.get("/compose", isAuth, function(req, res){
  res.render("compose");
});


app.post("/compose", isAuth, async (req, res) => {
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


app.get("/posts/:postId", isAuth, async (req, res) => {

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


app.get("/edit/:postId", isAuth, async (req, res) => {

  try{

    const post = await Post.findById(req.params.postId);
    res.render("edit", { post: post } );

  }catch(err){
    console.log(err);
  }
});

app.post("/edit/:postId", isAuth, async (req, res) => {

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


app.get("/delete/:postId", isAuth, async (req, res) => {

  const postId = req.params.postId;

  try{

    await Post.findByIdAndDelete({_id: postId});
    res.redirect("/");

  }catch(err){
    console.error(err);
  }
});


app.get("/about", isAuth, function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", isAuth, function(req, res){
  res.render("contact", {contactContent: contactContent});
});


app.get('/login', (req, res) => {
  res.render('login.ejs');
});


// Handling Login POST requests
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({email});

    if(!user){
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
      return res.redirect("/login");
    }

    req.session.isAuth = true;
    res.redirect("/");
});

app.get('/register', (req, res) => {
  res.render('register.ejs');
})  

app.post('/register', async (req, res) => {
  
  const { username, email, password } = req.body;
  // Check if user already exists
  let user = await UserModel.findOne({ email });
  
  if (user){
    return res.redirect("/register");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  user = new UserModel({
    username,
    email,
    password: hashedPassword
  });

  user.save();
  res.redirect("/login");

});

// Handling Logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if(err){
        throw err;
      }
      res.redirect("/login");
    });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});

//MAIN SOURCE URL:https://www.youtube.com/watch?v=TDe7DRYK8vU 
