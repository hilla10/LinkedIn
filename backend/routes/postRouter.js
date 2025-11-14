import { Router } from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import {
  createPost,
  deletePost,
  getPostById,
  createComment,
  likePost,
  getFeedPosts,
} from '../controllers/postController.js';

const postRouter = Router();

postRouter.get('/', protectRoute, getFeedPosts);
postRouter.post('/create', protectRoute, createPost);
postRouter.delete('/delete/:id', protectRoute, deletePost);
postRouter.get('/:postId', protectRoute, getPostById);
postRouter.post('/:postId/comment', protectRoute, createComment);
postRouter.post('/:postId/like', protectRoute, likePost);

export default postRouter;
