import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSandboxSim } from './useSandboxSim';
import type { UserProfile } from '../types';

describe('useSandboxSim Custom Hook Tests', () => {
  const mockProfile: UserProfile = {
    name: 'Test Champion',
    onboarded: true,
    totalPoints: 100,
    streakCount: 3,
    lastCheckedDate: '2026-06-20',
    theme: 'forest',
    offsetTonnes: 0,
    currentData: {
      commuteMode: 'car_petrol',
      weeklyCommuteKm: 200,
      yearlyFlights: 2,
      yearlyLongFlights: 0,
      electricitySource: 'grid_coal',
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
    achievements: []
  };

  it('initializes sandbox state with profile currentData', () => {
    const onUpdateMock = vi.fn();
    const { result } = renderHook(() => useSandboxSim(mockProfile, onUpdateMock));

    expect(result.current.sandboxData.weeklyCommuteKm).toBe(200);
    expect(result.current.sandboxData.commuteMode).toBe('car_petrol');
  });

  it('updates state variables when handleSelect or handleSliderChange is fired', () => {
    const onUpdateMock = vi.fn();
    const { result } = renderHook(() => useSandboxSim(mockProfile, onUpdateMock));

    act(() => {
      result.current.handleSliderChange('weeklyCommuteKm', 350);
    });
    expect(result.current.sandboxData.weeklyCommuteKm).toBe(350);

    act(() => {
      result.current.handleSelect('commuteMode', 'transit');
    });
    expect(result.current.sandboxData.commuteMode).toBe('transit');
  });

  it('resets sandbox data back to profile values when handleReset is fired', () => {
    const onUpdateMock = vi.fn();
    const { result } = renderHook(() => useSandboxSim(mockProfile, onUpdateMock));

    act(() => {
      result.current.handleSliderChange('weeklyCommuteKm', 500);
    });
    expect(result.current.sandboxData.weeklyCommuteKm).toBe(500);

    act(() => {
      result.current.handleReset();
    });
    expect(result.current.sandboxData.weeklyCommuteKm).toBe(200);
  });

  it('calls onUpdateProfileData handler with current sandbox data when handleApply is fired', () => {
    const onUpdateMock = vi.fn();
    const { result } = renderHook(() => useSandboxSim(mockProfile, onUpdateMock));

    act(() => {
      result.current.handleSliderChange('weeklyCommuteKm', 150);
    });

    act(() => {
      result.current.handleApply();
    });

    expect(onUpdateMock).toHaveBeenCalledTimes(1);
    expect(onUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      weeklyCommuteKm: 150
    }));
  });
});
