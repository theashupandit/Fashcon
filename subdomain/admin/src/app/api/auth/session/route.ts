import { NextRequest, NextResponse } from "next/server";

/**
 * GET — Get current session details and expiry from cookie
 * POST — Set session cookie on login
 * DELETE — Clear session cookie on logout
 *
 * This route works in tandem with the middleware to enforce
 * server-side auth. The cookie is HttpOnly so it can't be
 * tampered with from the browser console.
 */

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("fashcon_admin_session")?.value;
    if (!session) {
      return NextResponse.json({ success: true, authenticated: false });
    }

    const parts = session.split("::");
    if (parts.length < 3) {
      return NextResponse.json({ success: true, authenticated: false });
    }

    const [email, role, timestamp] = parts;
    const expireTime = parseInt(timestamp, 10);

    if (isNaN(expireTime) || Date.now() > expireTime) {
      const response = NextResponse.json({ success: true, authenticated: false });
      response.cookies.delete("fashcon_admin_session");
      return response;
    }

    const remainingSeconds = Math.max(0, Math.ceil((expireTime - Date.now()) / 1000));

    return NextResponse.json({
      success: true,
      authenticated: true,
      email,
      role,
      expireTime,
      remainingSeconds
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, expireTime, clientTime } = body;

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

    let finalExpireTime: number;
    let maxAgeSeconds: number;

    if (expireTime) {
      if (clientTime) {
        const skew = Date.now() - parseInt(clientTime, 10);
        finalExpireTime = parseInt(expireTime, 10) + skew;
      } else {
        finalExpireTime = parseInt(expireTime, 10);
      }
      maxAgeSeconds = Math.max(0, Math.ceil((finalExpireTime - Date.now()) / 1000));
    } else {
      maxAgeSeconds = 1800;
      finalExpireTime = Date.now() + 1800000;
    }

    // Ensure session is not set to expire immediately on server due to skew
    if (maxAgeSeconds <= 0) {
      maxAgeSeconds = 1800;
      finalExpireTime = Date.now() + 1800000;
    }

    const sessionValue = `${email}::${role}::${finalExpireTime}`;
    const response = NextResponse.json({
      success: true,
      expireTime: finalExpireTime,
      remainingSeconds: maxAgeSeconds
    });

    response.cookies.set("fashcon_admin_session", sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
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
  response.cookies.set("fashcon_admin_session", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
