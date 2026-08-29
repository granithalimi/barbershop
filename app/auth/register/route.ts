import { createClient } from "@/lib/supabase/server";
import { sanitizeAndValidatePhone } from "@/lib/phone-utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      countryCode = "+389",
      phone,
      password,
      confirmPassword,
    } = body;

    // 1. Check Full Name
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        {
          error: "Please enter your full name (minimum 2 characters).",
          field: "fullName",
        },
        { status: 400 }
      );
    }

    // 2. Check Email
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
          field: "email",
        },
        { status: 400 }
      );
    }

    // 3. Check Phone
    const rawPhone = typeof phone === "string" ? phone.trim() : "";
    if (!rawPhone) {
      return NextResponse.json(
        {
          error: "Please enter your phone number.",
          field: "phone",
        },
        { status: 400 }
      );
    }

    const phoneValidation = sanitizeAndValidatePhone(countryCode, rawPhone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        {
          error: phoneValidation.error || "Please enter a valid phone number.",
          field: "phone",
        },
        { status: 400 }
      );
    }

    // 4. Check Password
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters.",
          field: "password",
        },
        { status: 400 }
      );
    }

    // 5. Check Confirm Password
    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          error: "Passwords do not match.",
          field: "confirmPassword",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 6. Check if Email already exists in the database
    const { data: existingEmailUser, error: emailCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (emailCheckError && emailCheckError.code !== "PGRST116") {
      console.error("Database email check error:", emailCheckError);
    }

    if (existingEmailUser) {
      return NextResponse.json(
        {
          error: "This email address is already registered. Please sign in.",
          field: "email",
        },
        { status: 409 }
      );
    }

    // 7. Check if Phone number already exists in the database
    const { data: existingPhoneUser, error: phoneCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", phoneValidation.formattedE164)
      .maybeSingle();

    if (phoneCheckError && phoneCheckError.code !== "PGRST116") {
      console.error("Database phone check error:", phoneCheckError);
    }

    if (existingPhoneUser) {
      return NextResponse.json(
        {
          error: "This phone number is already registered to another account.",
          field: "phone",
        },
        { status: 409 }
      );
    }

    // 8. Register user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phoneValidation.formattedE164,
        },
      },
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("profiles_email_key")
      ) {
        return NextResponse.json(
          {
            error: "This email address is already registered. Please sign in.",
            field: "email",
          },
          { status: 409 }
        );
      }
      if (msg.includes("profiles_phone_key") || msg.includes("phone")) {
        return NextResponse.json(
          {
            error: "This phone number is already registered to another account.",
            field: "phone",
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          error: signUpError.message || "Failed to create account. Please try again.",
        },
        { status: 400 }
      );
    }

    // Check for Supabase email enumeration defense (user already registered returns empty identities)
    if (
      data?.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0
    ) {
      return NextResponse.json(
        {
          error: "This email address is already registered. Please sign in.",
          field: "email",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectTo: `/register/verify-email?email=${encodeURIComponent(normalizedEmail)}`,
    });
  } catch (error: unknown) {
    console.error("Registration route error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing registration.",
      },
      { status: 500 }
    );
  }
}
