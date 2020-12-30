require("dotenv").config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Player = require("./models/player");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");

var commentRoutes = require("./routes/comments");
var playerRoutes = require("./routes/players");
var indexRoutes = require("./routes/index");

mongoose.connect("mongodb+srv://xilaizhang:Xirich8@@cfc-cluster.vyjy5.mongodb.net/cfc?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true});
//mongoose.connect("mongodb://localhost:27017/cfc", { useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static( __dirname+"/public"));
app.use('/exp', express.static(__dirname + '/node_modules/jquery-bar-rating/examples'));
app.use('/scripts', express.static(__dirname + '/node_modules/jquery-bar-rating/dist'));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash()); //before express-session
//seedDB();

//passport config
app.use(require("express-session")({
    secret: "hazard should have stayed at chelsea",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){ //pass current user to every route
   res.locals.currentUser = req.user; //req.user is defined by passport
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use(indexRoutes);
app.use("/players", playerRoutes); //will be appended to beginning of every route inside
app.use("/players/:id/comments",commentRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("cfc app has started"); 
});
