import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SiteSettings from "@/lib/models/SiteSettings";

// GET — returns current loginRequired state
export async function GET() {
  try {
    await dbConnect();
    // @ts-ignore — getSingleton is a static method
    const settings = await SiteSettings.getSingleton();
    const loginRequired = settings.loginRequired ?? true;

    const response = NextResponse.json({
      loginRequired,
    });

    if (loginRequired) {
      response.cookies.delete("fashcon_login_gate");
    } else {
      response.cookies.set("fashcon_login_gate", "disabled", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ loginRequired: true });
  }
}

// POST — toggle or set loginRequired
// Requires `gatePassword` when DISABLING login (loginRequired: false)
// Re-enabling login (loginRequired: true) does NOT require a password
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const loginRequired =
      typeof body.loginRequired === "boolean" ? body.loginRequired : true;

    // When disabling login gate, verify the security password
    if (!loginRequired) {
      const gatePassword = body.gatePassword;
      const serverPassword = process.env.LOGIN_GATE_PASSWORD;

      if (!serverPassword) {
        return NextResponse.json(
          { success: false, error: "LOGIN_GATE_PASSWORD not configured on server." },
          { status: 500 }
        );
      }

      if (!gatePassword || gatePassword !== serverPassword) {
        return NextResponse.json(
          { success: false, error: "Invalid security password." },
          { status: 403 }
        );
      }
    }

    await dbConnect();
    await SiteSettings.findOneAndUpdate(
      {},
      { $set: { loginRequired } },
      { upsert: true, new: true }
    );

    const response = NextResponse.json({ success: true, loginRequired });

    // Set a lightweight cookie for the middleware to read
    // (avoids a DB call on every request in the middleware)
    if (loginRequired) {
      response.cookies.delete("fashcon_login_gate");
    } else {
      response.cookies.set("fashcon_login_gate", "disabled", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
