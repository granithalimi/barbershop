import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    let email = "";
    let password = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else {
      const formData = await request.formData();
      email = (formData.get("email") as string) || "";
      password = (formData.get("password") as string) || "";
    }

    // 1. Validate inputs
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    // 2. Initialize Supabase SSR client
    const supabase = await createClient();

    // 3. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // 4. Fetch user profile for role-based redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", data.user.id)
      .single();

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    let redirectTo = "/";
    if (profile?.role === "admin") {
      redirectTo = "/admin/overview";
    } else if (profile?.role === "barber") {
      redirectTo = "/barber/appointments";
    } else if (profile?.role === "client") {
      redirectTo = "/client/appointments";
    }

    return NextResponse.json({
      success: true,
      redirectTo,
    });
  } catch (err) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
