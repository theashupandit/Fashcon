import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error, message, stack, location } = body;

    const logMessage = `[${new Date().toISOString()}] [CLIENT-ERROR] Location: ${location}\nMessage: ${message}\nError: ${JSON.stringify(error)}\nStack: ${stack}\n----------------------------------------\n`;
    
    // Log to server console
    console.error(logMessage);

    // Also write to a file in the workspace so the agent can read it
    const logPath = path.resolve(process.cwd(), 'client-errors.log');
    fs.appendFileSync(logPath, logMessage, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
