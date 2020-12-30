var mongoose = require("mongoose");

var playerSchema = new mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    filename: String,
    description: String,
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Comment" //the model name
        }    
    ],
    views: {type: Number, default: 0},
    numRating: {type: Number, default: 0},
    rating: Number
});

module.exports = mongoose.model("Player", playerSchema);