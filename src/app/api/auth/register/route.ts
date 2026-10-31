import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, phone } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Elektron pochta va parol kiritilishi shart' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Parol kamida 6 ta belgidan iborat boʻlishi kerak' },
        { status: 400 }
      );
    }

    // Create user via Supabase Admin API with email auto-confirmed
    // This completely bypasses the Supabase default SMTP email rate limit
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName?.trim() || '',
        phone: phone?.trim() || null,
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'Foydalanuvchi yaratilmadi' },
        { status: 500 }
      );
    }

    // Ensure corresponding record in public.profiles table exists
    // ONLY asd10101010qwerty@gmail.com gets admin role
    const isOwnerAdmin = email.trim().toLowerCase() === 'asd10101010qwerty@gmail.com';
    const assignedRole = isOwnerAdmin ? 'admin' : 'customer';

    try {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        email: email.trim(),
        full_name: fullName?.trim() || null,
        phone: phone?.trim() || null,
        role: assignedRole,
        updated_at: new Date().toISOString(),
      });

      if (isOwnerAdmin) {
        await supabaseAdmin.from('user_roles').upsert({
          user_id: data.user.id,
          role: 'admin',
        });
      }
    } catch (profileErr) {
      console.warn('[Profile upsert warning]:', profileErr);
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (err: any) {
    console.error('[Registration API Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Roʻyxatdan oʻtishda server xatosi' },
      { status: 500 }
    );
  }
}
