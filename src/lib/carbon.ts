import { getCityFactors } from './emissionFactors';

export interface CityData {
  name: string;
  electricityFactor?: number;
  transitFactor?: number;
}

export interface CalculationResult {
  co2Emitted: number;
  pointsEarned: number;
  insight: string;
}

interface CarbonStrategy {
  calculate(subcategory: string, value: number, cityData?: CityData): CalculationResult;
}

class TravelStrategy implements CarbonStrategy {
  calculate(subcategory: string, value: number, cityData?: CityData): CalculationResult {
    const factors = getCityFactors(cityData?.name);
    let factor = 0;
    
    if (subcategory === 'Car') factor = factors.car.value;
    else if (subcategory === 'Flight') factor = 0.24; // Keep standard flight average
    else if (subcategory === 'Transit') factor = factors.transit.value;

    const co2 = factor * value;
    let points = 0;
    let insight = "";

    if (subcategory === 'Transit') {
      points = Math.floor(value * 0.5); 
      insight = cityData ? `Great job using ${cityData.name}'s public transit!` : "Great job using public transit! Reduced emissions.";
    } else if (subcategory === 'Flight') {
      insight = value > 1000 ? "Long flights have a huge impact! Consider offsetting this flight." : "Short flight logged. Consider trains for shorter distances to save CO2.";
    } else {
      insight = value > 20 ? `Driving ${value} miles emits a lot of CO2. Carpooling could cut this emission in half!` : "For short trips, walking or biking is a great zero-emission alternative!";
    }

    return { co2Emitted: co2, pointsEarned: points, insight };
  }
}

class ElectricityStrategy implements CarbonStrategy {
  calculate(subcategory: string, value: number, cityData?: CityData): CalculationResult {
    const factors = getCityFactors(cityData?.name);
    const factor = factors.electricity.value;
    const co2 = factor * value;
    
    let points = 0;
    let insight = "";
    
    if (value < 10) {
      points = 5;
      insight = `Only ${value} kWh? Low electricity usage today! Energy saving mode on.`;
    } else {
      insight = `${value} kWh used. Try unplugging inactive devices or switching to LED bulbs to lower this!`;
    }

    if (cityData) {
      insight += ` Calculated using ${factors.electricity.source} grid intensity (${factor} kg/kWh).`;
    }

    return { co2Emitted: co2, pointsEarned: points, insight };
  }
}

class FoodStrategy implements CarbonStrategy {
  calculate(subcategory: string, value: number, cityData?: CityData): CalculationResult {
    const factors = getCityFactors(cityData?.name);
    let factor = 0;
    
    if (subcategory === 'Beef') factor = factors.food.beef.value;
    else if (subcategory === 'Chicken') factor = factors.food.chicken.value;
    else if (subcategory === 'Plant-Based') factor = factors.food.plantBased.value;

    const co2 = factor * value;
    let points = 0;
    let insight = "";

    if (subcategory === 'Plant-Based') {
      points = value * 2; 
      insight = `Eating ${value} plant-based meals drastically reduces your footprint!`;
    } else if (subcategory === 'Beef') {
      insight = `Logging ${value} servings of Beef has a high carbon footprint. Try swapping one meal a week!`;
    } else {
      insight = `${value} servings of Chicken logged. Chicken is much better than Beef, but consider mixing in plant-based options!`;
    }

    return { co2Emitted: co2, pointsEarned: points, insight };
  }
}

export class CarbonEngine {
  private strategies: Record<string, CarbonStrategy> = {
    TRAVEL: new TravelStrategy(),
    ELECTRICITY: new ElectricityStrategy(),
    FOOD: new FoodStrategy(),
  };

  public process(category: string, subcategory: string, value: number, cityData?: CityData): CalculationResult {
    const strategy = this.strategies[category];
    if (!strategy) {
      return { co2Emitted: 0, pointsEarned: 0, insight: "Unknown category" };
    }
    return strategy.calculate(subcategory, value, cityData);
  }
}

// Backward compatible helper for existing simple routes
export function calculateCO2(category: string, subcategory: string, value: number, cityData?: CityData): number {
  const engine = new CarbonEngine();
  return engine.process(category, subcategory, value, cityData).co2Emitted;
}
