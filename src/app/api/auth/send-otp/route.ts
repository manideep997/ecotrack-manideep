import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();
    
    // Call Textbelt free SMS API
    const res = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone, 
        message: `Your EcoTrack verification code is: ${otp}`, 
        key: 'textbelt' 
      })
    });
    
    const data = await res.json();
    
    if (!data.success) {
      // Quota exceeded or invalid number, fallback to mock OTP
      console.log(`[Textbelt Error]: ${data.error}. Falling back to mock OTP.`);
      return NextResponse.json({ success: true, mock: true, message: data.error });
    }
    
    return NextResponse.json({ success: true, mock: false });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
