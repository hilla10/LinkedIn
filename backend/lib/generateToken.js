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
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'none',
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });
};
