import { NextResponse } from "next/server";

/**
 * POST — Set session cookie on login
 * DELETE — Clear session cookie on logout
 *
 * This route works in tandem with the middleware to enforce
 * server-side auth. The cookie is HttpOnly so it can't be
 * tampered with from the browser console.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: "Missing email or role" },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "super_admin" && role !== "manager") {
      return NextResponse.json(
        { success: false, error: "Insufficient role" },
        { status: 403 }
      );
    }

    const sessionValue = `${email}::${role}::${Date.now()}`;
    const response = NextResponse.json({ success: true });

    response.cookies.set("fashcon_admin_session", sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("fashcon_admin_session");
  return response;
}
