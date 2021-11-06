const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const passport = require('passport');

const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));
const mongoose = require('mongoose')
const corsOptions = require('./src/server/configs/app.config')
const key = require('./src/server/configs/db.config')

mongoose.connect(key.mongoURI);
const Post = require('./src/server/post/post.model.js');
const userController = require('./src/server/user/user.controller')
const postController = require('./src/server/post/post.controller')

app.use(cookieParser());
app.use(passport.initialize());
require('./src/server/configs/passportConfig.js')(passport);

app.use(cors(corsOptions))
app.post("/user/signup",userController.register)
app.post("/user/login",userController.login) 
app.get("/user/verify",userController.verifyUser)
app.post('/user/signout',userController.logout)
app.get("/post/:id",postController.getPostById)
app.get("/api/post",postController.getPost)
app.post('/post', passport.authenticate('jwt'),postController.createPost)
app.delete('/post/:id',passport.authenticate('jwt'),postController.deletePost)
app.get('/api/pie',(req,res) => {
        const tagCount = {
          'fast-food':0,
          'fruits':0,
          'carbohydrates':0,
          'meat':0,
          'veggie':0
        }
        const pieData = Post.find({}).select({'_id':0,'tags':1}).lean()
        pieData.exec((err,data) => {
          console.log(data)
          if (err) res.send(err)
          else {
            for (let i=0;i<data.length;i++){
              for (let j=0; j<data[i].tags.length;j++){
                tagCount[data[i].tags[j]]+=1
              }
            }
            res.send(tagCount)
          }
          })
  
        })
  
app.listen(process.env.PORT || 8080,() => console.log('works'));
