import { useEffect } from 'react';
import { 
  LayoutGrid, Zap, Award, Settings as SettingsIcon, 
  Leaf, Menu, LogOut, Bot, Sparkles, Globe, ShoppingBag
} from 'lucide-react';
import { OnboardingQuiz } from './components/OnboardingQuiz';
import { Dashboard } from './components/Dashboard';
import { HabitsTracker } from './components/HabitsTracker';
import { Sandbox } from './components/Sandbox';
import { Settings } from './components/Settings';
import { Ecodroid } from './components/Ecodroid';
import { Login } from './components/Login';
import { PromptWars } from './components/PromptWars';
import { OffsetProjects } from './components/OffsetProjects';
import { Marketplace } from './components/Marketplace';
import { supabase } from './utils/supabaseClient';
import { useProfileState, INITIAL_PROFILE } from './hooks/useProfileState';

function App() {
  const {
    session,
    isBypassed,
    setIsBypassed,
    profile,
    setProfile,
    activeTab,
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
  } = useProfileState();

  // 1. Theme Application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);

  // 2. Dynamic opacity, compact mode, and reduced motion custom style sheet
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
                id="nav-promptwars"
                data-testid="nav-promptwars"
                className={`nav-button ${activeTab === 'promptwars' ? 'active' : ''}`}
                onClick={() => navigateToTab('promptwars')}
                disabled={!profile.onboarded}
              >
                <Sparkles size={18} aria-hidden="true" /> Prompt Arena
              </button>
            </li>

            <li className="nav-item">
              <button 
                id="nav-offsetprojects"
                data-testid="nav-offsetprojects"
                className={`nav-button ${activeTab === 'offsetprojects' ? 'active' : ''}`}
                onClick={() => navigateToTab('offsetprojects')}
                disabled={!profile.onboarded}
              >
                <Globe size={18} aria-hidden="true" /> Offset Center
              </button>
            </li>

            <li className="nav-item">
              <button 
                id="nav-marketplace"
                data-testid="nav-marketplace"
                className={`nav-button ${activeTab === 'marketplace' ? 'active' : ''}`}
                onClick={() => navigateToTab('marketplace')}
                disabled={!profile.onboarded}
              >
                <ShoppingBag size={18} aria-hidden="true" /> Eco Store
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
                onUpdateOffset={handleUpdateOffset}
              />
            )}
            {activeTab === 'habits' && (
              <HabitsTracker 
                profile={profile} 
                onToggleHabit={handleToggleHabit} 
                onAddHabit={handleAddHabit}
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

            {activeTab === 'promptwars' && (
              <PromptWars 
                profile={profile}
                onUpdatePoints={handleUpdatePoints}
                onAddAchievement={handleAddAchievement}
                onUpdatePromptWarsState={handleUpdatePromptWarsState}
              />
            )}

            {activeTab === 'offsetprojects' && (
              <OffsetProjects 
                profile={profile}
                onPurchaseOffset={handlePurchaseOffset}
              />
            )}

            {activeTab === 'marketplace' && (
              <Marketplace 
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
