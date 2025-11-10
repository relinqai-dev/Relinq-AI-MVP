import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware if environment variables are not properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return NextResponse.next()
  }

  // Only handle cookie management for Supabase auth
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  
  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/onboarding']
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password']
  
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => url.pathname.startsWith(route))
  
  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    // Check onboarding status for authenticated users
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()
      
      if (profile?.onboarding_completed) {
        url.pathname = '/dashboard'
      } else {
        url.pathname = '/onboarding'
      }
      return NextResponse.redirect(url)
    } catch {
      // If profile doesn't exist, redirect to onboarding
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }
  
  // Check onboarding status for dashboard access
  if (url.pathname.startsWith('/dashboard') && user) {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()
      
      if (!profile?.onboarding_completed) {
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    } catch {
      // If profile doesn't exist, redirect to onboarding
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - API routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}