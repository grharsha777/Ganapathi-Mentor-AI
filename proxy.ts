import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_KEY = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null

async function verifyToken(token: string) {
    if (!JWT_KEY) {
        return null
    }

    try {
        const { payload } = await jwtVerify(token, JWT_KEY, {
            algorithms: ['HS256'],
        })
        return payload as { id: string; email: string; role?: string }
    } catch (error) {
        return null
    }
}

export default async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    
    // Public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/auth/login',
        '/auth/sign-up',
        '/auth/sign-up-success',
        '/auth/error',
        '/docs',
        '/privacy',
        '/terms',
        '/test',
        '/rate-limit-info',
        '/dashboard-demo',
    ]

    // API routes that are public
    const publicApiRoutes = [
        '/api/auth/login',
        '/api/auth/signup',
        '/api/auth/oauth',
        '/api/auth/oauth/callback',
    ]

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route))
    const isPublicApiRoute = publicApiRoutes.some(route => path.startsWith(route))

    if (isPublicRoute || isPublicApiRoute) {
        return NextResponse.next()
    }

    // Protected routes
    const isProtected = path.startsWith('/dashboard') || (path.startsWith('/api/') && !path.startsWith('/api/auth/'))

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
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
    ],
}
