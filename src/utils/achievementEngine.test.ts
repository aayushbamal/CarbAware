import { describe, it, expect } from 'vitest';
import { runAchievementScans } from './achievementEngine';
import type { UserProfile, Achievement } from '../types';

describe('Achievements Scanner Engine Tests', () => {
  const mockAchievementsTemplate: Achievement[] = [
    { id: 'ac1', title: 'Eco Onboarded', description: 'Description', badge: '📚', unlocked: false, requirement: 'Onboard' },
    { id: 'ac2', title: '100 XP Points', description: 'Description', badge: '🌲', unlocked: false, requirement: '100 XP' },
    { id: 'ac3', title: 'Green Commuter', description: 'Description', badge: '🚲', unlocked: false, requirement: 'Commute' },
    { id: 'ac4', title: 'Plant-Based', description: 'Description', badge: '🥗', unlocked: false, requirement: 'Diet' },
    { id: 'ac5', title: 'Solar Powered', description: 'Description', badge: '☀️', unlocked: false, requirement: 'Grid' }
  ];

  const createBaseProfile = (points = 0): UserProfile => ({
    name: 'Test Champion',
    onboarded: true,
    totalPoints: points,
    streakCount: 0,
    lastCheckedDate: null,
    theme: 'forest',
    offsetTonnes: 0,
    currentData: {
      commuteMode: 'car_petrol',
      weeklyCommuteKm: 200,
      yearlyFlights: 2,
      yearlyLongFlights: 0,
      electricitySource: 'grid_mixed',
      monthlyElectricBill: 80,
      heatingFuel: 'natural_gas',
      homeSizeSqM: 100,
      dietType: 'moderate_meat',
      foodWasteLevel: 'medium',
      recyclingHabits: 'some',
      shoppingFrequency: 'average'
    },
    history: [],
    habits: [],
    achievements: JSON.parse(JSON.stringify(mockAchievementsTemplate))
  });

  // 1. Missing currentData profile checks
  it('should not crash and not unlock lifestyle achievements when currentData is null', () => {
    const profile = createBaseProfile(50);
    profile.currentData = null;

    const updated = runAchievementScans(profile);
    const ac3 = updated.achievements.find(a => a.id === 'ac3');
    const ac4 = updated.achievements.find(a => a.id === 'ac4');
    const ac5 = updated.achievements.find(a => a.id === 'ac5');

    expect(ac3?.unlocked).toBe(false);
    expect(ac4?.unlocked).toBe(false);
    expect(ac5?.unlocked).toBe(false);
    expect(updated.totalPoints).toBe(50); // no bonus points
  });

  // 2. Under 100 XP point boundary (99 XP)
  it('should not unlock ac2 when points are exactly 99', () => {
    const profile = createBaseProfile(99);
    const updated = runAchievementScans(profile);

    const ac2 = updated.achievements.find(a => a.id === 'ac2');
    expect(ac2?.unlocked).toBe(false);
    expect(updated.totalPoints).toBe(99);
  });

  // 3. Exact 100 XP point boundary
  it('should unlock ac2 when points are exactly 100', () => {
    const profile = createBaseProfile(100);
    const updated = runAchievementScans(profile);

    const ac2 = updated.achievements.find(a => a.id === 'ac2');
    expect(ac2?.unlocked).toBe(true);
    expect(ac2?.unlockedAt).toBeDefined();
    expect(updated.totalPoints).toBe(120); // 100 + 20 bonus
  });

  // 4. Over 100 XP point boundary
  it('should unlock ac2 when points are greater than 100', () => {
    const profile = createBaseProfile(150);
    const updated = runAchievementScans(profile);

    const ac2 = updated.achievements.find(a => a.id === 'ac2');
    expect(ac2?.unlocked).toBe(true);
    expect(updated.totalPoints).toBe(170); // 150 + 20 bonus
  });

  // 5. Zero or negative XP scores
  it('should handle zero or negative XP scores defensively without unlocking ac2', () => {
    const zeroProfile = createBaseProfile(0);
    const negativeProfile = createBaseProfile(-50);

    const updatedZero = runAchievementScans(zeroProfile);
    const updatedNegative = runAchievementScans(negativeProfile);

    expect(updatedZero.achievements.find(a => a.id === 'ac2')?.unlocked).toBe(false);
    expect(updatedNegative.achievements.find(a => a.id === 'ac2')?.unlocked).toBe(false);
    expect(updatedZero.totalPoints).toBe(0);
    expect(updatedNegative.totalPoints).toBe(-50);
  });

  // 6. Commute mode unlocks: transit
  it('should unlock ac3 when commuting mode is transit', () => {
    const profile = createBaseProfile(0);
    if (profile.currentData) {
      profile.currentData.commuteMode = 'transit';
    }

    const updated = runAchievementScans(profile);
    const ac3 = updated.achievements.find(a => a.id === 'ac3');
    expect(ac3?.unlocked).toBe(true);
    expect(updated.totalPoints).toBe(20);
  });

  // 7. Commute mode unlocks: active travel
  it('should unlock ac3 when commuting mode is bicycle_walk', () => {
    const profile = createBaseProfile(0);
    if (profile.currentData) {
      profile.currentData.commuteMode = 'bicycle_walk';
    }

    const updated = runAchievementScans(profile);
    const ac3 = updated.achievements.find(a => a.id === 'ac3');
    expect(ac3?.unlocked).toBe(true);
    expect(updated.totalPoints).toBe(20);
  });

  // 8. Commute mode unlocks: electric car
  it('should unlock ac3 when commuting mode is car_electric', () => {
    const profile = createBaseProfile(0);
    if (profile.currentData) {
      profile.currentData.commuteMode = 'car_electric';
    }

    const updated = runAchievementScans(profile);
    const ac3 = updated.achievements.find(a => a.id === 'ac3');
    expect(ac3?.unlocked).toBe(true);
    expect(updated.totalPoints).toBe(20);
  });

  // 9. Commute mode non-unlocks: petrol/diesel car
  it('should not unlock ac3 when commuting mode is petrol or diesel car', () => {
    const petrolProfile = createBaseProfile(0);
    const dieselProfile = createBaseProfile(0);
    if (petrolProfile.currentData) petrolProfile.currentData.commuteMode = 'car_petrol';
    if (dieselProfile.currentData) dieselProfile.currentData.commuteMode = 'car_diesel';

    expect(runAchievementScans(petrolProfile).achievements.find(a => a.id === 'ac3')?.unlocked).toBe(false);
    expect(runAchievementScans(dieselProfile).achievements.find(a => a.id === 'ac3')?.unlocked).toBe(false);
  });

  // 10. Diet unlocks: vegetarian
  it('should unlock ac4 when diet is vegetarian', () => {
    const profile = createBaseProfile(0);
    if (profile.currentData) {
      profile.currentData.dietType = 'vegetarian';
    }

    const updated = runAchievementScans(profile);
    const ac4 = updated.achievements.find(a => a.id === 'ac4');
    expect(ac4?.unlocked).toBe(true);
    expect(updated.totalPoints).toBe(20);
  });

  // 11. Diet unlocks: vegan
  it('should unlock ac4 when diet is vegan', () => {
    const profile = createBaseProfile(0);
    if (profile.currentData) {
      profile.currentData.dietType = 'vegan';
    }

    const updated = runAchievementScans(profile);
    const ac4 = updated.achievements.find(a => a.id === 'ac4');
    expect(ac4?.unlocked).toBe(true);
    expect(updated.totalPoints).toBe(20);
  });

  // 12. Diet non-unlocks: moderate/heavy meat
  it('should not unlock ac4 when diet is moderate_meat or heavy_meat', () => {
    const moderateProfile = createBaseProfile(0);
    const heavyProfile = createBaseProfile(0);
    if (moderateProfile.currentData) moderateProfile.currentData.dietType = 'moderate_meat';
    if (heavyProfile.currentData) heavyProfile.currentData.dietType = 'heavy_meat';

    expect(runAchievementScans(moderateProfile).achievements.find(a => a.id === 'ac4')?.unlocked).toBe(false);
    expect(runAchievementScans(heavyProfile).achievements.find(a => a.id === 'ac4')?.unlocked).toBe(false);
  });

  // 13. Grid solar unlocks & non-unlocks
  it('should unlock ac5 for solar_renewable, but not mixed or coal grids', () => {
    const solarProfile = createBaseProfile(0);
    const coalProfile = createBaseProfile(0);
    if (solarProfile.currentData) solarProfile.currentData.electricitySource = 'solar_renewable';
    if (coalProfile.currentData) coalProfile.currentData.electricitySource = 'grid_coal';

    const solarRes = runAchievementScans(solarProfile);
    const coalRes = runAchievementScans(coalProfile);

    expect(solarRes.achievements.find(a => a.id === 'ac5')?.unlocked).toBe(true);
    expect(coalRes.achievements.find(a => a.id === 'ac5')?.unlocked).toBe(false);
    expect(solarRes.totalPoints).toBe(20);
    expect(coalRes.totalPoints).toBe(0);
  });

  // 14. Unlocking multiple achievements in a single scan
  it('should unlock multiple achievements at once and award combined bonus points', () => {
    const profile = createBaseProfile(100); // unlocks ac2
    if (profile.currentData) {
      profile.currentData.commuteMode = 'bicycle_walk'; // unlocks ac3
      profile.currentData.dietType = 'vegan'; // unlocks ac4
    }

    const updated = runAchievementScans(profile);
    const ac2 = updated.achievements.find(a => a.id === 'ac2');
    const ac3 = updated.achievements.find(a => a.id === 'ac3');
    const ac4 = updated.achievements.find(a => a.id === 'ac4');

    expect(ac2?.unlocked).toBe(true);
    expect(ac3?.unlocked).toBe(true);
    expect(ac4?.unlocked).toBe(true);
    expect(updated.totalPoints).toBe(160); // 100 base + 20 * 3 bonus = 160 XP
  });

  // 15. Duplicate unlock and unlockedAt preservation checks
  it('should not award repeat points or change unlockedAt date for already unlocked achievements', () => {
    const profile = createBaseProfile(100);
    
    // Scan 1: Unlocks ac2
    const firstScan = runAchievementScans(profile);
    const ac2First = firstScan.achievements.find(a => a.id === 'ac2');
    expect(ac2First?.unlocked).toBe(true);
    expect(firstScan.totalPoints).toBe(120);

    const unlockDate = ac2First?.unlockedAt;
    expect(unlockDate).toBeDefined();

    // Scan 2: Running it again on the updated profile should be a no-op
    const secondScan = runAchievementScans(firstScan);
    const ac2Second = secondScan.achievements.find(a => a.id === 'ac2');
    expect(ac2Second?.unlocked).toBe(true);
    expect(ac2Second?.unlockedAt).toBe(unlockDate);
    expect(secondScan.totalPoints).toBe(120); // remains 120, no double-award
  });
});
