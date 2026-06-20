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

  it('should unlock ac2 when points are equal to or greater than 100', () => {
    const profile = createBaseProfile(110);
    const updated = runAchievementScans(profile);

    const ac2 = updated.achievements.find(a => a.id === 'ac2');
    expect(ac2?.unlocked).toBe(true);
    expect(ac2?.unlockedAt).toBeDefined();
    // Verify 20 points reward was awarded
    expect(updated.totalPoints).toBe(130);
  });

  it('should unlock ac3 when commuting mode is bicycle, walk, electric car, or transit', () => {
    const profile = createBaseProfile(0);
    if (profile.currentData) {
      profile.currentData.commuteMode = 'bicycle_walk';
    }

    const updated = runAchievementScans(profile);
    const ac3 = updated.achievements.find(a => a.id === 'ac3');
    expect(ac3?.unlocked).toBe(true);
    expect(updated.totalPoints).toBe(20); // 20 bonus points
  });

  it('should unlock ac4 when diet is vegan or vegetarian', () => {
    const profile = createBaseProfile(50);
    if (profile.currentData) {
      profile.currentData.dietType = 'vegan';
    }

    const updated = runAchievementScans(profile);
    const ac4 = updated.achievements.find(a => a.id === 'ac4');
    expect(ac4?.unlocked).toBe(true);
    expect(updated.totalPoints).toBe(70); // 50 + 20
  });

  it('should unlock ac5 when electricity source is solar_renewable', () => {
    const profile = createBaseProfile(0);
    if (profile.currentData) {
      profile.currentData.electricitySource = 'solar_renewable';
    }

    const updated = runAchievementScans(profile);
    const ac5 = updated.achievements.find(a => a.id === 'ac5');
    expect(ac5?.unlocked).toBe(true);
    expect(updated.totalPoints).toBe(20);
  });

  it('should not unlock achievements that are already unlocked and not award repeat points', () => {
    const profile = createBaseProfile(100);
    // Manually unlock ac2 in advance
    const ac2 = profile.achievements.find(a => a.id === 'ac2');
    if (ac2) {
      ac2.unlocked = true;
      ac2.unlockedAt = 'yesterday';
    }

    const updated = runAchievementScans(profile);
    expect(updated.totalPoints).toBe(100); // No bonus awarded again
  });
});
