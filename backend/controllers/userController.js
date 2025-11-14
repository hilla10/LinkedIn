import cloudinary from '../lib/cloudinary.js';
import User from '../models/User.js';

export const getSuggestedConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select('connections');

    // find user who are not already not connected, and also don't recommend the our own profile
    const suggestedUsers = await User.find({
      _id: {
        $ne: req.user._id,
        $nin: currentUser.connections,
      },
    })
      .select('name username profilePicture headline')
      .limit(5);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log('Error in getSuggestedConnections Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await user
      .findOne({ username: req.params.username })
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log('Error in getPublicProfile Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'username',
      'headline',
      'about',
      'location',
      'profilePicture',
      'bannerImg',
      'skills',
      'experience',
      'education',
    ];

    const updatedData = {};

    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    }

    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture, {
        folder: 'profilePictures',
      });

      updatedData.profilePicture = result.secure_url;
    }

    if (req.body.bannerImage) {
      const result = await cloudinary.uploader.upload(req.body.bannerImage, {
        folder: 'bannerImages',
      });

      updatedData.profilePicture = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select('-password');

    res.status(200).json(user);
  } catch (error) {
    console.log('Error in updateProfile Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};
