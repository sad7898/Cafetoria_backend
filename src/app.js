const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
let cors = require('cors');
let cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));
const corsOptions = require('./server/configs/app.config')
const mongoose = require('mongoose')
mongoose.connect(key.mongoURI);
const Post = require('./server/post/post.model.js');
const passport = require('passport');
const userController = require('./server/user/user.controller')
app.use(cookieParser());
app.use(passport.initialize());
require('./server/configs/passportConfig.js')(passport);
app.use(cors(corsOptions))
app.post("/user/signup",userController.register)
app.post("/user/login",userController.login) 
app.get("/user/verify",userController.verifyUser)
app.post('/user/signout',userController.logout)
app.get("/post/:id",function(req,res){
        let query = req.params.id;
        console.log(query);
        let result;
        let exe = Post.find({_id:query}).populate({path: 'author',option: {lean: true}}).lean();
        exe.exec((err,post) => {
        	if (err) res.status(404).json({'error':"post not found"})
       		else{
       			jwt.verify(req.cookies.token,key.secretOrKey,(err,decodedToken) => {
       					result = post.map((val)=> ({topic: val.topic, author: val.author.user,id: val._id,created: val.created,text:val.text}));
       				if (err) {
       					console.log(err)
       					result[0]['isAuthor'] = false;
       					res.json(result)
       				}
       				else if (decodedToken.user == result[0].author ){
       					result[0]['isAuthor'] = true;
       					res.json(result)
       				}
       				else{
       					console.log("this is post author "+post.author)
       					console.log("this is decoded author "+decodedToken.user)
       					result[0]['isAuthor'] = false;
       					res.json(result)
       				}
       			})
       		}
        })
      })
       app.get("/api/post",function(req,res){
        let currentPage = req.query.p;
        let postList;
        let count;
        let collectionCount
        Post.estimatedDocumentCount().exec((err,res) => (collectionCount=res))
        if (req.query.topic && req.query.tags) postList =  Post.find({topic: req.query.topic,tags:{'$all': req.query.tags}}).select({topic:1,author:1,tags:1}).sort({created:-1}).populate({path: 'author'})
        else if (req.query.tags) postList = Post.find({tags: {"$all": req.query.tags}}).select({topic:1,author:1,tags:1}).sort({created:-1}).populate({path: 'author'})
        else if (req.query.topic) postList = Post.find({topic: req.query.topic}).select({topic:1,author:1,tags:1}).sort({created:-1}).populate({path: 'author'})
        else {
          postList = Post.find({}).select({topic:1,author:1,tags:1}).sort({created:-1}).skip(parseInt(currentPage)*10).limit(10).populate({path: 'author',option: {lean: true}}).lean();
          postList.exec(function(err,post){
            if(err) res.status(404).json(err)
            else {
              result = post.map((val)=> ({topic: val.topic, id: val._id,author: val.author.user,tags: val.tags}))
              res.send({'post':result,'count':collectionCount});
            }
          })
        }
        if (req.query.topic || req.query.tags){
        postList
          .then((foundQuery) => {
            count = foundQuery.length
            return foundQuery
          })
          .then((post) => {
            let result
            if (count<= currentPage*10) result = post.map((val)=> ({topic: val.topic, id: val._id,author: val.author.user,tags: val.tags}))
            else result =post.slice(currentPage*10,(currentPage*10)+11).map((val)=> ({topic: val.topic, id: val._id,author: val.author.user,tags: val.tags}))
            res.send({'post':result,'count':count})
          })
          .catch((err) => res.status(404).json(err))
        }
       // .select({topic:1,author:1,tags:1}).sort({created:-1}).skip(parseInt(currentPage)*10).limit(10).populate({path: 'author',option: {lean: true}}).lean();
      })
      app.get('/api/pie',function(req,res){
        let tagCount = {
          'fast-food':0,
          'fruits':0,
          'carbohydrates':0,
          'meat':0,
          'veggie':0
        }
        let pieData = Post.find({}).select({'_id':0,'tags':1}).lean()
        pieData.exec(function(err,data){
          if (err) res.send(err)
          else {
            for (i in data){
              for (indx in data[i]['tags']){
                tagCount[data[i]['tags'][indx]]+=1
              }
            }
            res.send(tagCount)
          }
          })
  
        })

    
      app.post('/post', function (req, res){
        jwt.verify(req.cookies.token,key.secretOrKey,(err,decodedToken) => {
          if (err) res.status(400).json(err)
          else {
              User.findOne({user: decodedToken.user}, (err,userFound) => {
                if (err) {res.status(404).json({error:"user not found"})}
                else{
                  let newPost = new Post({
                    topic: req.body.postTopic+"",
                    text: req.body.postText,
                    author: userFound._id,
                    tags: req.body.tags
                })
                newPost.save((err,postSaved) => {
                  if(err) res.status(404).json({error: "cannot save post"})
                  else {
                    console.log(postSaved);
                    userFound.post.push(postSaved);
                    userFound.save((err,userSavedPost) => {
                      if (err) res.status(404).json({error: "something's wrong"});
                    })
                    res.send('okay')
                    
                  }
                })
              }
              })
            }  
      })
      }
      )
      app.delete('/post/:id',function(req,res){
      	let id = req.params.id;
      	let exe = Post.findOne({_id:id}).populate({path: 'author'})
      	jwt.verify(req.cookies.token,key.secretOrKey,(err,decodedToken) => {
      		if (err) res.status(404).json({error: 'jwt not found'})
      		else {
      			exe.exec((err,post) => {
      				if (err) res.status(404).json({error: 'post not found'})
      				else{
      					console.log(post.author)
      					if (post.author.user == decodedToken.user) {
      						post.deleteOne((err,result) => {
      							if (err) console.log(err)
      							else res.send('post removed')
      						})
      					}
      					else{
      						res.status(404).json({error: 'invalid author'})
      					}
      				}
      			})
      		}
      	})
      })
app.listen(process.env.PORT || 8080,() => console.log('works'));
