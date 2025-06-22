import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const signToken = (payload: JWTPayload): string => {
  try {
    console.log('Signing token for payload:', payload);
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: '24h',
      algorithm: 'HS256'
    });
    console.log('Token signed successfully');
    return token;
  } catch (error) {
    console.error('Error signing token:', error);
    throw error;
  }
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    }) as JWTPayload;
    console.log('Token verified successfully:', decoded);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
};

export const getTokenFromHeader = (authHeader?: string): string => {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');
  }
  return authHeader.split(' ')[1];
}; 