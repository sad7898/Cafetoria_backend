const mongoose = require('mongoose');

const postScheme = new mongoose.Schema({
    topic:String,
    text: String,
    author : {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    created: {type: Date,default: Date.now},
    tags: Array
  });
module.exports = mongoose.model("Post",postScheme);