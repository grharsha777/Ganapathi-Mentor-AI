import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    if (path.startsWith('/auth') || path.startsWith('/api/auth/')) {
        return NextResponse.next();
    }

    const isProtected = path.startsWith('/dashboard') || (path.startsWith('/api/') && !path.startsWith('/api/auth/'));

    if (isProtected) {
        const token = request.cookies.get('token')?.value

        if (!token) {
            if (request.nextUrl.pathname.startsWith('/api')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        const decoded = await verifyToken(token)
        if (!decoded) {
            if (request.nextUrl.pathname.startsWith('/api')) {
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // Basic verification - for full verification we might need to call an API or use edge-compatible jwt verify
        // Since 'jsonwebtoken' might not work fully in Edge Runtime, we might rely on cookie presence 
        // or use 'jose' library. For now, we assume the cookie existence is a first check.
        // Ideally, we replace verifyToken with 'jose' here.

        // For this migration, we will let the API routes verify the token deeply.
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/:path*',
    ],
}
