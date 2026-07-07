import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

export function middleware(request: NextRequest) {
    const {nextUrl} = request
    const token = request.cookies.get('token')?.value

    const isAuthRoute = nextUrl.pathname.startsWith('/auth')
    const isSelectOrgRoute = nextUrl.pathname === '/auth/select-organization'

    if (isAuthRoute && !isSelectOrgRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!isAuthRoute && !token && !nextUrl.pathname.startsWith('/api') && nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
}
