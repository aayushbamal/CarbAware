import { describe, it, expect } from 'vitest';
import { calculateCarbonFootprint, calculateSavings } from './carbonCalculator';
import type { CarbonData } from '../types';

describe('Carbon Footprint Calculator Utilities', () => {
  const lowImpactProfile: CarbonData = {
    commuteMode: 'bicycle_walk',
    weeklyCommuteKm: 0,
    yearlyFlights: 0,
    yearlyLongFlights: 0,
    electricitySource: 'solar_renewable',
    monthlyElectricBill: 10,
    heatingFuel: 'electricity',
    homeSizeSqM: 50,
    dietType: 'vegan',
    foodWasteLevel: 'low',
    recyclingHabits: 'all',
    shoppingFrequency: 'rarely'
  };

  const highImpactProfile: CarbonData = {
    commuteMode: 'car_petrol',
    weeklyCommuteKm: 300,
    yearlyFlights: 6,
    yearlyLongFlights: 4,
    electricitySource: 'grid_coal',
    monthlyElectricBill: 200,
    heatingFuel: 'heating_oil',
    homeSizeSqM: 250,
    dietType: 'heavy_meat',
    foodWasteLevel: 'high',
    recyclingHabits: 'none',
    shoppingFrequency: 'frequently'
  };

  it('calculates carbon footprint for a low-impact eco-conscious lifestyle', () => {
    const result = calculateCarbonFootprint(lowImpactProfile);
    
    // Transport: 0 km * factor + 0 flights = 0 tonnes
    expect(result.transport).toBe(0);
    
    // Diet: vegan = 0.6 tonnes
    expect(result.diet).toBe(0.6);

    // Total should be relatively small
    expect(result.total).toBeLessThan(2.0); // well under global average
  });

  it('calculates carbon footprint for a high-impact heavy-consumption lifestyle', () => {
    const result = calculateCarbonFootprint(highImpactProfile);
    
    // Transport should be heavy due to flights and car petrol commuting
    expect(result.transport).toBeGreaterThan(5.0);
    
    // Energy should be high due to coal grid and oil heating
    expect(result.homeEnergy).toBeGreaterThan(5.0);

    // Diet: heavy_meat = 2.9 tonnes
    expect(result.diet).toBe(2.9);

    // Total should be very large
    expect(result.total).toBeGreaterThan(15.0);
  });

  it('calculates savings correctly in sandbox mode when modifications are applied', () => {
    const currentBreakdown = calculateCarbonFootprint(highImpactProfile);
    
    // Suggest modifications: Switch car commuting to public transit, switch electricity to solar renewable
    const modifications: Partial<CarbonData> = {
      commuteMode: 'transit',
      electricitySource: 'solar_renewable'
    };

    const savingsResult = calculateSavings(currentBreakdown, highImpactProfile, modifications);
    
    expect(savingsResult.savedTonnes).toBeGreaterThan(0);
    expect(savingsResult.newBreakdown.total).toBeLessThan(currentBreakdown.total);
    expect(savingsResult.treesEquivalent).toBeGreaterThan(0);
  });

  it('calculates diet footprint categories correctly according to definitions', () => {
    const profile = { ...lowImpactProfile };
    
    profile.dietType = 'vegan';
    expect(calculateCarbonFootprint(profile).diet).toBe(0.6);
    
    profile.dietType = 'vegetarian';
    expect(calculateCarbonFootprint(profile).diet).toBe(1.0);
    
    profile.dietType = 'moderate_meat';
    expect(calculateCarbonFootprint(profile).diet).toBe(1.7);
    
    profile.dietType = 'heavy_meat';
    expect(calculateCarbonFootprint(profile).diet).toBe(2.9);
  });

  it('calculates waste footprint categories correctly based on levels', () => {
    const profile = { ...lowImpactProfile };
    
    profile.foodWasteLevel = 'low';
    profile.recyclingHabits = 'all';
    profile.shoppingFrequency = 'rarely';
    const lowWaste = calculateCarbonFootprint(profile).wasteShopping;

    profile.foodWasteLevel = 'high';
    profile.recyclingHabits = 'none';
    profile.shoppingFrequency = 'frequently';
    const highWaste = calculateCarbonFootprint(profile).wasteShopping;

    expect(highWaste).toBeGreaterThan(lowWaste);
  });

  it('handles negative inputs defensively by clamping them to 0', () => {
    const negativeProfile: CarbonData = {
      commuteMode: 'car_petrol',
      weeklyCommuteKm: -100,
      yearlyFlights: -5,
      yearlyLongFlights: -2,
      electricitySource: 'grid_coal',
      monthlyElectricBill: -50,
      heatingFuel: 'natural_gas',
      homeSizeSqM: -200,
      dietType: 'vegan',
      foodWasteLevel: 'low',
      recyclingHabits: 'all',
      shoppingFrequency: 'rarely'
    };

    const result = calculateCarbonFootprint(negativeProfile);

    // With negative inputs clamped, transport and homeEnergy should be 0 tonnes
    expect(result.transport).toBe(0);
    expect(result.homeEnergy).toBe(0);
    expect(result.diet).toBe(0.6); // vegan base diet footprint
    expect(result.total).toBe(0.6 + result.wasteShopping); // total should just be diet + waste & shopping
  });
});
