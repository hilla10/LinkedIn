import { Router } from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  removeConnection,
  getConnectionStatus,
  getUserConnections,
} from '../controllers/connectionController.js';

const connectionRouter = Router();

connectionRouter.post('/request/:userId', protectRoute, sendConnectionRequest);
connectionRouter.put(
  '/accept/:requestId',
  protectRoute,
  acceptConnectionRequest
);
connectionRouter.put(
  '/reject/:requestId',
  protectRoute,
  rejectConnectionRequest
);
// Get all connection requests for the current user
connectionRouter.get('/requests', protectRoute, getConnectionRequests);
// Get all connections for a user
connectionRouter.get('/', protectRoute, getUserConnections);
connectionRouter.delete('/:userId', protectRoute, removeConnection);
connectionRouter.get('/status/:userId', protectRoute, getConnectionStatus);

export default connectionRouter;
