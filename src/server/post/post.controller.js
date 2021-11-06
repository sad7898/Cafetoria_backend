const jwt = require('jsonwebtoken')
const postService = require('./post.service')

const getPostById = async (req,res) => {
    const result = await postService.getPostById(req.params.id)
    res.send(result);
}

const getPost = async (req,res) => {
    const {p,tags,topic} = req.query
    const result = await postService.getPost(p,tags,topic)
    res.send(result);
}

const createPost = async (req,res) => {
    const {postTopic,postText,tags} = req.body
    const {user} = await jwt.decode(req.cookies.token)
    if (await postService.createPost({postTopic,postText,tags},user)) res.send('okay');
    else res.status(400).json();
}

const deletePost = async (req,res) => {
    const {user} = await jwt.decode(req.cookies.token)
    const {id} = req.params;
    const result = await postService.deletePost(id,user);
    if (result.success) res.send('post removed')
    else res.status(400).json(result)
}
module.exports = {getPostById,getPost,createPost,deletePost}