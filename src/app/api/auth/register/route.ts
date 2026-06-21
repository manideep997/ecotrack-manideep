import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, password, name } = await request.json();
    
    // In a real app, you would verify OTP server-side.
    // Since we generated OTP client-side and verified it there, we just create the user.
    
    const existingUser = await prisma.user.findUnique({ where: { email: phone } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    const user = await prisma.user.create({
      data: {
        email: phone,
        name: name || `User ${phone.slice(-4)}`,
        password: password
      }
    });
    
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
