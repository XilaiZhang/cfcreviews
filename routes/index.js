var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/",function(req, res){
   res.render("landing");
});



//auth routes
router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            //console.log(err);
            req.flash("error", err.message);
            // req.session.save(function(){    //from reddit don;t work 
            //     res.render("register"); 
            // });
            res.render("register", {error: req.flash("error")}); //why does app.js locals not work?
        }
        else{
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "welcome "+ user.username);
                res.redirect("/players"); 
            });
        }
        
    });
});

router.get("/login", function(req,res){
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/players",
        failureRedirect: "/login"
    }), function(req, res){
    
});

router.get("/logout",function(req, res){
   req.logout(); 
   req.flash("success", "Logged you out!");
   res.redirect("/players");
});


module.exports = router;