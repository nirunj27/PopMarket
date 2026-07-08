import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];
const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_PREFIX = '/dashboard';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/e/') ||
    pathname.startsWith('/apply/') ||
    pathname.startsWith('/vendor/') ||
    pathname.startsWith('/rsvp/');

  if (!user && pathname.startsWith(PROTECTED_PREFIX)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && AUTH_ROUTES.includes(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  if (!user && !isPublicRoute && pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}
