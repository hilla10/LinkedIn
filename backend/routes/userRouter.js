import { Router } from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import {
  getSuggestedConnections,
  getPublicProfile,
  updateProfile,
} from '../controllers/userController.js';

const userRouter = Router();

userRouter.get('/suggestions', protectRoute, getSuggestedConnections);
userRouter.get('/:username', protectRoute, getPublicProfile);

userRouter.put('/profile', protectRoute, updateProfile);

export default userRouter;
