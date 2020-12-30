var express = require("express");
var router = express.Router({mergeParams: true}); //needed for findById to find req.params.id, get from app.use
var Player = require("../models/player");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");
var mongoose = require("mongoose");

//comments routes
router.get("/new", middleware.isLoggedIn, function(req, res){
    Player.findById(req.params.id, function(err, player){
        if(err){console.log(err);}
        else{
            res.render("comments/new", {player: player}); 
        }
    });
});

//comments create
router.post("/", middleware.isLoggedIn, function(req,res){
   //lookup player, create comment, connect, redirect
   Player.findById(req.params.id, function(err, player){
      if(err){console.log(err);res.redirect("/players");}
      else{
          Comment.create(req.body.comment, function(err, comment){
              if(err){
                  req.flash("error", "something went wrong");
                  console.log(err);
              }
              else{
                  //add username and id to comment, and save
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  comment.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                  comment.save();
                  player.comments.push(comment);
                  player.save();
                  req.flash("success", "successfully added comment");
                  res.redirect("/players/"+player._id);
              }
          });
      }
   });
});

//comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           res.redirect("back");
       }
       else{
           res.render("comments/edit",{player_id: req.params.id, comment: foundComment});
       }
    });
});

//comment update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,{useFindAndModify: false}, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } 
      else{
          updatedComment.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
          updatedComment.save();
          res.redirect("/players/"+req.params.id);
      }
   });
});

//comment destroy
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, {useFindAndModify: false}, function(err){
       if(err){
           res.redirect("back");
       }
       else{
            Player.findByIdAndUpdate(
            req.params.id,  //https://docs.mongodb.com/manual/reference/operator/update/pull/#up._S_pull
            { $pull: { comments: mongoose.Types.ObjectId(req.params.comment_id) } }, //alternative: { $in: [req.params.comment_id] }
            {useFindAndModify: false},
            function(err) {
              if (err) {
                console.log(err);
              }
            }
           );
           req.flash("success", "comment deleted");
           res.redirect("/players/"+req.params.id);
       }
    });
});


module.exports = router;