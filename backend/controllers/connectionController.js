import Connection from '../models/Connection.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === userId) {
      return res
        .status(400)
        .json({ message: "You can't send connection request to yourself" });
    }

    if (req.user.connections.includes(userId)) {
      return res
        .status(400)
        .json({ message: 'You are already connected with this user' });
    }

    const existingRequest = await Connection.findOne({
      sender: senderId,
      recipient: userId,
      status: 'pending',
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: 'Connection request already sent' });
    }

    const newRequest = new Connection({
      sender: senderId,
      recipient: userId,
    });

    await newRequest.save();
    res.status(200).json({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.log('Error in sendConnectionRequest Controller', error);
    res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await Connection.findById(requestId)
      .populate('sender', 'name email username')
      .populate('recipient', 'name email username');

    if (!request) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // check if the current user is the recipient of the request
    if (request.recipient._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to accept this request' });
    }

    if (request.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'This request has already been processed' });
    }

    request.status = 'accepted';
    await request.save();

    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { connections: request.sender._id },
    });

    const notification = new Notification({
      recipient: request.sender._id,
      type: 'connectionAccepted',
      relatedUser: userId,
    });

    await notification.save();

    res
      .status(200)
      .json({ message: 'Connection request accepted successfully' });

    //   todo: send email
    const senderEmail = request.sender.email;
    const senderName = request.sender.name;
    const recipientName = request.recipient.name;
    const profileUrl = `${process.env.CLIENT_URL}/profile/${userId}`;

    try {
      await sendConnectionAcceptedEmail(
        senderEmail,
        senderName,
        recipientName,
        profileUrl
      );
    } catch (error) {
      console.error('Error in sendConnectionAcceptedEmail:', error);
    }
  } catch (error) {
    console.log('Error in acceptConnectionRequest Controller', error);
    res.status(500).json({ message: error.message });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await Connection.findById(requestId);

    // check if the current user is the recipient of the request
    if (request.recipient._id.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'You are not authorized to reject this request',
      });
    }

    if (request.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'This request has already been processed' });
    }

    request.status = 'rejected';
    await request.save();
    res.json({ message: 'Connection request rejected ' });
  } catch (error) {
    console.log('Error in rejectConnectionRequest Controller', error);
    res.status(500).json({ message: error.message });
  }
};

export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await Connection.findB({
      recipient: userId,
      status: 'pending',
    }).populate('sender', 'name username profilePicture headline requests');

    res.status(200).json(requests);
  } catch (error) {
    console.log('Error in getConnectionRequests Controller', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      'connections',
      'name username profilePicture headline connections'
    );

    res.status(200).json(user);
  } catch (error) {
    console.log('Error in getUserConnections Controller', error);
    res.status(500).json({ message: error.message });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });

    res.status(200).json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.log('Error in removeConnection Controller', error);
    res.status(500).json({ message: error.message });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const currentUser = req.user;
    if (currentUser.connections.includes(targetUserId)) {
      return res.status(200).json({ status: 'connected' });
    }

    const pendingRequest = await Connection.findOne({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
      status: 'pending',
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        return res.status(200).json({ status: 'pending' });
      } else {
        return res
          .status(200)
          .json({ status: 'received', requestId: pendingRequest._id });
      }
    }

    //   if no connection or pending req found
    res.json({ status: 'not_connected' });
  } catch (error) {
    console.log('Error in getConnectionStatus Controller', error);
    res.status(500).json({ message: error.message });
  }
};
