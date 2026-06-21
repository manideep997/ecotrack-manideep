import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CarbonEngine } from '@/lib/carbon';

export async function GET() {
  try {
    const cities = [
      { name: "New York", electricityFactor: 0.25, transitFactor: 0.08 },
      { name: "Los Angeles", electricityFactor: 0.35, transitFactor: 0.15 },
      { name: "London", electricityFactor: 0.20, transitFactor: 0.10 },
      { name: "Tokyo", electricityFactor: 0.45, transitFactor: 0.05 },
      { name: "Mumbai", electricityFactor: 0.70, transitFactor: 0.04 },
      { name: "Delhi", electricityFactor: 0.72, transitFactor: 0.06 },
      { name: "Bangalore", electricityFactor: 0.68, transitFactor: 0.07 },
      { name: "Hyderabad", electricityFactor: 0.70, transitFactor: 0.06 },
      { name: "Chennai", electricityFactor: 0.69, transitFactor: 0.05 },
      { name: "Trivandrum", electricityFactor: 0.65, transitFactor: 0.06 },
    ];

    let cityProfiles = [];
    for (const city of cities) {
      const profile = await prisma.cityProfile.upsert({
        where: { name: city.name },
        update: city,
        create: city,
      });
      cityProfiles.push(profile);
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'demo@ecotrack.app', name: 'Demo User' }
      });
    }

    // Real-world average distributions per city (daily basis unless otherwise noted)
    const realWorldStats: any = {
      "New York": {
        carMiles: { min: 5, max: 25 },       // Lower average VMT, high transit
        transitMiles: { min: 10, max: 30 },  // High subway usage
        electricityKwh: { min: 15, max: 25 },// US average is high, NY apartments slightly lower (~600 kWh/mo)
        beef: { min: 0, max: 1 },            // US meat consumption is high
        chicken: { min: 1, max: 2 },
        plantBased: { min: 0, max: 2 },
      },
      "Los Angeles": {
        carMiles: { min: 25, max: 60 },      // Car-heavy culture, high VMT
        transitMiles: { min: 0, max: 5 },    // Low transit usage
        electricityKwh: { min: 20, max: 35 },// AC usage in LA
        beef: { min: 0, max: 1 },
        chicken: { min: 1, max: 2 },
        plantBased: { min: 1, max: 3 },      // Higher plant-based trend
      },
      "London": {
        carMiles: { min: 5, max: 15 },       // European cities have lower VMT
        transitMiles: { min: 15, max: 35 },  // The Tube is heavily used
        electricityKwh: { min: 6, max: 10 }, // UK average is ~230 kWh/month (~7-8 daily)
        beef: { min: 0, max: 0.5 },          // Lower beef consumption than US
        chicken: { min: 0, max: 1.5 },
        plantBased: { min: 1, max: 3 },
      },
      "Tokyo": {
        carMiles: { min: 0, max: 8 },        // Extremely low car commuting
        transitMiles: { min: 20, max: 50 },  // World's highest train ridership
        electricityKwh: { min: 6, max: 11 }, // Japan average is ~220 kWh/month
        beef: { min: 0, max: 0.3 },          // Very low beef consumption, high fish (untracked)
        chicken: { min: 0, max: 1 },
        plantBased: { min: 1, max: 4 },      // High soy/plant-based diet elements
      },
      "Mumbai": {
        carMiles: { min: 2, max: 12 },
        transitMiles: { min: 15, max: 40 },  // Mumbai Local trains
        electricityKwh: { min: 5, max: 12 },
        beef: { min: 0, max: 0.1 },
        chicken: { min: 0, max: 1.5 },
        plantBased: { min: 4, max: 12 },
      },
      "Delhi": {
        carMiles: { min: 5, max: 20 },
        transitMiles: { min: 10, max: 30 },  // Delhi Metro
        electricityKwh: { min: 8, max: 18 }, // High summer AC usage
        beef: { min: 0, max: 0.1 },
        chicken: { min: 1, max: 3 },
        plantBased: { min: 4, max: 10 },
      },
      "Bangalore": {
        carMiles: { min: 5, max: 20 },       // Tech commuters, heavy traffic
        transitMiles: { min: 5, max: 20 },
        electricityKwh: { min: 5, max: 10 }, // Milder weather
        beef: { min: 0, max: 0.2 },
        chicken: { min: 1, max: 3 },
        plantBased: { min: 4, max: 10 },
      },
      "Hyderabad": {
        carMiles: { min: 5, max: 20 },
        transitMiles: { min: 5, max: 20 },
        electricityKwh: { min: 6, max: 15 },
        beef: { min: 0, max: 0.2 },
        chicken: { min: 2, max: 4 },         // High chicken consumption
        plantBased: { min: 3, max: 9 },
      },
      "Chennai": {
        carMiles: { min: 5, max: 15 },
        transitMiles: { min: 10, max: 25 },
        electricityKwh: { min: 7, max: 16 }, // Hot/Humid, AC usage
        beef: { min: 0, max: 0.2 },
        chicken: { min: 1, max: 3 },
        plantBased: { min: 5, max: 12 },
      },
      "Trivandrum": {
        carMiles: { min: 2, max: 12 },
        transitMiles: { min: 5, max: 20 },
        electricityKwh: { min: 5, max: 12 },
        beef: { min: 0, max: 2.5 },          // Beef is commonly consumed in Kerala
        chicken: { min: 1, max: 3 },
        plantBased: { min: 3, max: 10 },
      }
    };

    const engine = new CarbonEngine();
    await prisma.activity.deleteMany({});
    const activitiesToCreate = [];
    
    // Generate 30 days of data for each city
    for (const cityProfile of cityProfiles) {
      const stats = realWorldStats[cityProfile.name];
      
      for (let day = 0; day < 30; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        
        const generateVal = (min: number, max: number) => {
           const val = min + Math.random() * (max - min);
           return parseFloat(val.toFixed(1));
        };

        // 1. Daily Travel
        const carVal = generateVal(stats.carMiles.min, stats.carMiles.max);
        if (carVal > 1) {
          activitiesToCreate.push({
            userId: user.id, cityId: cityProfile.id, date,
            category: 'TRAVEL', subcategory: 'Car', inputValue: carVal, unit: 'miles',
            co2Emitted: engine.process('TRAVEL', 'Car', carVal, cityProfile).co2Emitted,
          });
        }
        
        const transitVal = generateVal(stats.transitMiles.min, stats.transitMiles.max);
        if (transitVal > 1) {
          activitiesToCreate.push({
            userId: user.id, cityId: cityProfile.id, date,
            category: 'TRAVEL', subcategory: 'Transit', inputValue: transitVal, unit: 'miles',
            co2Emitted: engine.process('TRAVEL', 'Transit', transitVal, cityProfile).co2Emitted,
          });
        }

        // 2. Daily Electricity
        const kwhVal = generateVal(stats.electricityKwh.min, stats.electricityKwh.max);
        activitiesToCreate.push({
          userId: user.id, cityId: cityProfile.id, date,
          category: 'ELECTRICITY', subcategory: 'Grid', inputValue: kwhVal, unit: 'kWh',
          co2Emitted: engine.process('ELECTRICITY', 'Grid', kwhVal, cityProfile).co2Emitted,
        });

        // 3. Daily Food
        const beefVal = generateVal(stats.beef.min, stats.beef.max);
        if (beefVal > 0.3) {
          activitiesToCreate.push({
            userId: user.id, cityId: cityProfile.id, date,
            category: 'FOOD', subcategory: 'Beef', inputValue: Math.round(beefVal), unit: 'servings',
            co2Emitted: engine.process('FOOD', 'Beef', Math.round(beefVal), cityProfile).co2Emitted,
          });
        }
        
        const chickenVal = generateVal(stats.chicken.min, stats.chicken.max);
        if (chickenVal > 0.5) {
          activitiesToCreate.push({
            userId: user.id, cityId: cityProfile.id, date,
            category: 'FOOD', subcategory: 'Chicken', inputValue: Math.round(chickenVal), unit: 'servings',
            co2Emitted: engine.process('FOOD', 'Chicken', Math.round(chickenVal), cityProfile).co2Emitted,
          });
        }

        const plantVal = generateVal(stats.plantBased.min, stats.plantBased.max);
        if (plantVal > 0.5) {
          activitiesToCreate.push({
            userId: user.id, cityId: cityProfile.id, date,
            category: 'FOOD', subcategory: 'Plant-Based', inputValue: Math.round(plantVal), unit: 'servings',
            co2Emitted: engine.process('FOOD', 'Plant-Based', Math.round(plantVal), cityProfile).co2Emitted,
          });
        }
      }
      
      // Add exactly 1 flight per month for Los Angeles and New York
      if (cityProfile.name === 'Los Angeles' || cityProfile.name === 'New York') {
        const flightDate = new Date();
        flightDate.setDate(flightDate.getDate() - 15);
        const flightMiles = cityProfile.name === 'Los Angeles' ? 1200 : 800;
        activitiesToCreate.push({
          userId: user.id, cityId: cityProfile.id, date: flightDate,
          category: 'TRAVEL', subcategory: 'Flight', inputValue: flightMiles, unit: 'miles',
          co2Emitted: engine.process('TRAVEL', 'Flight', flightMiles, cityProfile).co2Emitted,
        });
      }
    }

    await prisma.activity.createMany({ data: activitiesToCreate });

    return NextResponse.json({ message: `Cities and ${activitiesToCreate.length} real-world historical activities seeded successfully` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to seed cities" }, { status: 500 });
  }
}
