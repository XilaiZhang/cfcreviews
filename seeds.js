var mongoose = require("mongoose");
var Player = require("./models/player");
var Comment = require("./models/comment");

var data = [
    {
        name: "werner", 
        image: "https://futhead.cursecdn.com/static/img/20/players/212188.png",
        description: "powerful striker"
    },
    {
        name: "pulisic", 
        image: "https://futhead.cursecdn.com/static/img/20/players/227796.png",
        description: "inspirational magician"
    },
    {
        name: "kante", 
        image: "https://futhead.cursecdn.com/static/img/20/players_alt/p134433642.png",
        description: "decisive tackler"
    }
]

function seedDB(){
    Comment.deleteMany({},function(err){
        if(err){console.log(err);}
    })
   Player.deleteMany({}, function(err){
        if(err){console.log(err);}
        //console.log("removed everything");
        //add a few players
        // data.forEach(function(seed){
        //   Player.create(seed, function(err, player){
        //       if(err){console.log(err);}
        //       else{
        //           //create a comment
        //           Comment.create(
        //                 {
        //                   text:"this player is great",
        //                   author: "Homer"
        //                 }, function(err, comment){
        //                       if(err){console.log(err);}
        //                       else{
        //                           player.comments.push(comment);
        //                           player.save();  
        //                       }
                           
        //                     }
        //           );
        //       }
        //   }); 
        // });
    });
}

module.exports = seedDB;


