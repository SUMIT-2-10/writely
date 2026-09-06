require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

const { checkForAuthenticationCookie } = require('./middlewares/authentication');

const mongoDbConnect = require('./connection');
const Blog = require('./model/blog');
const Comment = require('./model/comment');
const User = require('./model/user');
const { createTokenforUser } = require('./service/authentication');

const app = express();
const PORT = process.env.PORT || 8000;
const frontendDist = path.resolve(__dirname, '../Frontend/dist');
const defaultCoverImageURL = process.env.DEFAULT_COVER_IMAGE_URL || '';
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));
app.use(express.static(frontendDist));
app.use(checkForAuthenticationCookie("token"));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(null, file.mimetype.startsWith('image/'));
  },
});

const uploadToCloudinary = (file) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'blogging/covers', resource_type: 'image' },
    (error, result) => error ? reject(error) : resolve(result),
  );
  stream.end(file.buffer);
});


mongoDbConnect(process.env.MONGODB_URL)
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});

app.get('/api/blogs', async (req, res) => {
  const allBlogs = await Blog.find().populate('createdBy', 'fullname profileImageURL').sort({ createdAt: -1 });
  res.json(allBlogs.map((blog) => {
    if (!blog.coverImageURL) blog.coverImageURL = defaultCoverImageURL;
    return blog;
  }));
});

app.get('/api/me', (req, res) => {
  res.json({ user: res.locals.user || null });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const user = await User.create({ fullname, email, password });
    const token = createTokenforUser(user);
    res.cookie('token', token, cookieOptions).status(201).json({ user: { _id: user._id, fullname: user.fullname, email: user.email, profileImageURL: user.profileImageURL } });
  } catch (error) {
    res.status(400).json({ error: error.code === 11000 ? 'Email is already registered' : 'Unable to create account' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await User.mstchPasswordAndtokenGenerator(email, password);
    res.cookie('token', token, cookieOptions).json({ success: true });
  } catch {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', cookieOptions).json({ success: true });
});

app.get('/api/blogs/:blogId', async (req, res) => {
  const foundBlog = await Blog.findById(req.params.blogId).populate('createdBy', 'fullname profileImageURL');
  if (!foundBlog) return res.status(404).json({ error: 'Blog not found' });
  if (!foundBlog.coverImageURL) foundBlog.coverImageURL = defaultCoverImageURL;
  const comments = await Comment.find({ blog: req.params.blogId }).populate('createdBy', 'fullname profileImageURL').sort({ createdAt: -1 });
  res.json({ blog: foundBlog, comments });
});

app.post('/api/blogs', upload.single('coverImage'), async (req, res) => {
  if (!res.locals.user) return res.status(401).json({ error: 'Sign in to publish a blog' });

  try {
    const uploadedImage = req.file ? await uploadToCloudinary(req.file) : null;
    const createdBlog = await Blog.create({
      title: req.body.title,
      content: req.body.content,
      coverImageURL: uploadedImage?.secure_url || defaultCoverImageURL,
      coverImagePublicId: uploadedImage?.public_id,
      createdBy: res.locals.user._id,
    });
    res.status(201).json(createdBlog);
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    res.status(500).json({ error: 'Unable to upload cover image' });
  }
});

app.patch('/api/blogs/:blogId', upload.single('coverImage'), async (req, res) => {
  if (!res.locals.user) return res.status(401).json({ error: 'Sign in to edit a blog' });

  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    if (String(blog.createdBy) !== String(res.locals.user._id)) {
      return res.status(403).json({ error: 'You can only edit your own blogs' });
    }

    const uploadedImage = req.file ? await uploadToCloudinary(req.file) : null;
    if (uploadedImage && blog.coverImagePublicId) {
      await cloudinary.uploader.destroy(blog.coverImagePublicId, { resource_type: 'image' });
    }

    blog.title = req.body.title;
    blog.content = req.body.content;
    if (uploadedImage) {
      blog.coverImageURL = uploadedImage.secure_url;
      blog.coverImagePublicId = uploadedImage.public_id;
    }
    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error('Blog update failed:', error);
    res.status(500).json({ error: 'Unable to update blog' });
  }
});

app.delete('/api/blogs/:blogId', async (req, res) => {
  if (!res.locals.user) return res.status(401).json({ error: 'Sign in to delete a blog' });

  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    if (String(blog.createdBy) !== String(res.locals.user._id)) {
      return res.status(403).json({ error: 'You can only delete your own blogs' });
    }

    if (blog.coverImagePublicId) {
      await cloudinary.uploader.destroy(blog.coverImagePublicId, { resource_type: 'image' });
    }
    await Comment.deleteMany({ blog: blog._id });
    await blog.deleteOne();
    res.json({ success: true });
  } catch (error) {
    console.error('Blog deletion failed:', error);
    res.status(500).json({ error: 'Unable to delete blog' });
  }
});

app.post('/api/blogs/:blogId/comments', async (req, res) => {
  if (!res.locals.user) return res.status(401).json({ error: 'Sign in to comment' });
  const foundBlog = await Blog.findById(req.params.blogId);
  if (!foundBlog) return res.status(404).json({ error: 'Blog not found' });
  const comment = await Comment.create({ content: req.body.content, blog: req.params.blogId, createdBy: res.locals.user._id });
  res.status(201).json(await comment.populate('createdBy', 'fullname profileImageURL'));
});

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  next();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;