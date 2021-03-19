const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    POST api/posts
//@desc     Create a post
//@access   Private
router.post('/', [
    auth,
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

//@route    GET api/posts
//@desc     Get all posts
//@access   Private

router.get('/', auth , async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1})
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

//@route    GET api/posts/:Id
//@desc     Get post by ID
//@access   Private
router.get('/:id', auth , async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if(!post) return res.status(404).json({ msg: 'Post not found' });
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind === "ObjectId") return res.status(404).json({ msg: 'Post not found' });
        res.status(500).send('Server Error')
    }
});

//@route    DELETE api/posts/:Id
//@desc     DELETE post by ID
//@access   Private
router.delete('/:id', auth , async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ msg: 'Post not found' });

        // check if user deleting the post is the owner of the post
        if(post.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
        await post.remove();
        res.json(post);

    } catch (err) {
        console.error(err.message);
        if(err.kind === "ObjectId") return res.status(404).json({ msg: 'Post not found' });
        res.status(500).send('Server Error')
    }
});

//@route    PUT api/posts/:Id
//@desc     LIKE a post
//@access   Private
router.put('/like/:id', auth , async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ msg: 'Post not found' });

        // check if post is already liked by user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) return res.status(400).json({ msg: 'Post already liked' });

        // Add user to the beginning of likes. To get count later we just need to find number of user obj's in posts.likes
        post.likes.unshift({ user: req.user.id})
        await post.save();
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        if(err.kind === "ObjectId") return res.status(404).json({ msg: 'Post not found' });
        res.status(500).send('Server Error')
    }
});

//@route    PUT api/posts/:Id
//@desc     UNLIKE a post
//@access   Private
router.put('/unlike/:id', auth , async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ msg: 'Post not found' });

        // check if post is already liked by user. If not then we cannot unlike
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) return res.status(400).json({ msg: 'Post has not yet been liked' });

        // Add user to the beginning of likes
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        if(err.kind === "ObjectId") return res.status(404).json({ msg: 'Post not found' });
        res.status(500).send('Server Error')
    }
});

//@route    POST api/posts/comment/:id
//@desc     Comment on a post
//@access   Private
router.post('/comment/:id', [
    auth,
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ msg: 'Post not found' });

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

//@route    DELETE api/posts/comment/:id/:comment_id
//@desc     DELETE Comment
//@access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        //Pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        //Make sure comment exists
        if(!comment) return res.status(404).json({ msg: 'Comment does not exist' });

        //Check user is owner of comment
        if(comment.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized'} )

        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

module.exports = router;