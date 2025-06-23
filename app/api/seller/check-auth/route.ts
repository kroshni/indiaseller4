import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/edge-jwt';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('seller_token');

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token.value);

    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { authenticated: true, seller: decoded },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
} 