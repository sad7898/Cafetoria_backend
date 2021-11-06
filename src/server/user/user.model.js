const mongoose = require('mongoose');

const userScheme = new mongoose.Schema({
    user : {type: String, required:true},
    password: {type: String, required:true},
    email: {type: String, required:true},
    post :[{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    liked: Array
});
module.exports = mongoose.model("User",userScheme);