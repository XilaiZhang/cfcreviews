var Player = require("../models/player");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkPlayerOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Player.findById(req.params.id, function(err, foundPlayer){
           if(err){
               req.flash("error", "player not found");
               res.redirect("back");
           } 
           else{
                //foundPlayer.author.id is mongoose object, req.user._id is a string
               if(foundPlayer.author.id.equals(req.user._id) ){
                   next();
               }else{
                   req.flash("error", "you do not have permision to do that");
                   res.redirect("back");
               }
                
           }
        });
    }
    else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){res.redirect("back");} 
           else{
                //does user own the comment?
               if(foundComment.author.id.equals(req.user._id) ){
                   next();
               }else{
                   req.flash("error", "you don't have permission to do that");
                   res.redirect("back");
               }
                
           }
        });
    }
    else{
        req.flash("error", "you need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "you need to be logged in to do that");
    res.redirect("/login");
}


module.exports = middlewareObj;