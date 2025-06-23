import { NextResponse } from 'next/server';
import cassandraClient from '@/cassandra/cassandraClient';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/edge-jwt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const client = await cassandraClient.getConnectedClient();

    // Find seller by email
    const result = await client.execute(
      'SELECT seller_id, name, password_hash, status FROM sellers WHERE email = ? ALLOW FILTERING',
      [email],
      { prepare: true }
    );

    const seller = result.rows[0];

    if (!seller) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if seller is active
    if (!seller.status) {
      return NextResponse.json(
        { error: 'Your account is inactive. Please contact support.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      password,
      seller.password_hash
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signToken({
      userId: seller.seller_id.toString(),
      email: email,
      role: 'seller',
    });

    // Set cookie with JWT token
    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

    response.cookies.set('seller_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 