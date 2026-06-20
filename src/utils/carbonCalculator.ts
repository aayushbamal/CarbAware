import type { CarbonData } from '../types';

// Emission factors (expressed in kg CO2e)
export const EMISSION_FACTORS = {
  // transport per km
  transport: {
    car_petrol: 0.18,
    car_diesel: 0.17,
    car_electric: 0.05,
    transit: 0.04,
    bicycle_walk: 0.0,
  },
  // flight per flight segment (short haul: 150kg, long haul: 600kg)
  flights: {
    shortHaul: 150,
    longHaul: 600,
  },
  // home energy factors (based on electric bill and sources)
  electricity: {
    grid_coal: 1.8,    // multiplier for heavy coal grid
    grid_mixed: 1.0,   // standard mixed grid base
    solar_renewable: 0.15, // minimal renewable overhead
  },
  heating: {
    natural_gas: 15.0, // kg CO2 per sq meter per year
    electricity: 8.0,
    heating_oil: 25.0,
    wood: 5.0,
  },
  // diet annual emissions in tonnes CO2e
  diet: {
    heavy_meat: 2.9,
    moderate_meat: 1.7,
    vegetarian: 1.0,
    vegan: 0.6,
  },
  // waste & shopping annual emissions in tonnes CO2e
  waste: {
    low: 0.05,
    medium: 0.15,
    high: 0.3,
  },
  recycling: {
    all: -0.2, // carbon credit
    some: -0.05,
    none: 0.1,
  },
  shopping: {
    rarely: 0.2,
    average: 0.6,
    frequently: 1.5,
  }
};

// Comparative Averages (Metric Tonnes CO2e / Year)
export const CARBON_AVERAGES = {
  global: 4.5,
  usa: 16.0,
  india: 1.9,
  europe: 6.8,
  target: 2.0, // 2030 target limit per person to limit warming to 1.5C
};

export interface CarbonBreakdown {
  transport: number;
  homeEnergy: number;
  diet: number;
  wasteShopping: number;
  total: number;
}

/**
 * Calculates yearly carbon footprint in Metric Tonnes CO2e
 */
export function calculateCarbonFootprint(data: CarbonData): CarbonBreakdown {
  // 1. TRANSPORTATION
  const weeklyKm = Number(data.weeklyCommuteKm) || 0;
  const transportFactor = EMISSION_FACTORS.transport[data.commuteMode] || 0;
  const yearlyCommuteCO2Kg = weeklyKm * 52 * transportFactor;
  const shortFlightsCO2Kg = (Number(data.yearlyFlights) || 0) * EMISSION_FACTORS.flights.shortHaul;
  const longFlightsCO2Kg = (Number(data.yearlyLongFlights) || 0) * EMISSION_FACTORS.flights.longHaul;
  
  const transportTotalTonnes = (yearlyCommuteCO2Kg + shortFlightsCO2Kg + longFlightsCO2Kg) / 1000;

  // 2. HOME ENERGY
  // Electricity contribution: monthly bill * 12 * base factor * source factor
  // We approximate $1 / unit of bill corresponds to ~6 kWh, with standard mixed grid footprint
  const monthlyBill = Number(data.monthlyElectricBill) || 0;
  const electricityMultiplier = EMISSION_FACTORS.electricity[data.electricitySource] || 1.0;
  const annualElectricityCO2Kg = monthlyBill * 12 * 0.45 * electricityMultiplier; // base multiplier

  // Heating contribution based on home size and fuel type
  const homeSize = Number(data.homeSizeSqM) || 0;
  const heatingFactor = EMISSION_FACTORS.heating[data.heatingFuel] || 0;
  const annualHeatingCO2Kg = homeSize * heatingFactor;

  const homeEnergyTotalTonnes = (annualElectricityCO2Kg + annualHeatingCO2Kg) / 1000;

  // 3. DIET
  const dietTotalTonnes = EMISSION_FACTORS.diet[data.dietType] || 1.7;

  // 4. WASTE & SHOPPING
  const wasteTonnes = EMISSION_FACTORS.waste[data.foodWasteLevel] || 0.15;
  const recyclingCredit = EMISSION_FACTORS.recycling[data.recyclingHabits] || -0.05;
  const shoppingTonnes = EMISSION_FACTORS.shopping[data.shoppingFrequency] || 0.6;
  
  const wasteShoppingTotalTonnes = Math.max(0.01, wasteTonnes + recyclingCredit + shoppingTonnes);

  // TOTAL
  const total = transportTotalTonnes + homeEnergyTotalTonnes + dietTotalTonnes + wasteShoppingTotalTonnes;

  return {
    transport: Number(transportTotalTonnes.toFixed(2)),
    homeEnergy: Number(homeEnergyTotalTonnes.toFixed(2)),
    diet: Number(dietTotalTonnes.toFixed(2)),
    wasteShopping: Number(wasteShoppingTotalTonnes.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

/**
 * Calculates savings for hypothetical changes (used in sandbox simulation)
 */
export function calculateSavings(current: CarbonBreakdown, data: CarbonData, modifications: Partial<CarbonData>): {
  newBreakdown: CarbonBreakdown;
  savedTonnes: number;
  treesEquivalent: number;
} {
  const modifiedData = { ...data, ...modifications };
  const newBreakdown = calculateCarbonFootprint(modifiedData);
  const savedTonnes = Math.max(0, current.total - newBreakdown.total);
  
  // 1 tree absorbs approximately 22kg (0.022 tonnes) of CO2 per year
  const treesEquivalent = Math.round(savedTonnes / 0.022);

  return {
    newBreakdown,
    savedTonnes: Number(savedTonnes.toFixed(2)),
    treesEquivalent
  };
}
