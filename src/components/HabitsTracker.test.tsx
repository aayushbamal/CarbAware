import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HabitsTracker } from './HabitsTracker';
import type { UserProfile } from '../types';

describe('HabitsTracker React Component Tests', () => {
  const mockProfile: UserProfile = {
    name: 'Eco Champion',
    onboarded: true,
    totalPoints: 120,
    streakCount: 5,
    lastCheckedDate: '2026-06-20',
    theme: 'forest',
    offsetTonnes: 0.5,
    currentData: null,
    history: [],
    habits: [
      { id: 'h1', name: 'Ate plant-based meals today', category: 'diet', co2SavedKg: 3.2, points: 15, completed: false, streak: 0 },
      { id: 'h2', name: 'Avoided car travel', category: 'transport', co2SavedKg: 5.0, points: 20, completed: true, streak: 2 }
    ],
    achievements: []
  };

  it('renders stats (points, streak, saved emissions) and list of habits correctly', () => {
    const toggleMock = vi.fn();
    const addMock = vi.fn();

    render(
      <HabitsTracker 
        profile={mockProfile} 
        onToggleHabit={toggleMock} 
        onAddHabit={addMock} 
      />
    );

    expect(screen.getByText('120 XP')).toBeDefined();
    expect(screen.getByText('5 Days')).toBeDefined();
    expect(screen.getByText('Ate plant-based meals today')).toBeDefined();
  });

  it('fires onToggleHabit handler when checkbox button is clicked', () => {
    const toggleMock = vi.fn();
    const addMock = vi.fn();

    render(
      <HabitsTracker 
        profile={mockProfile} 
        onToggleHabit={toggleMock} 
        onAddHabit={addMock} 
      />
    );

    const checkButton = screen.getByTestId('habit-checkbox-h1');
    fireEvent.click(checkButton);

    expect(toggleMock).toHaveBeenCalledTimes(1);
    expect(toggleMock).toHaveBeenCalledWith('h1');
  });

  it('submits the form and calls onAddHabit when custom action is entered', () => {
    const toggleMock = vi.fn();
    const addMock = vi.fn();

    render(
      <HabitsTracker 
        profile={mockProfile} 
        onToggleHabit={toggleMock} 
        onAddHabit={addMock} 
      />
    );

    const nameInput = screen.getByTestId('custom-habit-name');
    const submitButton = screen.getByTestId('custom-habit-add-btn');

    fireEvent.change(nameInput, { target: { value: 'Composted waste' } });
    fireEvent.click(submitButton);

    expect(addMock).toHaveBeenCalledTimes(1);
    expect(addMock).toHaveBeenCalledWith(
      'Composted waste',
      'energy', // default option in state
      1.5,      // default co2
      10        // default points
    );
  });
});
