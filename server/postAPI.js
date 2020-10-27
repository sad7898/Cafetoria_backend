let express = require('express')
let app = express()

module.exports = () => {
    app.get("/api/post/:q",function(req,res){
        let query = req.params.q;
        console.log(query);
        let result;
        Post.find({topic:query},(err,post) => {
          if (err) console.log(err)
          else query = post.map((val)=> ({topic: val.topic, id: val._id,created: val.created}));
        })
        Post.find({text:query},(err,post) => {
          if (err) console.log(err)
          else query = post.map((val)=> ({topic: val.topic, id: val._id,created: val.created}));
        })
      })
      app.get("/api/post/",function(req,res){
        Post.find({},function(err,post){
          if(err) console.log(err)
          else {
            console.log(post);
            res.send(post.map((val)=> ({topic: val.topic, id: val._id,created: val.created})))
          };
        });
      })
      app.post('/post', function (req, res){
        User.findOne({user: "admin"}, (err,userFound) => {
          if (err) console.log(err);
          else{
          let newPost = new Post({
            topic: req.body.postTopic+"",
            text: req.body.postText,
            author: userFound._id
          })
          console.log(userFound);
          newPost.save((err,postSaved) => {
            if(err) console.log(err);
            else {
              console.log(postSaved);
              userFound.post.push(postSaved);
              userFound.save((err,userSavedPost) => {
                if (err) console.log(err);
                else console.log(userSavedPost);
              })
              res.redirect("/forum/GeneralDiss/post");
              
            }
          })
        }
        })
      });
}