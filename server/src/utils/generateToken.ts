import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user authentication
 * @param userId - The user's MongoDB ObjectId
 * @returns Signed JWT token
 */
const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET as string,
    { expiresIn: '30d' }
  );
};

export default generateToken;