var express = require("express");
var router = express.Router();
var Player = require("../models/player");
var middleware = require("../middleware/index.js");
var Fuse = require("fuse.js");
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "cfcreviews",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

//index - show all players
router.get("/", function(req, res){
    if (req.query.search) {
        Player.find({}, function(err, allPlayers) {
          if (err) {
            console.log(err);
          } else {        
            var options = {
              minMatchCharLength: 2,
              keys: ["name"]
            };
            var fuse = new Fuse(allPlayers, options);
            var result = fuse.search(req.query.search);
            if (result.length < 1) {
              req.flash("error", "no player name matches searching result");
              res.render("players/index", {players: allPlayers, error: req.flash("error")});
            }
            else{
                var results = [];
                result.forEach(function(r){
                   results.push(r.item); 
                });
                req.flash("success", "find "+result.length+" result that match your search");
                res.render("players/index", {
                  players: results, success: req.flash("success")
                });
            }
          }
        });
      }
      
    else if (req.query.sortby) {
        if (req.query.sortby === "ratingLow") {
          Player.find({})
            .sort({
              rating: 1
            })
            .exec(function(err, allPlayers) {
              if (err) {
                console.log(err);
              } else {
                res.render("players/index", {
                  players: allPlayers,
                });
              }
            });
        }
        else if (req.query.sortby === "ratingHigh") {
          Player.find({})
            .sort({
              rating: -1
            })
            .exec(function(err, allPlayers) {
              if (err) {
                console.log(err);
              } else {
                res.render("players/index", {
                  players: allPlayers,
                });
              }
            });
        }
        else if (req.query.sortby === "nameLow") {
          Player.find({}).collation({locale: "en" })
            .sort({
              name: 1
            })
            .exec(function(err, allPlayers) {
              if (err) {
                console.log(err);
              } else {
                res.render("players/index", {
                  players: allPlayers,
                });
              }
            });
        }
    } 
    else{
       Player.find({}, function(err, allPlayers){
            if(err){console.log(err);}
            else{
               res.render("players/index", {players:allPlayers}); //req.user is defined by passport 
            }
        }); 
    }
    
    
});

//create - add new player to db
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res){
    cloudinary.v2.uploader.upload(
      req.file.path,
      {width: 160, height:160, crop:"scale"},
      function(err, result){
        if (err) { req.flash("error", err.message); console.log(err.message); return res.redirect("/players");}
        req.body.player.image = result.secure_url;
        req.body.player.imageId = result.public_id;
        req.body.player.author ={
          id: req.user._id,
          username: req.user.username
        };
        
        //create new player and save
        Player.create(req.body.player, function(err, newlyCreated){
           if(err){console.log(err);}
           else{
              res.redirect("/players"); 
           }
        });
      }
    );
});

// new route - show form
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("players/new");
});

//SHOW - show more info about one player
router.get("/:id", function(req, res){
    Player.findById(req.params.id).populate("comments").exec(function(err, foundPlayer){
        if(err){console.log(err);}
        else{
            foundPlayer.views = foundPlayer.views + 1;
            foundPlayer.save();
            res.render("players/show", {player: foundPlayer});
        }
    });
    
});

//edit player route
router.get("/:id/edit", middleware.checkPlayerOwnership, function(req, res){
    //is user loggedin and own the campground
    Player.findById(req.params.id, function(err, foundPlayer){
        if(err){req.flash("error", "player not found");}
        res.render("players/edit", {player: foundPlayer}); 
    });
});

//update player route, find, update, redirect
router.put("/:id", middleware.checkPlayerOwnership, upload.single("image"), function(req, res){
    Player.findByIdAndUpdate(req.params.id, req.body.player,{useFindAndModify: false}, async function(err, updatedPlayer){
       if(err){
           res.redirect("/players");
       }
       else{
          if (req.file) {
              try {
                await cloudinary.v2.uploader.destroy(updatedPlayer.imageId);
                var result = await cloudinary.v2.uploader.upload(
                  req.file.path,
                  {
                    width: 160,
                    height: 160,
                    crop:"scale"
                  }
                );
                updatedPlayer.imageId = result.public_id;
                updatedPlayer.image = result.secure_url;
              } catch (err) {
                req.flash("error", err.message);
                return res.redirect("/players");
              }
              

            }
          updatedPlayer.save();
          req.flash("success", "Successfully updated your player!");
          res.redirect("/players/"+ req.params.id);
       }
    });
});

//destroy player route
router.delete("/:id", middleware.checkPlayerOwnership, function(req, res){
    Player.findById(req.params.id, {useFindAndModify: false}, async function(err, player){
       if(err){
           req.flash("error", err.message);
           return res.redirect("/players");
       }
       try {
          await cloudinary.v2.uploader.destroy(player.imageId);
          player.remove();
          res.redirect("/players");
        } catch (err) {
          if (err) {
            req.flash("error", err.message);
            return res.redirect("/players");
          }
        }
       
    });
});

//add new rating
router.post("/:id/ratings", function(req,res){
   //lookup player, create comment, connect, redirect
   Player.findById(req.params.id, function(err, player){
      if(err){console.log(err);res.redirect("/players");}
      else{
          var rawScore = Number(req.body.score);
          if(player.numRating === 0){
              player.rating = rawScore;
              player.numRating = 1;
          }
          else{
              player.rating = ((rawScore + player.rating * player.numRating) / (player.numRating + 1)).toFixed(2);
              player.numRating += 1;
          }
          player.save();
          req.flash("success", "successfully submitted rating for "+player.name);
          res.redirect("/players/"+req.params.id);
      }
   });
});


module.exports = router;