import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfileState } from './useProfileState';
import type { CarbonData, AppSettings } from '../types';

describe('useProfileState Hook Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockCarbonData: CarbonData = {
    commuteMode: 'car_electric',
    weeklyCommuteKm: 120,
    yearlyFlights: 2,
    yearlyLongFlights: 0,
    electricitySource: 'solar_renewable',
    monthlyElectricBill: 75,
    heatingFuel: 'electricity',
    homeSizeSqM: 90,
    dietType: 'vegetarian',
    foodWasteLevel: 'low',
    recyclingHabits: 'all',
    shoppingFrequency: 'rarely'
  };

  it('should initialize with initial profile state and default tab', () => {
    const { result } = renderHook(() => useProfileState());

    expect(result.current.profile.name).toBe('Eco Champion');
    expect(result.current.profile.onboarded).toBe(false);
    expect(result.current.activeTab).toBe('dashboard');
    expect(result.current.isBypassed).toBe(false);
  });

  it('should transition tab and handle navigation correctly', () => {
    const { result } = renderHook(() => useProfileState());

    act(() => {
      result.current.navigateToTab('habits');
    });

    expect(result.current.activeTab).toBe('habits');
  });

  it('should handle onboarding complete by updating profile and computing base carbon breakdown', () => {
    const { result } = renderHook(() => useProfileState());

    act(() => {
      result.current.handleOnboardingComplete(mockCarbonData);
    });

    expect(result.current.profile.onboarded).toBe(true);
    expect(result.current.profile.currentData).toEqual(mockCarbonData);
    expect(result.current.profile.history.length).toBe(1);
    expect(result.current.profile.totalPoints).toBe(90); // 30 base + ac3 + ac4 + ac5 (60 points)
    expect(result.current.activeTab).toBe('dashboard');
  });

  it('should update profile settings correctly', () => {
    const { result } = renderHook(() => useProfileState());

    const settingsUpdate: AppSettings = {
      avatarEmoji: '🌲',
      assistantPersona: 'strict',
      modelTemperature: 0.2,
      compactMode: true,
      reduceMotion: true,
      panelOpacity: 0.35,
      notifyHabits: false,
      notifyDigest: false,
      notifyAchievements: false,
      nvidiaApiKey: 'test-nvapi',
      geminiApiKey: 'test-gemini'
    };

    act(() => {
      result.current.handleUpdateSettings({
        name: 'Eco Warrior',
        theme: 'ocean',
        settings: settingsUpdate
      });
    });

    expect(result.current.profile.name).toBe('Eco Warrior');
    expect(result.current.profile.theme).toBe('ocean');
    expect(result.current.profile.settings).toEqual(settingsUpdate);
  });

  it('should toggle habits and dynamically run achievement triggers', () => {
    const { result } = renderHook(() => useProfileState());

    // Toggle default habit 'h1' (points = 15)
    act(() => {
      result.current.handleToggleHabit('h1');
    });

    expect(result.current.profile.habits.find(h => h.id === 'h1')?.completed).toBe(true);
    expect(result.current.profile.totalPoints).toBe(15);

    // Toggle default habit 'h1' off (deducts 15 points)
    act(() => {
      result.current.handleToggleHabit('h1');
    });

    expect(result.current.profile.habits.find(h => h.id === 'h1')?.completed).toBe(false);
    expect(result.current.profile.totalPoints).toBe(0);
  });

  it('should add custom action checklist habits', () => {
    const { result } = renderHook(() => useProfileState());

    act(() => {
      result.current.handleAddHabit('Used eco-detergent', 'waste', 0.5, 8);
    });

    const customHabit = result.current.profile.habits.find(h => h.name === 'Used eco-detergent');
    expect(customHabit).toBeDefined();
    expect(customHabit?.category).toBe('waste');
    expect(customHabit?.co2SavedKg).toBe(0.5);
    expect(customHabit?.points).toBe(8);
  });

  it('should allow purchasing offset tonnes if user has sufficient XP points', () => {
    const { result } = renderHook(() => useProfileState());

    // Give points
    act(() => {
      result.current.handleUpdatePoints(500);
    });
    expect(result.current.profile.totalPoints).toBe(520); // 500 + ac2 unlocked (20 XP)

    // Purchase offset costing 200 XP for 1 tonne
    act(() => {
      result.current.handlePurchaseOffset(1.0, 200);
    });

    expect(result.current.profile.offsetTonnes).toBe(1.0);
    expect(result.current.profile.totalPoints).toBe(320);

    // Purchase offset with insufficient points (should be a no-op)
    act(() => {
      result.current.handlePurchaseOffset(1.0, 400);
    });

    expect(result.current.profile.offsetTonnes).toBe(1.0);
    expect(result.current.profile.totalPoints).toBe(320);
  });

  it('should add manual achievements triggers and save prompt wars states', () => {
    const { result } = renderHook(() => useProfileState());

    act(() => {
      result.current.handleAddAchievement('ac_negotiator');
    });

    expect(result.current.profile.achievements.find(a => a.id === 'ac_negotiator')?.unlocked).toBe(true);

    const nextPromptState = {
      completedOpponents: ['sam'],
      highScores: { sam: 2 },
      purchasedCards: ['science']
    };

    act(() => {
      result.current.handleUpdatePromptWarsState(nextPromptState);
    });

    expect(result.current.profile.promptWarsState).toEqual(nextPromptState);
  });
});
