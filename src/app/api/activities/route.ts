import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CarbonEngine } from '@/lib/carbon';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json([]); // Not logged in

    const { searchParams } = new URL(request.url);
    const cityName = searchParams.get('city');

    const activities = await prisma.activity.findMany({
      where: {
        userId: (session.user as any).id,
        ...(cityName ? { cityProfile: { name: cityName } } : {})
      },
      orderBy: { date: 'desc' },
      take: 50,
      include: { cityProfile: true }
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new Response('Unauthorized', { status: 401 });
    
    const userId = (session.user as any).id;
    const body = await request.json();

    let cityProfile = null;
    let cityData = undefined;
    if (body.cityName) {
      cityProfile = await prisma.cityProfile.findUnique({
        where: { name: body.cityName }
      });
      if (cityProfile) {
        cityData = {
          name: cityProfile.name,
          electricityFactor: cityProfile.electricityFactor,
          transitFactor: cityProfile.transitFactor
        };
      }
    }

    // Server-side calculation for ultimate accuracy
    const engine = new CarbonEngine();
    const result = engine.process(body.category, body.subcategory, body.inputValue, cityData);

    const activity = await prisma.activity.create({
      data: {
        userId: userId,
        cityId: cityProfile?.id,
        category: body.category,
        subcategory: body.subcategory,
        inputValue: body.inputValue,
        unit: body.unit,
        co2Emitted: result.co2Emitted, // use server calculated
      },
      include: { cityProfile: true }
    });
    
    return NextResponse.json(activity);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
