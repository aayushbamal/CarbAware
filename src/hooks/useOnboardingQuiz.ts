import { useState } from 'react';
import type { CarbonData } from '../types';
import { calculateCarbonFootprint } from '../utils/carbonCalculator';

export const useOnboardingQuiz = (onComplete: (data: CarbonData) => void) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<CarbonData>({
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
  });

  const handleSelect = <K extends keyof CarbonData>(key: K, value: CarbonData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNumberChange = <K extends keyof CarbonData>(key: K, val: string) => {
    const parsedVal = parseInt(val) || 0;
    let clampedVal = Math.max(0, parsedVal);

    // Defensive logical upper bounds to preserve numerical stability and realistic layouts
    if (key === 'weeklyCommuteKm') clampedVal = Math.min(2000, clampedVal);
    if (key === 'yearlyFlights' || key === 'yearlyLongFlights') clampedVal = Math.min(100, clampedVal);
    if (key === 'monthlyElectricBill') clampedVal = Math.min(10000, clampedVal);
    if (key === 'homeSizeSqM') clampedVal = Math.min(1000, clampedVal);

    setFormData(prev => ({ ...prev, [key]: clampedVal }));
  };

  const currentFootprint = calculateCarbonFootprint(formData);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const handleSubmit = () => onComplete(formData);

  return {
    step,
    formData,
    handleSelect,
    handleNumberChange,
    currentFootprint,
    nextStep,
    prevStep,
    handleSubmit
  };
};
