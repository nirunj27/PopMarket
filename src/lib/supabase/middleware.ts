import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSuperadminEmail } from '@/lib/env';

const PUBLIC_PREFIXES = ['/e/', '/apply/', '/vendor/', '/rsvp/'];
const AUTH_ROUTES = ['/login', '/signup', '/admin/login'];
const PUBLIC_EXACT = ['/', '/terms'];

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

  const isPublic =
    PUBLIC_EXACT.includes(pathname) ||
    AUTH_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  const isAdminArea = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isOrganizerArea = pathname.startsWith('/dashboard');

  // Unauthenticated → protect private areas
  if (!user && (isOrganizerArea || isAdminArea)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAdminArea ? '/admin/login' : '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Resolve role when needed
  let role: 'organizer' | 'superadmin' | null = null;
  if (user) {
    const metaRole = user.user_metadata?.role;
    if (metaRole === 'superadmin' || metaRole === 'organizer') {
      role = metaRole;
    } else if (isSuperadminEmail(user.email)) {
      role = 'superadmin';
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      role = profile?.role === 'superadmin' ? 'superadmin' : 'organizer';
    }
  }

  // Logged-in users on auth pages → send to their home
  if (user && AUTH_ROUTES.includes(pathname)) {
    // Organizers opening /admin/login from the footer should see the admin login page
    if (pathname === '/admin/login' && role !== 'superadmin') {
      return supabaseResponse;
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = role === 'superadmin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // Organizers cannot access admin console
  if (user && isAdminArea && role !== 'superadmin') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // Superadmins cannot use the organizer client dashboard
  if (user && isOrganizerArea && role === 'superadmin') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin';
    return NextResponse.redirect(redirectUrl);
  }

  if (!user && !isPublic && (isOrganizerArea || isAdminArea)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}
