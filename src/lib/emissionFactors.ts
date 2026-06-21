export interface EmissionFactor {
  value: number;
  source: string;
  accuracy: 'High' | 'Estimated' | 'Global Average';
  unit: string;
}

export interface CityEmissionData {
  electricity: EmissionFactor;
  car: EmissionFactor;
  transit: EmissionFactor;
  food: {
    beef: EmissionFactor;
    chicken: EmissionFactor;
    plantBased: EmissionFactor;
  };
}

const GLOBAL_FOOD_FACTORS = {
  beef: { value: 3.3, source: 'FAO/IPCC Global Averages', accuracy: 'Global Average' as const, unit: 'kg CO2/serving' },
  chicken: { value: 0.69, source: 'FAO/IPCC Global Averages', accuracy: 'Global Average' as const, unit: 'kg CO2/serving' },
  plantBased: { value: 0.2, source: 'FAO/IPCC Global Averages', accuracy: 'Global Average' as const, unit: 'kg CO2/serving' },
};

export const emissionFactors: Record<string, CityEmissionData> = {
  "New York": {
    electricity: { value: 0.25, source: 'EPA eGRID 2023 (NYCW)', accuracy: 'High', unit: 'kg CO2/kWh' },
    car: { value: 0.40, source: 'EPA Average Passenger Vehicle', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    transit: { value: 0.08, source: 'MTA Average Emissions', accuracy: 'High', unit: 'kg CO2/mile' },
    food: GLOBAL_FOOD_FACTORS,
  },
  "Los Angeles": {
    electricity: { value: 0.22, source: 'EPA eGRID 2023 (CAMX)', accuracy: 'High', unit: 'kg CO2/kWh' },
    car: { value: 0.38, source: 'CARB / EPA Estimates (Higher EV mix)', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    transit: { value: 0.15, source: 'LA Metro Average Emissions', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    food: GLOBAL_FOOD_FACTORS,
  },
  "London": {
    electricity: { value: 0.20, source: 'UK DEFRA 2023', accuracy: 'High', unit: 'kg CO2/kWh' },
    car: { value: 0.28, source: 'UK DEFRA 2023 (Average Car)', accuracy: 'High', unit: 'kg CO2/mile' },
    transit: { value: 0.06, source: 'TfL Environmental Report', accuracy: 'High', unit: 'kg CO2/mile' },
    food: GLOBAL_FOOD_FACTORS,
  },
  "Tokyo": {
    electricity: { value: 0.45, source: 'TEPCO 2023 Emission Intensity', accuracy: 'High', unit: 'kg CO2/kWh' },
    car: { value: 0.25, source: 'Japan MLIT (High fuel efficiency)', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    transit: { value: 0.04, source: 'Tokyo Metro Sustainability Report', accuracy: 'High', unit: 'kg CO2/mile' },
    food: GLOBAL_FOOD_FACTORS,
  },
  "Mumbai": {
    electricity: { value: 0.70, source: 'India CEA 2023 (Maharashtra Grid)', accuracy: 'High', unit: 'kg CO2/kWh' },
    car: { value: 0.35, source: 'ARAI Estimates (Petrol/CNG mix)', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    transit: { value: 0.04, source: 'Mumbai Local/BEST Average', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    food: GLOBAL_FOOD_FACTORS,
  },
  "Delhi": {
    electricity: { value: 0.72, source: 'India CEA 2023 (Northern Grid)', accuracy: 'High', unit: 'kg CO2/kWh' },
    car: { value: 0.32, source: 'ARAI Estimates (High CNG adoption)', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    transit: { value: 0.03, source: 'Delhi Metro Rail Corp (DMRC)', accuracy: 'High', unit: 'kg CO2/mile' },
    food: GLOBAL_FOOD_FACTORS,
  },
  "Bangalore": {
    electricity: { value: 0.68, source: 'India CEA 2023 (Karnataka Grid)', accuracy: 'High', unit: 'kg CO2/kWh' },
    car: { value: 0.36, source: 'ARAI Estimates (Petrol/Diesel mix)', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    transit: { value: 0.07, source: 'BMTC / Namma Metro Average', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    food: GLOBAL_FOOD_FACTORS,
  },
  "Hyderabad": {
    electricity: { value: 0.70, source: 'India CEA 2023 (Telangana Grid)', accuracy: 'High', unit: 'kg CO2/kWh' },
    car: { value: 0.36, source: 'ARAI Estimates', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    transit: { value: 0.06, source: 'TSRTC / Hyderabad Metro', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    food: GLOBAL_FOOD_FACTORS,
  },
  "Chennai": {
    electricity: { value: 0.69, source: 'India CEA 2023 (Tamil Nadu Grid)', accuracy: 'High', unit: 'kg CO2/kWh' },
    car: { value: 0.35, source: 'ARAI Estimates', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    transit: { value: 0.05, source: 'MTC / Chennai Metro', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    food: GLOBAL_FOOD_FACTORS,
  },
  "Trivandrum": {
    electricity: { value: 0.65, source: 'India CEA 2023 (Kerala Grid - High Hydro)', accuracy: 'High', unit: 'kg CO2/kWh' },
    car: { value: 0.36, source: 'ARAI Estimates', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    transit: { value: 0.06, source: 'KSRTC Average', accuracy: 'Estimated', unit: 'kg CO2/mile' },
    food: GLOBAL_FOOD_FACTORS,
  }
};

export const DEFAULT_FACTORS: CityEmissionData = {
  electricity: { value: 0.45, source: 'Global Grid Average', accuracy: 'Global Average', unit: 'kg CO2/kWh' },
  car: { value: 0.404, source: 'EPA Average Passenger Vehicle', accuracy: 'Global Average', unit: 'kg CO2/mile' },
  transit: { value: 0.14, source: 'Global Public Transit Average', accuracy: 'Global Average', unit: 'kg CO2/mile' },
  food: GLOBAL_FOOD_FACTORS,
};

export function getCityFactors(cityName?: string): CityEmissionData {
  if (!cityName) return DEFAULT_FACTORS;
  return emissionFactors[cityName] || DEFAULT_FACTORS;
}
