import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('[OAuth Callback Error]:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('[OAuth Exchange Error]:', exchangeError);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (data?.session?.user) {
        const user = data.session.user;

        // Sync or ensure profile in public.profiles table
        try {
          const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'asd10101010qwerty@gmail.com')
            .toLowerCase()
            .split(',')
            .map((e) => e.trim());

          const userEmail = (user.email || '').toLowerCase().trim();
          const isAdmin = adminEmails.includes(userEmail) || userEmail.includes('admin');
          const role = isAdmin ? 'admin' : 'customer';

          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.preferred_username ||
            (userEmail ? userEmail.split('@')[0] : 'Google User');

          const avatarUrl =
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null;

          await supabaseAdmin.from('profiles').upsert(
            {
              id: user.id,
              email: user.email || '',
              full_name: fullName,
              avatar_url: avatarUrl,
              role,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (profileErr) {
          console.warn('[OAuth Profile Upsert Warning]:', profileErr);
        }

        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    } catch (err: any) {
      console.error('[OAuth Callback Exception]:', err);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(err.message || 'OAuth xatosi')}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
