import { useState, useEffect } from 'react';
import { 
  LayoutGrid, Zap, Award, Settings as SettingsIcon, 
  Leaf, Menu, LogOut, Bot
} from 'lucide-react';
import { OnboardingQuiz } from './components/OnboardingQuiz';
import { Dashboard } from './components/Dashboard';
import { HabitsTracker } from './components/HabitsTracker';
import { Sandbox } from './components/Sandbox';
import { Settings } from './components/Settings';
import { Ecodroid } from './components/Ecodroid';
import { Login } from './components/Login';
import type { UserProfile, CarbonData, DailyHabit, Achievement, HistoricalCalculation, AppSettings } from './types';
import { calculateCarbonFootprint } from './utils/carbonCalculator';
import { runAchievementScans } from './utils/achievementEngine';
import { supabase } from './utils/supabaseClient';
import type { Session } from '@supabase/supabase-js';

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
  { id: 'ac3', title: 'Active Commuter', description: 'Commute via active or transit travel.', badge: '🚲', unlocked: false, requirement: 'Transit/Bicycle commute' },
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
  notifyAchievements: true
};

const INITIAL_PROFILE: UserProfile = {
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

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isBypassed, setIsBypassed] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // 3. Theme Application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);

  // Dynamic opacity, compact mode, and reduced motion custom style sheet
  useEffect(() => {
    const opacity = profile.settings?.panelOpacity !== undefined ? profile.settings.panelOpacity : 0.12;
    const isCompact = profile.settings?.compactMode || false;
    const isReducedMotion = profile.settings?.reduceMotion || false;

    let styleEl = document.getElementById('dynamic-theme-overrides');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-theme-overrides';
      document.head.appendChild(styleEl);
    }
    
    styleEl.innerHTML = `
      .glass-card {
        background: rgba(13, 22, 18, ${opacity}) !important;
        transition: var(--transition-smooth);
      }
      [data-theme="ocean"] .glass-card {
        background: rgba(11, 21, 30, ${opacity}) !important;
      }
      [data-theme="solar"] .glass-card {
        background: rgba(27, 20, 10, ${opacity}) !important;
      }
      ${isCompact ? `
        .glass-card, .opponent-card, .card-item, .habits-container, .sandbox-sliders-container {
          padding: 12px 16px !important;
        }
        .main-content {
          padding: 16px !important;
        }
        .grid-2 {
          gap: 16px !important;
        }
      ` : ''}
      ${isReducedMotion ? `
        *, *::before, *::after {
          animation-delay: -1ms !important;
          animation-duration: -1ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0s !important;
          scroll-behavior: auto !important;
        }
      ` : ''}
    `;
  }, [profile.settings, profile.theme]);

  // 4. Onboarding Complete Handler
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

  // 5. Update settings configuration
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

  // 6. Reset Profile Data
  const handleResetData = () => {
    localStorage.removeItem('carbaware_profile');
    setProfile(INITIAL_PROFILE);
    setActiveTab('dashboard');
  };

  // State update handlers

  // 7. Habits Toggle Checkbox Handler
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

  // 8. Sandbox Apply Updates Handler
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





  // Achievements scanning handled by imported runAchievementScans utility function

  // Navigation action handlers
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  if (!session && !isBypassed) {
    return <Login onBypassAuth={() => setIsBypassed(true)} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div>
          <div className="logo-section">
            <Leaf className="logo-icon" size={28} aria-hidden="true" />
            <span className="logo-text">CarbAware</span>
          </div>

          <nav className="nav-links">
            <li className="nav-item">
              <button 
                id="nav-dashboard"
                data-testid="nav-dashboard"
                className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigateToTab('dashboard')}
                disabled={!profile.onboarded}
              >
                <LayoutGrid size={18} aria-hidden="true" /> Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                id="nav-habits"
                data-testid="nav-habits"
                className={`nav-button ${activeTab === 'habits' ? 'active' : ''}`}
                onClick={() => navigateToTab('habits')}
                disabled={!profile.onboarded}
              >
                <Award size={18} aria-hidden="true" /> Daily Actions
              </button>
            </li>
            <li className="nav-item">
              <button 
                id="nav-sandbox"
                data-testid="nav-sandbox"
                className={`nav-button ${activeTab === 'sandbox' ? 'active' : ''}`}
                onClick={() => navigateToTab('sandbox')}
                disabled={!profile.onboarded}
              >
                <Zap size={18} aria-hidden="true" /> Sandbox Sim
              </button>
            </li>
            <li className="nav-item">
              <button 
                id="nav-ecodroid"
                data-testid="nav-ecodroid"
                className={`nav-button ${activeTab === 'ecodroid' ? 'active' : ''}`}
                onClick={() => navigateToTab('ecodroid')}
                disabled={!profile.onboarded}
              >
                <Bot size={18} aria-hidden="true" /> Ecodroid AI
              </button>
            </li>

            <li className="nav-item">
              <button 
                id="nav-settings"
                data-testid="nav-settings"
                className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => navigateToTab('settings')}
              >
                <SettingsIcon size={18} aria-hidden="true" /> Settings
              </button>
            </li>
          </nav>
        </div>

        {(profile.onboarded || session) && (
          <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profile.onboarded && (
              <div className="user-summary-card">
                <div className="avatar-circle" style={{ fontSize: '18px' }}>
                  {profile.settings?.avatarEmoji || '🌱'}
                </div>
                <div className="user-info">
                  <span className="user-name">{profile.name}</span>
                  <span className="user-xp">{profile.totalPoints} XP</span>
                </div>
              </div>
            )}
            
            {session && (
              <button 
                id="nav-logout"
                data-testid="nav-logout"
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '13px', padding: '8px 12px', justifyContent: 'center', marginTop: '8px' }}
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut size={14} style={{ marginRight: '6px' }} aria-hidden="true" /> Sign Out
              </button>
            )}
            {!session && isBypassed && (
              <button 
                id="nav-logout"
                data-testid="nav-logout"
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '13px', padding: '8px 12px', justifyContent: 'center', marginTop: '8px' }}
                onClick={() => {
                  setIsBypassed(false);
                  setProfile(INITIAL_PROFILE);
                }}
              >
                <LogOut size={14} style={{ marginRight: '6px' }} aria-hidden="true" /> Exit Local Mode
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main Content view router */}
      <main style={{ minWidth: 0, width: '100%' }}>
        {/* Mobile menu bar support */}
        <div 
          style={{ 
            display: 'none', 
            padding: '12px 18px', 
            background: 'rgba(8, 14, 11, 0.95)',
            borderBottom: '1px solid var(--border-color)',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          className="mobile-header-bar"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Leaf className="logo-icon" size={22} aria-hidden="true" />
            <span className="logo-text" style={{ fontSize: '18px' }}>CarbAware</span>
          </div>
          <button 
            type="button" 
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation menu"
          >
            <Menu size={24} aria-hidden="true" />
          </button>
        </div>

        {!profile.onboarded ? (
          <div style={{ padding: '20px' }}>
            <OnboardingQuiz onComplete={handleOnboardingComplete} />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                profile={profile} 
                onNavigateToHabits={() => navigateToTab('habits')} 
              />
            )}
            {activeTab === 'habits' && (
              <HabitsTracker 
                profile={profile} 
                onToggleHabit={handleToggleHabit} 
              />
            )}
            {activeTab === 'sandbox' && (
              <Sandbox 
                key={profile.currentData ? 'active' : 'inactive'}
                profile={profile} 
                onUpdateProfileData={handleUpdateProfileData} 
              />
            )}
            {activeTab === 'ecodroid' && (
              <Ecodroid 
                profile={profile}
              />
            )}

            {activeTab === 'settings' && (
              <Settings 
                profile={profile}
                onUpdateSettings={handleUpdateSettings}
                onResetData={handleResetData}
              />
            )}
          </>
        )}
      </main>

      {/* Media query styling support injected in CSS style tags for quick execution layout override */}
      <style>{`
        @media (max-width: 900px) {
          .mobile-header-bar {
            display: flex !important;
          }
          .sidebar {
            display: none !important;
          }
          .sidebar.open {
            display: flex !important;
            position: fixed;
            top: 50px;
            left: 0;
            width: 100%;
            height: calc(100vh - 50px);
            background: #070c0a;
            border-bottom: 1px solid var(--border-color);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
