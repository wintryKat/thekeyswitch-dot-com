import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting (per-IP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { name, email, message, website } = body as {
      name?: string;
      email?: string;
      message?: string;
      website?: string; // honeypot field
    };

    // Honeypot check — real users never fill this hidden field
    if (website) {
      // Return success to avoid tipping off bots, but do nothing
      return NextResponse.json({
        success: true,
        message: "Message received. Thank you!",
      });
    }

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 },
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    // Send via Azure Function if configured, otherwise log and acknowledge
    const functionUrl = process.env.AZURE_CONTACT_FUNCTION_URL;
    if (functionUrl) {
      try {
        const azureRes = await fetch(functionUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
          }),
        });
        if (!azureRes.ok) {
          console.error("[Contact Form] Azure Function error:", azureRes.status);
          // Still return success to user — don't expose backend failures
        }
      } catch (err) {
        console.error("[Contact Form] Azure Function unreachable:", err);
      }
    } else {
      console.log("[Contact Form]", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim().slice(0, 200) + "...",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Message received. Thank you!",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 },
    );
  }
}
