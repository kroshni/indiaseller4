import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { client } from '@/cassandra/cassandraClient';
import { signToken } from '@/lib/edge-jwt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Attempting login for email:', email);

    // Query admin user by email
    const query = 'SELECT * FROM admin_users WHERE email = ? ALLOW FILTERING';
    const result = await client.execute(query, [email], { prepare: true });

    const user = result.first();
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Password verified successfully');

    // Generate JWT token
    const tokenPayload = {
      userId: user.user_id.toString(),
      email: user.email,
      role: user.role,
    };
    console.log('Creating token with payload:', tokenPayload);
    
    const token = await signToken(tokenPayload);

    // Create response with httpOnly cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: {
          email: user.email,
          role: user.role
        },
        redirect: '/admin/dashboard'
      },
      { status: 200 }
    );

    // Set the cookie with specific options
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    console.log('Auth token cookie set successfully');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 