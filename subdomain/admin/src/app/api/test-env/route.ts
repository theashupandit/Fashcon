import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { loginUser } from '@/app/actions/auth';

export async function GET() {
  const envVars = {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    ADMIN_PASSWORD_LENGTH: process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.length : (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? process.env.NEXT_PUBLIC_ADMIN_PASSWORD.length : 0),
    ADMIN_PASSWORD_MATCH_RAW: process.env.NEXT_PUBLIC_ADMIN_PASSWORD === "admin_password_123",
    ADMIN_PASSWORD_MATCH_QUOTED: process.env.NEXT_PUBLIC_ADMIN_PASSWORD === '"admin_password_123"',
    ADMIN_EMAIL_MATCH_RAW: process.env.NEXT_PUBLIC_ADMIN_EMAIL === "admin@fashcon.store",
    ADMIN_EMAIL_MATCH_QUOTED: process.env.NEXT_PUBLIC_ADMIN_EMAIL === '"admin@fashcon.store"',
    MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
    MONGODB_URI_VAL: process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 20)}...` : null,
    MONGODB_URI_HAS_QUOTES: process.env.MONGODB_URI ? (process.env.MONGODB_URI.startsWith('"') || process.env.MONGODB_URI.endsWith('"')) : false,
    ADMIN_EMAIL_HAS_QUOTES: process.env.NEXT_PUBLIC_ADMIN_EMAIL ? (process.env.NEXT_PUBLIC_ADMIN_EMAIL.startsWith('"') || process.env.NEXT_PUBLIC_ADMIN_EMAIL.endsWith('"')) : false,
  };

  let dbStatus = 'Not Attempted';
  let dbError = null;
  let adminLoginTest = null;
  let nikhilLoginTest = null;

  try {
    adminLoginTest = await loginUser('admin@fashcon.store', 'admin_password_123');
  } catch (err: any) {
    adminLoginTest = { error: err.message, stack: err.stack };
  }

  try {
    nikhilLoginTest = await loginUser('nikhilzone@fashcon.store', 'nikhil@fashcon');
  } catch (err: any) {
    nikhilLoginTest = { error: err.message, stack: err.stack };
  }

  try {
    const conn = await dbConnect();
    dbStatus = `Connected (readyState: ${mongoose.connection.readyState})`;
  } catch (err: any) {
    dbStatus = 'Failed to connect';
    dbError = err.message;
  }

  return NextResponse.json({
    env: envVars,
    dbStatus,
    dbError,
    adminLoginTest,
    nikhilLoginTest,
    mongooseState: mongoose.connection.readyState,
  });
}
