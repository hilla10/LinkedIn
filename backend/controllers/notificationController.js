import Notification from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort('-createdAt')
      .populate('relatedUser', 'name username profilePicture')
      .populate('relatedPost', 'content image');

    res.status(200).json(notifications);
  } catch (error) {
    console.log('Error in getUserNotifications Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};
export const markNotificationAsRead = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const notifications = await Notification.findByIdAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    res.status(200).json(notifications);
  } catch (error) {
    console.log('Error in markNotificationAsRead Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};
export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notifications = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user._id,
    });

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.log('Error in deleteNotification Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};
