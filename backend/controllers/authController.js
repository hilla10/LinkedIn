import { sendWelcomeEmail } from '../emails/emailHandlers.js';
import { generateToken } from '../lib/generateToken.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists' });
    }

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res
        .status(400)
        .json({ success: false, message: 'Username already exists' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User not created', user });
    }

    generateToken(user, res);

    res
      .status(201)
      .json({ success: true, message: 'User created successfully' });

    const profileUrl = `${process.env.CLIENT_URL}/profile/${user.username}`;

    try {
      await sendWelcomeEmail(user.email, user.name, profileUrl);
    } catch (emailError) {
      console.log('Error sending welcome email', emailError);
    }
  } catch (error) {
    console.log('Error in signup Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials ' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    generateToken(user, res);

    res
      .status(200)
      .json({ success: true, message: 'User logged in successfully' });
  } catch (error) {
    console.log('Error in login Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie('linkedin-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only true in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.log('Error in logout Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    console.log('Error in getCurrentUser Controller', error);
    res.status(500).json({
      message: error.message,
    });
  }
};
