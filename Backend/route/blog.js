const { Router } = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

const Blog = require('../model/blog');
const Comment = require('../model/comment');

const router = Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (file) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
        { folder: 'blogging/covers', resource_type: 'image' },
        (error, result) => error ? reject(error) : resolve(result),
    );
    stream.end(file.buffer);
});

router.get('/create', (req, res) => {
    res.render('createBlog');
});

router.post('/create', upload.single('coverImage'), async (req, res) => {
    try {
        const coverImageURL = req.file ? (await uploadToCloudinary(req.file)).secure_url : undefined;
        const blog = await Blog.create({
            title: req.body.title,
            content: req.body.content,
            coverImageURL,
            createdBy: res.locals.user._id,
        });
        res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
        res.status(500).send('Unable to upload cover image');
    }
});


router.get('/:blogId', async (req, res) => {
    const blogId = req.params.blogId;
    const blog = await Blog.findById(blogId).populate('createdBy', "comment");
    res.render('blog', { 
        blog,
        user: res.locals.user,
        comments: await Comment.find({ blog: blogId }).populate('createdBy')
    });
});


//coomment routes 

router.post('/:blogId/comment', async (req, res) => {
    const blogId = req.params.blogId;
    const blog = await Blog.findById(blogId);
    if (!blog) {
        return res.status(404).send('Blog not found');
    }
    await Comment.create({
        content: req.body.content,
        blog: blogId,
        createdBy: res.locals.user._id,
    });
    res.redirect(`/blog/${blogId}`);
});

module.exports = router;