import { useState } from 'react';
import type { CarbonData, UserProfile } from '../types';

export const useSandboxSim = (
  profile: UserProfile,
  onUpdateProfileData: (data: CarbonData) => void
) => {
  const currentData = profile.currentData;

  const fallbackData: CarbonData = {
    commuteMode: 'transit',
    weeklyCommuteKm: 50,
    yearlyFlights: 1,
    yearlyLongFlights: 0,
    electricitySource: 'grid_mixed',
    monthlyElectricBill: 50,
    heatingFuel: 'natural_gas',
    homeSizeSqM: 80,
    dietType: 'moderate_meat',
    foodWasteLevel: 'medium',
    recyclingHabits: 'some',
    shoppingFrequency: 'average'
  };

  const [sandboxData, setSandboxData] = useState<CarbonData>(currentData || fallbackData);

  const handleSelect = <K extends keyof CarbonData>(key: K, value: CarbonData[K]) => {
    setSandboxData(prev => ({ ...prev, [key]: value }));
  };

  const handleSliderChange = (key: keyof CarbonData, val: number) => {
    setSandboxData(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    if (currentData) {
      setSandboxData({ ...currentData });
    }
  };

  const handleApply = () => {
    onUpdateProfileData(sandboxData);
  };

  return {
    sandboxData,
    handleSelect,
    handleSliderChange,
    handleReset,
    handleApply
  };
};
