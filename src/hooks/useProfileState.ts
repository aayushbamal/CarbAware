import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserProfile, CarbonData, HistoricalCalculation, AppSettings, PromptWarsState, DailyHabit, Achievement } from '../types';
import { calculateCarbonFootprint } from '../utils/carbonCalculator';
import { runAchievementScans } from '../utils/achievementEngine';
import { supabase } from '../utils/supabaseClient';

// Initial default habits checklist
const DEFAULT_HABITS: DailyHabit[] = [
  { id: 'h1', name: 'Ate plant-based meals today', category: 'diet', co2SavedKg: 3.2, points: 15, completed: false, streak: 0 },
  { id: 'h2', name: 'Avoided personal car travel (Walked/Cycled/Transit)', category: 'transport', co2SavedKg: 5.0, points: 20, completed: false, streak: 0 },
  { id: 'h3', name: 'Sorted and recycled household waste', category: 'waste', co2SavedKg: 1.0, points: 10, completed: false, streak: 0 },
  { id: 'h4', name: 'Turned off standby electronics / unplugged chargers', category: 'energy', co2SavedKg: 1.5, points: 12, completed: false, streak: 0 },
  { id: 'h5', name: 'Took a short shower (< 5 mins)', category: 'energy', co2SavedKg: 1.2, points: 10, completed: false, streak: 0 },
  { id: 'h6', name: 'Used reusable mugs, bags, and water bottles', category: 'waste', co2SavedKg: 0.8, points: 8, completed: false, streak: 0 }
];

// Initial default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'ac1', title: 'Eco-Scholar', description: 'Complete the carbon questionnaire.', badge: '📚', unlocked: false, requirement: 'Complete onboarding' },
  { id: 'ac2', title: 'Forest Guardian', description: 'Amass 100 Eco XP points.', badge: '🌲', unlocked: false, requirement: '100 XP' },
  { id: 'ac3', title: 'Green Commuter', description: 'Commute via active or transit travel.', badge: '🚲', unlocked: false, requirement: 'Transit/Bicycle commute' },
  { id: 'ac4', title: 'Plant Powered', description: 'Choose a vegetarian or vegan lifestyle.', badge: '🥗', unlocked: false, requirement: 'Veg/Vegan diet' },
  { id: 'ac5', title: 'Clean Power Adopter', description: 'Equip your home with solar or renewable electricity.', badge: '☀️', unlocked: false, requirement: 'Solar energy source' },
  { id: 'ac_negotiator', title: 'Eco-Negotiator', description: 'Defeat one opponent in the Prompt Arena.', badge: '🗣️', unlocked: false, requirement: 'Win 1 Prompt Battle' },
  { id: 'ac_diplomat', title: 'Climate Diplomat', description: 'Defeat all 4 stubborn carbon opponents.', badge: '🌐', unlocked: false, requirement: 'Defeat all 4 opponents' },
  { id: 'ac_master_persuader', title: 'Master Persuader', description: 'Win a Prompt Battle in exactly 1 turn.', badge: '🎯', unlocked: false, requirement: '1-turn battle victory' }
];

const DEFAULT_SETTINGS: AppSettings = {
  avatarEmoji: '🌱',
  assistantPersona: 'friendly',
  modelTemperature: 0.7,
  compactMode: false,
  reduceMotion: false,
  panelOpacity: 0.12,
  notifyHabits: true,
  notifyDigest: true,
  notifyAchievements: true,
  nvidiaApiKey: '',
  geminiApiKey: ''
};

export const INITIAL_PROFILE: UserProfile = {
  name: 'Eco Champion',
  onboarded: false,
  currentData: null,
  history: [],
  habits: DEFAULT_HABITS,
  achievements: DEFAULT_ACHIEVEMENTS,
  totalPoints: 0,
  streakCount: 0,
  lastCheckedDate: null,
  theme: 'forest',
  offsetTonnes: 0,
  promptWarsState: {
    completedOpponents: [],
    highScores: {},
    purchasedCards: []
  },
  settings: DEFAULT_SETTINGS
};

export const useProfileState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isBypassed, setIsBypassed] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Derive unique local storage key based on active user ID
  const userId = session?.user?.id || 'local_user';
  const storageKey = `carbaware_profile_${userId}`;

  // Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Initial State Load
  useEffect(() => {
    const savedProfile = localStorage.getItem(storageKey);
    
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile) as UserProfile;
        
        // Safety checks to ensure schema updates don't break storage
        if (!parsed.habits || parsed.habits.length === 0) parsed.habits = DEFAULT_HABITS;
        
        // Merge achievements to preserve unlock status while getting new ones
        const mergedAchievements = DEFAULT_ACHIEVEMENTS.map(def => {
          const matching = parsed.achievements?.find(a => a.id === def.id);
          return matching ? { ...def, unlocked: matching.unlocked, unlockedAt: matching.unlockedAt } : def;
        });
        parsed.achievements = mergedAchievements;
        
        if (parsed.offsetTonnes === undefined) parsed.offsetTonnes = 0;
        
        if (!parsed.promptWarsState) {
          parsed.promptWarsState = {
            completedOpponents: [],
            highScores: {},
            purchasedCards: []
          };
        }
        
        if (!parsed.settings) {
          parsed.settings = DEFAULT_SETTINGS;
        } else {
          // Merge defaults in case new settings keys are added
          parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
        }
        
        setProfile(parsed);
      } catch (err) {
        console.error("Error reading saved user profile, resetting...", err);
        setProfile(INITIAL_PROFILE);
      }
    } else {
      setProfile(INITIAL_PROFILE);
    }
  }, [storageKey]);

  // 2. Auto-save profile changes
  useEffect(() => {
    if (profile && profile !== INITIAL_PROFILE) {
      localStorage.setItem(storageKey, JSON.stringify(profile));
    }
  }, [profile, storageKey]);

  // 3. Onboarding Complete Handler
  const handleOnboardingComplete = (data: CarbonData) => {
    const result = calculateCarbonFootprint(data);
    const newHistoryEntry: HistoricalCalculation = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      totalEmissions: result.total,
      breakdown: {
        transport: result.transport,
        homeEnergy: result.homeEnergy,
        diet: result.diet,
        wasteShopping: result.wasteShopping
      }
    };

    setProfile(prev => {
      // Award Onboarding achievement
      const updatedAchievements = prev.achievements.map(ach => {
        if (ach.id === 'ac1') {
          return { ...ach, unlocked: true, unlockedAt: new Date().toLocaleDateString() };
        }
        return ach;
      });

      const updatedProfile = {
        ...prev,
        name: session?.user?.user_metadata?.full_name || prev.name,
        onboarded: true,
        currentData: data,
        history: [newHistoryEntry],
        achievements: updatedAchievements,
        totalPoints: prev.totalPoints + 30 // reward points for onboarding completion
      };

      // Run dynamic checks for other starting achievements
      return runAchievementScans(updatedProfile);
    });

    setActiveTab('dashboard');
  };

  // 4. Update settings configuration
  const handleUpdateSettings = (updates: {
    name?: string;
    theme: 'forest' | 'ocean' | 'solar';
    settings: AppSettings;
  }) => {
    setProfile(prev => ({
      ...prev,
      name: updates.name || prev.name,
      theme: updates.theme,
      settings: updates.settings
    }));
  };

  // 5. Reset Profile Data
  const handleResetData = () => {
    localStorage.removeItem(storageKey);
    setProfile(INITIAL_PROFILE);
    setActiveTab('dashboard');
  };

  // 6. Habits Toggle Checkbox Handler
  const handleToggleHabit = (habitId: string) => {
    setProfile(prev => {
      let pointsAwarded = 0;
      const updatedHabits = prev.habits.map(habit => {
        if (habit.id === habitId) {
          const completed = !habit.completed;
          pointsAwarded = completed ? habit.points : -habit.points;
          return {
            ...habit,
            completed,
            streak: completed ? habit.streak + 1 : Math.max(0, habit.streak - 1)
          };
        }
        return habit;
      });

      // Calculate streak updates
      const hasCompletedAny = updatedHabits.some(h => h.completed);
      const todayString = new Date().toLocaleDateString();
      let updatedStreak = prev.streakCount;

      if (hasCompletedAny && prev.lastCheckedDate !== todayString) {
        // If they did something today and hadn't checked in yet, increment streak
        updatedStreak = prev.streakCount + 1;
      }

      const updatedProfile = {
        ...prev,
        habits: updatedHabits,
        totalPoints: Math.max(0, prev.totalPoints + pointsAwarded),
        streakCount: updatedStreak,
        lastCheckedDate: todayString
      };

      return runAchievementScans(updatedProfile);
    });
  };

  // 7. Sandbox Apply Updates Handler
  const handleUpdateProfileData = (data: CarbonData) => {
    const result = calculateCarbonFootprint(data);
    const newHistoryEntry: HistoricalCalculation = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString() + ' (Simulated Apply)',
      totalEmissions: result.total,
      breakdown: {
        transport: result.transport,
        homeEnergy: result.homeEnergy,
        diet: result.diet,
        wasteShopping: result.wasteShopping
      }
    };

    setProfile(prev => {
      const updatedProfile = {
        ...prev,
        currentData: data,
        history: [...prev.history, newHistoryEntry]
      };
      return runAchievementScans(updatedProfile);
    });
    setActiveTab('dashboard');
  };

  // 8. Add Custom Habit Handler
  const handleAddHabit = (name: string, category: 'transport' | 'energy' | 'diet' | 'waste', co2SavedKg: number, points: number) => {
    setProfile(prev => {
      const updatedProfile = {
        ...prev,
        habits: [
          ...prev.habits,
          {
            id: `h_custom_${Date.now()}`,
            name,
            category,
            co2SavedKg,
            points,
            completed: false,
            streak: 0
          }
        ]
      };
      return runAchievementScans(updatedProfile);
    });
  };

  // 9. Update Carbon Offset Handler
  const handleUpdateOffset = (newOffset: number) => {
    setProfile(prev => {
      const updatedProfile = {
        ...prev,
        offsetTonnes: Math.max(0, Number(newOffset.toFixed(2)))
      };
      return runAchievementScans(updatedProfile);
    });
  };

  // 10. Update Points Handler
  const handleUpdatePoints = (pointsGained: number) => {
    setProfile(prev => {
      const updated = {
        ...prev,
        totalPoints: Math.max(0, prev.totalPoints + pointsGained)
      };
      return runAchievementScans(updated);
    });
  };

  // 11. Add Achievement Handler
  const handleAddAchievement = (achievementId: string) => {
    setProfile(prev => {
      const updatedAchievements = prev.achievements.map(ach => {
        if (ach.id === achievementId && !ach.unlocked) {
          return { ...ach, unlocked: true, unlockedAt: new Date().toLocaleDateString() };
        }
        return ach;
      });
      return {
        ...prev,
        achievements: updatedAchievements
      };
    });
  };

  // 12. Update Prompt Wars State Handler
  const handleUpdatePromptWarsState = (newState: PromptWarsState) => {
    setProfile(prev => ({
      ...prev,
      promptWarsState: newState
    }));
  };

  // 13. Purchase Offset Handler
  const handlePurchaseOffset = (tonnes: number, pointsCost: number) => {
    setProfile(prev => {
      if (prev.totalPoints < pointsCost) return prev;
      const updated = {
        ...prev,
        totalPoints: prev.totalPoints - pointsCost,
        offsetTonnes: Number((prev.offsetTonnes + tonnes).toFixed(2))
      };
      return runAchievementScans(updated);
    });
  };

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return {
    session,
    setSession,
    isBypassed,
    setIsBypassed,
    profile,
    setProfile,
    activeTab,
    setActiveTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    navigateToTab,
    handleOnboardingComplete,
    handleUpdateSettings,
    handleResetData,
    handleToggleHabit,
    handleUpdateProfileData,
    handleAddHabit,
    handleUpdateOffset,
    handleUpdatePoints,
    handleAddAchievement,
    handleUpdatePromptWarsState,
    handlePurchaseOffset
  };
};
