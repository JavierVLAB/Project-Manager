import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Skip some public API routes if needed
    // For now, let's protect everything in /api
    
    const apiKey = request.headers.get('x-api-key');
    const secureApiKey = process.env.API_KEY;

    if (!secureApiKey) {
      console.warn('API_KEY is not set in environment variables. API routes are unprotected.');
      return NextResponse.next();
    }

    if (apiKey !== secureApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
