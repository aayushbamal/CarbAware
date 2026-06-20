import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, Check, User, Bot, Layout, Bell, Download } from 'lucide-react';
import type { UserProfile, AppSettings } from '../types';

interface SettingsProps {
  profile: UserProfile;
  onUpdateSettings: (updates: {
    name?: string;
    theme: 'forest' | 'ocean' | 'solar';
    settings: AppSettings;
  }) => void;
  onResetData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, onUpdateSettings, onResetData }) => {
  // Local states initialized with profile settings or sensible defaults
  const [theme, setTheme] = useState<'forest' | 'ocean' | 'solar'>(profile.theme);
  const [displayName, setDisplayName] = useState<string>(profile.name || '');
  const [avatarEmoji, setAvatarEmoji] = useState<string>(profile.settings?.avatarEmoji || '🌱');
  const [persona, setPersona] = useState<AppSettings['assistantPersona']>(profile.settings?.assistantPersona || 'friendly');
  const [temperature, setTemperature] = useState<number>(profile.settings?.modelTemperature || 0.7);
  const [compactMode, setCompactMode] = useState<boolean>(profile.settings?.compactMode || false);
  const [reduceMotion, setReduceMotion] = useState<boolean>(profile.settings?.reduceMotion || false);
  const [panelOpacity, setPanelOpacity] = useState<number>(profile.settings?.panelOpacity || 0.12);
  const [notifyHabits, setNotifyHabits] = useState<boolean>(profile.settings?.notifyHabits || true);
  const [notifyDigest, setNotifyDigest] = useState<boolean>(profile.settings?.notifyDigest || true);
  const [notifyAchievements, setNotifyAchievements] = useState<boolean>(profile.settings?.notifyAchievements || true);
  const [nvidiaApiKey, setNvidiaApiKey] = useState<string>(profile.settings?.nvidiaApiKey || '');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(profile.settings?.geminiApiKey || '');

  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateSettings({
      name: displayName,
      theme: theme,
      settings: {
        avatarEmoji,
        assistantPersona: persona,
        modelTemperature: temperature,
        compactMode,
        reduceMotion,
        panelOpacity,
        notifyHabits,
        notifyDigest,
        notifyAchievements,
        nvidiaApiKey,
        geminiApiKey
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Export profile data as JSON
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `carbaware_profile_${profile.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Platform Settings</h1>
        <p style={{ color: 'var(--text-sub)' }}>Customize your user profile, AI Ecodroid persona, notifications, and application design.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
        
        {/* Profile Details Panel */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <User size={20} style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <h3>Profile Customization</h3>
          </div>

          <div className="grid-2" style={{ gap: '20px' }}>
            <div className="settings-group">
              <label htmlFor="settings-display-name" className="settings-label">Display Name</label>
              <input 
                id="settings-display-name"
                data-testid="settings-display-name"
                type="text" 
                className="styled-input" 
                style={{ width: '100%', height: '40px', paddingLeft: '14px' }}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="settings-group">
              <label htmlFor="settings-avatar-emoji" className="settings-label">Profile Avatar Emoji</label>
              <select 
                id="settings-avatar-emoji"
                data-testid="settings-avatar-emoji"
                className="settings-select"
                value={avatarEmoji}
                onChange={(e) => setAvatarEmoji(e.target.value)}
              >
                <option value="🌱">🌱 Sprout</option>
                <option value="🌲">🌲 Pine Tree</option>
                <option value="🚲">🚲 Bicycle</option>
                <option value="☀️">☀️ Solar Sun</option>
                <option value="🥗">🥗 Salad Bowl</option>
                <option value="🌎">🌎 Earth Globe</option>
                <option value="⚡">⚡ Clean Energy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ecodroid AI Coach Settings */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Bot size={20} style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <h3>Ecodroid AI Preferences</h3>
          </div>

          <div className="grid-2" style={{ gap: '20px' }}>
            <div className="settings-group">
              <label htmlFor="settings-assistant-persona" className="settings-label">Assistant Persona</label>
              <select 
                id="settings-assistant-persona"
                data-testid="settings-assistant-persona"
                className="settings-select"
                value={persona}
                onChange={(e) => setPersona(e.target.value as AppSettings['assistantPersona'])}
              >
                <option value="friendly">Friendly Assistant (Standard) 🤖</option>
                <option value="strict">Strict Environmentalist (Raw Numbers) 🧬</option>
                <option value="optimist">Eco-Optimist (Hopeful Motivator) ☀️</option>
                <option value="general">Climate Commander (Tactical Action) 🎖️</option>
              </select>
            </div>

            <div className="settings-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="settings-model-temperature" className="settings-label" style={{ margin: 0 }}>Model Temperature (Creativity)</label>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>{temperature}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Precise</span>
                <input 
                  id="settings-model-temperature"
                  data-testid="settings-model-temperature"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  style={{ flexGrow: 1 }}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Creative</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px' }}>AI API Keys Configuration (Optional override)</h4>
            <div className="grid-2" style={{ gap: '20px' }}>
              <div className="settings-group">
                <label htmlFor="settings-nvidia-key" className="settings-label">NVIDIA NIM API Key</label>
                <input 
                  id="settings-nvidia-key"
                  data-testid="settings-nvidia-key"
                  type="password" 
                  className="styled-input" 
                  style={{ width: '100%', height: '40px', paddingLeft: '14px' }}
                  placeholder="nvapi-..."
                  value={nvidiaApiKey}
                  onChange={(e) => setNvidiaApiKey(e.target.value)}
                />
              </div>

              <div className="settings-group">
                <label htmlFor="settings-gemini-key" className="settings-label">Gemini Developer API Key</label>
                <input 
                  id="settings-gemini-key"
                  data-testid="settings-gemini-key"
                  type="password" 
                  className="styled-input" 
                  style={{ width: '100%', height: '40px', paddingLeft: '14px' }}
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Customization & Glassmorphism Panel */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Layout size={20} style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <h3>Visual & Theme Settings</h3>
          </div>

          <div className="grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
            <div className="settings-group">
              <label htmlFor="settings-color-theme" className="settings-label">Color Theme</label>
              <select 
                id="settings-color-theme"
                data-testid="settings-color-theme"
                className="settings-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'forest' | 'ocean' | 'solar')}
              >
                <option value="forest">Forest Green (Eco Dark)</option>
                <option value="ocean">Ocean Breeze (Water Conservation)</option>
                <option value="solar">Solar Energy (Renewable Glow)</option>
              </select>
            </div>

            <div className="settings-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="settings-panel-opacity" className="settings-label" style={{ margin: 0 }}>Glass Panel Opacity</label>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>{(panelOpacity * 100).toFixed(0)}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Translucent</span>
                <input 
                  id="settings-panel-opacity"
                  data-testid="settings-panel-opacity"
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.01"
                  style={{ flexGrow: 1 }}
                  value={panelOpacity}
                  onChange={(e) => setPanelOpacity(parseFloat(e.target.value))}
                  aria-describedby="settings-opacity-desc"
                />
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Opaque</span>
              </div>
              <span id="settings-opacity-desc" style={{ fontSize: '10px', color: 'var(--text-sub)', marginTop: '4px', display: 'block' }}>
                Increase opacity up to 95% for solid, high-contrast readability.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <label htmlFor="settings-compact-mode" className="option-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px' }}>
              <input 
                id="settings-compact-mode"
                data-testid="settings-compact-mode"
                type="checkbox" 
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                <strong>Compact Interface Mode</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Reduces card paddings.</span>
              </div>
            </label>

            <label htmlFor="settings-reduce-motion" className="option-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px' }}>
              <input 
                id="settings-reduce-motion"
                data-testid="settings-reduce-motion"
                type="checkbox" 
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                <strong>Reduce Motion</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Disables sliding micro-animations.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Notifications preferences */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Bell size={20} style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <h3>Notification Preferences</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <label htmlFor="settings-notify-habits" className="option-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px' }}>
              <input 
                id="settings-notify-habits"
                data-testid="settings-notify-habits"
                type="checkbox" 
                checked={notifyHabits}
                onChange={(e) => setNotifyHabits(e.target.checked)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                <strong>Habit Reminders</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Alert me to log daily actions.</span>
              </div>
            </label>

            <label htmlFor="settings-notify-digest" className="option-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px' }}>
              <input 
                id="settings-notify-digest"
                data-testid="settings-notify-digest"
                type="checkbox" 
                checked={notifyDigest}
                onChange={(e) => setNotifyDigest(e.target.checked)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                <strong>Weekly Digest Reports</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Send footprint savings summary.</span>
              </div>
            </label>

            <label htmlFor="settings-notify-achievements" className="option-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px' }}>
              <input 
                id="settings-notify-achievements"
                data-testid="settings-notify-achievements"
                type="checkbox" 
                checked={notifyAchievements}
                onChange={(e) => setNotifyAchievements(e.target.checked)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                <strong>Milestone Awards</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Notify on unlocked achievements.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Options Bar */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button 
            id="settings-export-btn"
            data-testid="settings-export-btn"
            type="button" 
            className="btn btn-secondary" 
            onClick={handleExportData} 
            aria-label="Export profile data as JSON"
          >
            <Download size={16} aria-hidden="true" /> Export Profile Data (JSON)
          </button>
          <button 
            id="settings-save-btn"
            data-testid="settings-save-btn"
            type="button" 
            className="btn btn-primary" 
            onClick={handleSave} 
            aria-label="Save configurations"
          >
            {saved ? (
              <>
                Configurations Saved <Check size={16} aria-hidden="true" />
              </>
            ) : (
              'Save Configurations'
            )}
          </button>
        </div>

        {/* Danger Zone Factory Reset */}
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.25)', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--danger)' }} aria-hidden="true" />
            <h3 style={{ color: '#ffffff' }}>Danger Zone</h3>
          </div>

          <p className="info-text mb-6">
            Resetting your data removes all calculated history files, habits checklists, streak counts, points multipliers, and local variables. This is a irreversible action.
          </p>

          {!showConfirm ? (
            <button 
              id="settings-reset-btn"
              data-testid="settings-reset-btn"
              type="button" 
              className="btn" 
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
              onClick={() => setShowConfirm(true)}
              aria-label="Reset profile data"
            >
              <RotateCcw size={16} aria-hidden="true" /> Reset Profile Data
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px' }}>
              <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600 }}>
                Are you absolutely sure? This will wipe your dashboard stats and restart the onboarding wizard.
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  id="settings-reset-cancel-btn"
                  data-testid="settings-reset-cancel-btn"
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  id="settings-reset-confirm-btn"
                  data-testid="settings-reset-confirm-btn"
                  type="button" 
                  className="btn" 
                  style={{ background: 'var(--danger)', color: '#ffffff', border: 'none' }}
                  onClick={() => {
                    onResetData();
                    setShowConfirm(false);
                  }}
                >
                  Yes, Wipe Everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
