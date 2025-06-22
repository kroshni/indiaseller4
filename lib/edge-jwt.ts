import { SignJWT, jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Convert JWT_SECRET to Uint8Array for jose
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  try {
    console.log('Signing token for payload:', payload);
    const token = await new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);
    console.log('Token signed successfully');
    return token;
  } catch (error) {
    console.error('Error signing token:', error);
    throw error;
  }
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    console.log('Verifying token...');
    const { payload } = await jwtVerify(token, secret);
    console.log('Token verified successfully:', payload);
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
} 