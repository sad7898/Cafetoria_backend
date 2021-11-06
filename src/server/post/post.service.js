const Post = require('./post.model')
const User = require('../user/user.model')

const getPostById = async (id) => {
        let result = null;
        const exe = await Post.find({_id:id}).populate({path: 'author',option: {lean: true}}).lean();
        exe.exec((err,post) => {
        	if (err) return null;
       		result = post.map((val)=> ({topic: val.topic, author: val.author.user,id: val._id,created: val.created,text:val.text}));
            return result;
        })
}

const getPost = async (pageIndex,tags=null,topic=null) => {
        let result = {}
        let postList;
        let count;
        let collectionCount
        Post.estimatedDocumentCount().exec((err,res) => {collectionCount=res})
        if (topic && tags) postList =  await Post.find({topic,tags:{'$all': tags}}).select({topic:1,author:1,tags:1}).sort({created:-1}).populate({path: 'author'})
        else if (tags) postList = await Post.find({tags: {"$all": tags}}).select({topic:1,author:1,tags:1}).sort({created:-1}).populate({path: 'author'})
        else if (topic) postList = await Post.find({topic}).select({topic:1,author:1,tags:1}).sort({created:-1}).populate({path: 'author'})
        else {
          postList = await Post.find({}).select({topic:1,author:1,tags:1}).sort({created:-1}).skip(parseInt(pageIndex)*10).limit(10).populate({path: 'author',option: {lean: true}}).lean();
          postList.exec((err,post) => {
            if (err) throw err;
            else {
              result = post.map((val)=> ({topic: val.topic, id: val._id,author: val.author.user,tags: val.tags}))
              return {post:result,count:collectionCount}
            }
          })
        }
        postList
          .then((foundQuery) => {
            count = foundQuery.length
            return foundQuery
          })
          .then((post) => {
            let result
            if (count<= pageIndex*10) result = post.map((val)=> ({topic: val.topic, id: val._id,author: val.author.user,tags: val.tags}))
            else result =post.slice(pageIndex*10,(pageIndex*10)+11).map((val)=> ({topic: val.topic, id: val._id,author: val.author.user,tags: val.tags}))
            return {post:result,count}
          })
          .catch((err) => {throw err})
}

const createPost = (post,user) => {
          User.findOne({user}, (err,userFound) => {
            if (err) return false
              const newPost = new Post({
                topic: `${post.postTopic}`,
                text: post.postText,
                author: userFound._id,
                tags: post.tags
            })
            newPost.save((err,postSaved) => {
              if(err) throw err;
              else {
                userFound.post.push(postSaved);
                userFound.save((err) => {
                  if (err) return false;
                })
                return 'okay'
              }
            })
          
        })
  }
const deletePost = (id,user) => {
    const exe = Post.findOne({_id:id}).populate({path: 'author'})
    exe.exec((err,post) => {
                if (err) throw err
                else if (post.author.user === user) {
                        post.deleteOne((err) => {
                            if (err) throw err
                            else return {success: true}
                        })
                    }
                    else{
                        return {error: 'invalid author'}
                    }
            })
}

module.exports = {getPostById,getPost,createPost,deletePost}


