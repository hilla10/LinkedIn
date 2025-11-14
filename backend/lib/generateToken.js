import jwt from 'jsonwebtoken';

export const generateToken = (user, res) => {
  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '3d',
    }
  );

  res.cookie('linkedin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only true in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });
};
