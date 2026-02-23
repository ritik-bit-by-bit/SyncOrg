import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // If logged in and visiting sign-in, sign-up, verify, or home — redirect to dashboard
  if (
    token &&
    (pathname.startsWith('/sign-in') ||
     pathname.startsWith('/sign-up') ||
     pathname.startsWith('/verify') ||
     pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If not logged in and visiting dashboard — redirect to sign-in
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}
