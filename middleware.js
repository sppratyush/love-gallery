import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;

  const protectedPaths = ['/gallery', '/upload', '/favorites', '/slideshow'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // If path is protected and no token, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token if it exists and path is protected
  if (isProtectedPath && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch (error) {
      console.error('JWT verification failed:', error);
      // Clean up invalid cookie and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Redirect authenticated users away from root or login to gallery
  if (token && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login')) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL('/gallery', request.url));
    } catch (error) {
      // invalid token, just continue rendering root/login
    }
  }
  
  // if on root and not authenticated, redirect to login
  if (!token && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/gallery', '/upload', '/favorites', '/slideshow'],
};
