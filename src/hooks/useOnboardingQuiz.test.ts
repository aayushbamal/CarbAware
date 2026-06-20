import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingQuiz } from './useOnboardingQuiz';

describe('useOnboardingQuiz Custom Hook Tests', () => {
  it('initializes step to 1 and loads default questionnaire form data', () => {
    const onCompleteMock = vi.fn();
    const { result } = renderHook(() => useOnboardingQuiz(onCompleteMock));

    expect(result.current.step).toBe(1);
    expect(result.current.formData.weeklyCommuteKm).toBe(50);
    expect(result.current.formData.commuteMode).toBe('transit');
  });

  it('advances and regresses steps using nextStep and prevStep within boundaries', () => {
    const onCompleteMock = vi.fn();
    const { result } = renderHook(() => useOnboardingQuiz(onCompleteMock));

    expect(result.current.step).toBe(1);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.step).toBe(2);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.step).toBe(3);

    // Clamp to 3
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.step).toBe(3);

    act(() => {
      result.current.prevStep();
    });
    expect(result.current.step).toBe(2);
  });

  it('applies validation bounds defensively on number inputs', () => {
    const onCompleteMock = vi.fn();
    const { result } = renderHook(() => useOnboardingQuiz(onCompleteMock));

    // Over commute limit (2000 km)
    act(() => {
      result.current.handleNumberChange('weeklyCommuteKm', '99999');
    });
    expect(result.current.formData.weeklyCommuteKm).toBe(2000);

    // Negative numbers
    act(() => {
      result.current.handleNumberChange('monthlyElectricBill', '-500');
    });
    expect(result.current.formData.monthlyElectricBill).toBe(0);
  });

  it('triggers onComplete callback when handleSubmit is fired', () => {
    const onCompleteMock = vi.fn();
    const { result } = renderHook(() => useOnboardingQuiz(onCompleteMock));

    act(() => {
      result.current.handleSubmit();
    });

    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });
});
