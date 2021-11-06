const Post = require('./post.model')
const User = require('../user/user.model')

const getPostById = async (id) => {
        const posts = await Post.find({_id:id}).populate({path: 'author',option: {lean: true}}).lean();
        return posts ? posts.map((val)=> ({topic: val.topic, author: val.author.user,id: val._id,created: val.created,text:val.text})) : null;
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
          return {post: postList.map((val)=> ({topic: val.topic, id: val._id,author: val.author.user,tags: val.tags})), count: postList.length}
        }
        if (postList.length<= pageIndex*10) result = postList.map((val)=> ({topic: val.topic, id: val._id,author: val.author.user,tags: val.tags}))
        else result=postList.slice(pageIndex*10,(pageIndex*10)+11).map((val)=> ({topic: val.topic, id: val._id,author: val.author.user,tags: val.tags}))
        return {post:result,count}
}

const createPost = async (post,user) => {
    const foundUser = await User.findOne({user});
    if (!foundUser) return false
    const newPost = new Post({
      topic: `${post.postTopic}`,
      text: post.postText,
      author: userFound._id,
      tags: post.tags
    })
    await newPost.save();
    userFound.post.push(postSaved);
    await userFound.save();
    return 'okay'
}
const deletePost = async (id,user) => {
    const post = await Post.findOne({_id:id}).populate({path: 'author'})
    if (post.author.user === user) {
        await post.deleteOne()
        return {success:true}
    }
    else {
        return {error: 'invalid author'}
    }
}

module.exports = {getPostById,getPost,createPost,deletePost}


