import { NextResponse } from 'next/server';
import { syncGA4Data, syncSearchConsoleData } from '@/lib/google-sync';

export async function POST() {
  try {
    // Sync both services
    await syncGA4Data();
    await syncSearchConsoleData();
    
    return NextResponse.json({ success: true, message: 'Synchronization complete' });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
