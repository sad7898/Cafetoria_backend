const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
let cors = require('cors');
let bcrypt = require("bcrypt");
let cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));
const mongoose = require('mongoose')
const key = require('./server/key.js');
mongoose.connect(key.mongoURI);
const Post = require('./server/model/post.js');
const User = require('./server/model/user.js'); 
const inputValidator = require('./server/register.js');
const { ExtractJwt } = require('passport-jwt');
const passport = require('passport');
const jwt = require("jsonwebtoken");
const { decode } = require('punycode');
let errorMessage={};
let postModule = require('./server/postAPI.js')
app.use(cookieParser());
app.use(passport.initialize());
const corsOptions = {
	origin: "https://5f9c034628e21e01bf06b9ed--cafetoria-frontend.netlify.app",
	credentials: true
}
app.use(cors(corsOptions))
require('./server/passportConfig.js')(passport);
app.post("/user/signup",function(req,res){
    let newUser = new User({
      user: req.body.user,
      password: req.body.password,
      email: req.body.email
    })
    let validateToken =  inputValidator(newUser,true);
    if (validateToken.isValid){
    User.findOne({user: newUser.user}, (err,found) => {
      if (err) console.log(err);
      else if (found){
        errorMessage.userDup = "This username is already taken.";
        res.status(400).json(errorMessage);
      }
      else User.findOne({email: newUser.email}, (err,found) => {
        if (err) console.log(err);
        else if (found){
          errorMessage.emailDup = "This email is already taken.";
          res.status(400).json(errorMessage);
        }
        else {
          bcrypt.genSalt(10, (err,salt) => {
              bcrypt.hash(newUser.password,salt, (err,hash) => {
              if (err) throw err;
              else {
                newUser.password = hash;
                newUser.save((err,userSaved) => {
                  if (err) console.log(err);
                  else if (userSaved) {
                    console.log(userSaved);
                    res.send('Success')
                  }
                  else res.status(400).json(errorMessage);
                })
              }
            })
          })
        }
      })
    })
  }
  else {
    res.status(400).json(validateToken.error);
  } 
  })

  app.post("/user/login",function(req,res){
      let loggedUser = new User({
        user: req.body.user,
        password: req.body.password
      })
      let validateLogin = inputValidator(loggedUser,false);
      if (!validateLogin.isValid) res.status(404).json(validateLogin.error);
      else{
      User.findOne({user: loggedUser.user},(err,userFound) => {
          if (err) res.status(404).json({inputError: "Some error occured!"});
          if (!userFound) res.status(404).json({inputNotFound:"Invalid Username or Password"});
          else {
            bcrypt.compare(loggedUser.password,userFound.password)
            .then((isMatch) => {
              if (isMatch){
                console.log(userFound._id)
                const payload = {
                  user: userFound.user,
                  id: userFound._id
                };
                jwt.sign(payload,key.secretOrKey,{expiresIn: 300000},(err,token) => {
                  if (err) res.status(404).json({cannotSign:"error when signing jwt"})
                  else  {
                    res.cookie('token', token, { httpOnly: true,maxAge: 360000,sameSite: "none",secure: true });
                    res.json({token})
                  }
                })
              }
              else res.status(404).json({inputNotFound:"Invalid Username or Password"})
            })
          }
        })}
      })
      app.get("/user/verify",function(req,res){
        (jwt.verify(req.cookies.token,key.secretOrKey,(err,decodedToken) =>{
          if (err) res.status(404).json(req.cookies)
          else {res.json(decodedToken)};
        }));
      })

      app.post('/user/signout',function(req,res){
        res.clearCookie('token');
        res.send("cleared!");
      })

  


      app.get("/post/:id",function(req,res){
        let query = req.params.id;
        console.log(query);
        let result;
        let exe = Post.find({_id:query}).populate({path: 'author',option: {lean: true}}).lean();
        exe.exec((err,post) => {
        	if (err) res.status(404).json({'error':"can't find post lol"})
       		else{
       			jwt.verify(req.cookies.token,key.secretOrKey,(err,decodedToken) => {
       					result = post.map((val)=> ({topic: val.topic, author: val.author.user,id: val._id,created: val.created,text:val.text}));
       				    console.log("this is post author "+result[0].author)
       					console.log("this is decoded author "+decodedToken.user)
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
      app.get("/api/post/:page",function(req,res){
      	let jump = req.params.page;
        let postList = Post.find({}).sort({created:-1}).limit(10).populate({path: 'author',option: {lean: true}}).lean();
        postList.exec(function(err,post){
          if(err) console.log(err)
          else {
            res.json(post.map((val)=> ({topic: val.topic, id: val._id,author: val.author.user, userId: val.author._id})))
          };
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
                    author: userFound._id
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


app.get('/',(req,res) => {
  res.send('nothing here')
})


app.listen(process.env.PORT || 8080,() => console.log('works'));
