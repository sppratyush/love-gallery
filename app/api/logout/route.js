import { NextResponse } from 'next/server';

export async function POST(req) {
  const response = NextResponse.json({ success: true }, { status: 200 });
  
  // Clear the auth cookie matching the options it was set with
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}
