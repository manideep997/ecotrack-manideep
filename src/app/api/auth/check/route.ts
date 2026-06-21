import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    const user = await prisma.user.findUnique({ where: { email: phone } });
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check user' }, { status: 500 });
  }
}
