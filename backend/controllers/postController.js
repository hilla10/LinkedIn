import { sendCommentNotificationEmail } from '../emails/emailHandlers.js';
import cloudinary from '../lib/cloudinary.js';
import Notification from '../models/Notification.js';
import Post from '../models/Post.js';

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: { $in: req.user.connections },
    })
      .populate('author', 'name username profilePicture headline')
      .populate('comments.user', 'name profilePicture')
      .sort('-createdAt');

    res.status(200).json(posts);
  } catch (error) {
    console.log('Error in getFeedPosts Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    let newPost;

    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'posts',
      });
      newPost = new Post({
        content,
        image: result.secure_url,
        author: req.user._id,
      });
    } else {
      newPost = new Post({ content, author: req.user._id });
    }

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.log('Error in createPost Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    //   check if the current user is the author of the post
    if (post.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this post' });
    }

    //  delete image from cloudinary
    if (post.image) {
      await cloudinary.uploader.destroy(
        post.image.split('/').pop().split('.')[0]
      );
    }

    await post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.log('Error in deletePost Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate('author', 'name username profilePicture headline')
      .populate('comments.user', 'name profilePicture username headline');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.log('Error in getPostById Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { content, user: req.user._id } },
      },
      { new: true }
    ).populate('author', 'name username profilePicture headline');

    //   create a notification if the comment is not the post owner
    if (post.author.toString() !== req.user._id.toString()) {
      const newNotification = new Notification({
        recipient: post.author,
        type: 'comment',
        relatedUser: req.user._id,
        relatedPost: post._id,
      });

      await newNotification.save();

      try {
        const postUrl = `${process.env.CLIENT_URL}/post/${postId}`;
        await sendCommentNotificationEmail(
          post.author.email,
          post.author.name,
          req.user.name,
          postUrl,
          content
        );
      } catch (error) {
        console.log('Error in sending notification email: ', email);
      }
    }

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.log('Error in createComment Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (post.likes.includes(userId)) {
      // unlike post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // like post
      post.likes.push(userId);
      // create a notification if the post owner is not the user who liked

      const newNotification = new Notification({
        recipient: post.author,
        type: 'like',
        relatedUser: userId,
        relatedPost: postId,
      });

      await newNotification.save();
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log('Error in likePost Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};
