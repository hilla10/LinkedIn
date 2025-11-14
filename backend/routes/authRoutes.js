import { Router } from 'express';
import {
  getCurrentUser,
  login,
  logout,
  signup,
} from '../controllers/authController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

authRouter.get('/me', protectRoute, getCurrentUser);

export default authRouter;
