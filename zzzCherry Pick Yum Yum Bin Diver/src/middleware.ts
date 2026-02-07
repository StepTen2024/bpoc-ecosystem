import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/supabase/auth'

export async function middleware(request: NextRequest) {
  // Only apply middleware to API routes that need authentication
  // NOTE: /api/candidates/ai-analysis is excluded to allow guest access
  if (request.nextUrl.pathname.startsWith('/api/candidates/resume') ||
    request.nextUrl.pathname.startsWith('/api/save-resume') ||
    request.nextUrl.pathname.startsWith('/api/save-generated-resume') ||
    request.nextUrl.pathname.startsWith('/api/save-resume-to-profile') ||
    request.nextUrl.pathname.startsWith('/api/user/saved-resumes') ||
    request.nextUrl.pathname.startsWith('/api/recruiter/jobs') ||
    request.nextUrl.pathname.startsWith('/api/recruiter/activity') ||
    request.nextUrl.pathname.startsWith('/api/user/applications') ||
    request.nextUrl.pathname.startsWith('/api/analyze-resume') ||
    request.nextUrl.pathname.startsWith('/api/user/analysis-results') ||
    request.nextUrl.pathname.startsWith('/api/user/extracted-resume') ||
    request.nextUrl.pathname.startsWith('/api/user/saved-resume/') ||
    // NOTE: Video routes handle auth inside route handlers (cookies/Bearer),
    // do NOT enforce Bearer auth in middleware to avoid race conditions.
    // Note: /api/video/invitations is NOT included here - it handles its own auth
    // and gracefully returns empty when not authenticated (for polling)
    false) { // Games removed to allow guest access
    console.log('🔍 Middleware: Processing authenticated API request')

    try {
      // Get the authorization header
      const authHeader = request.headers.get('authorization')
      console.log('🔑 Auth header present:', !!authHeader)

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Middleware: Missing or invalid authorization header')
        return NextResponse.json(
          { error: 'Missing or invalid authorization header' },
          { status: 401 }
        )
      }

      // Verify token using centralized auth utility
      console.log('🔍 Middleware: Verifying token...')
      const user = await verifyAuthToken(authHeader)
      console.log('✅ Middleware: User authenticated:', user.id)

      // Clone the request and add user ID to headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', user.id)
      console.log('📋 Middleware: Added user ID to headers:', user.id)

      // Return the modified request
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error('❌ Middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 401 }
      )
    }
  }

  // ============================================
  // ROLE-BASED PAGE PROTECTION (Server-Side)
  // Fixes CRITICAL-01: localStorage manipulation bypass
  // ============================================

  const pathname = request.nextUrl.pathname

  // Admin pages protection (except login/signup)
  if (pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !pathname.startsWith('/admin/signup')) {

    // Check Supabase session cookie
    const supabaseAccessToken = request.cookies.get('sb-ayrdnsiaylomcemfdisr-auth-token')?.value
    const supabaseRefreshToken = request.cookies.get('sb-ayrdnsiaylomcemfdisr-auth-token-code-verifier')?.value

    // No session? Redirect to admin login
    if (!supabaseAccessToken) {
      console.log('🚫 Middleware: No admin session, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
    }

    // Note: Full role verification happens in NewAdminLayout via /api/admin/verify
    // This middleware check ensures unauthenticated users are blocked early
  }

  // Recruiter pages protection (except login/signup/demo)
  if (pathname.startsWith('/recruiter') &&
    !pathname.startsWith('/recruiter/login') &&
    !pathname.startsWith('/recruiter/signup') &&
    !pathname.startsWith('/recruiter/demo')) {

    // Check Supabase session cookie
    const supabaseAccessToken = request.cookies.get('sb-ayrdnsiaylomcemfdisr-auth-token')?.value

    // No session? Redirect to recruiter login
    if (!supabaseAccessToken) {
      console.log('🚫 Middleware: No recruiter session, redirecting to login')
      return NextResponse.redirect(new URL('/recruiter/login?error=unauthorized', request.url))
    }

    // Note: Full role verification happens in RecruiterLayoutClient via /api/recruiter/verify
    // This middleware check ensures unauthenticated users are blocked early
  }

  // Candidate protected pages
  if (pathname.startsWith('/candidate') &&
    !pathname.startsWith('/candidate/signup')) {

    // Check Supabase session cookie
    const supabaseAccessToken = request.cookies.get('sb-ayrdnsiaylomcemfdisr-auth-token')?.value

    // No session? Allow but add header for layout to handle (some candidate pages allow guests)
    if (!supabaseAccessToken) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-auth-status', 'unauthenticated')

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // API routes that need auth
    '/api/candidates/resume/:path*',
    '/api/save-resume',
    '/api/save-generated-resume',
    '/api/save-resume-to-profile',
    '/api/user/saved-resumes',
    '/api/recruiter/jobs',
    '/api/recruiter/jobs/:path*',
    '/api/recruiter/activity',
    '/api/user/applications',
    '/api/analyze-resume',
    '/api/user/analysis-results',
    '/api/user/extracted-resume',
    '/api/user/saved-resume-data',
    '/api/user/ai-analysis-score',
    '/api/user/saved-resume/:path*',

    // PAGE ROUTES - Role-based protection (CRITICAL SECURITY FIX)
    '/admin/:path*',
    '/recruiter/:path*',
    '/candidate/:path*',
  ],
} 