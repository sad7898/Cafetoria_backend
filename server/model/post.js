const mongoose = require('mongoose');
var postScheme = new mongoose.Schema({
    topic:String,
    text: String,
    author : {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    created: {type: Date,default: Date.now}
    
  });
module.exports = mongoose.model("Post",postScheme);