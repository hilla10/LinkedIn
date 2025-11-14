import { Router } from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import {
  deleteNotification,
  getUserNotifications,
  markNotificationAsRead,
} from '../controllers/notificationController.js';

const notificationRouter = Router();

notificationRouter.get('/', protectRoute, getUserNotifications);

notificationRouter.put('/:id/read', protectRoute, markNotificationAsRead);
notificationRouter.delete('/:id', protectRoute, deleteNotification);

export default notificationRouter;
