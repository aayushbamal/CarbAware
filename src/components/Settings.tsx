import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, Check } from 'lucide-react';
import type { UserProfile } from '../types';

interface SettingsProps {
  profile: UserProfile;
  onUpdateSettings: (settings: { theme: 'forest' | 'ocean' | 'solar' }) => void;
  onResetData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, onUpdateSettings, onResetData }) => {
  const [theme, setTheme] = useState<'forest' | 'ocean' | 'solar'>(profile.theme);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateSettings({
      theme
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Platform Settings</h1>
        <p style={{ color: 'var(--text-sub)' }}>Manage your design configurations and database profiles.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Theme Settings Panel */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>🎨</span>
            <h3>Visual Customization</h3>
          </div>

          <div className="settings-group mb-6">
            <label className="settings-label">Color Theme</label>
            <select 
              className="settings-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
            >
              <option value="forest">Forest Green (Eco Dark)</option>
              <option value="ocean">Ocean Breeze (Water Conservation Dark)</option>
              <option value="solar">Solar Energy (Renewable Glow Dark)</option>
            </select>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleSave}>
            {saved ? (
              <>
                Configurations Saved <Check size={16} />
              </>
            ) : (
              'Save Configurations'
            )}
          </button>
        </div>



        {/* Danger Zone Factory Reset */}
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
            <h3 style={{ color: '#ffffff' }}>Danger Zone</h3>
          </div>

          <p className="info-text mb-6">
            Resetting your data removes all calculated history files, habits checklists, streak counts, points multipliers, and local variables. This is a irreversible action.
          </p>

          {!showConfirm ? (
            <button 
              type="button" 
              className="btn" 
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
              onClick={() => setShowConfirm(true)}
            >
              <RotateCcw size={16} /> Reset Profile Data
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px' }}>
              <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600 }}>
                Are you absolutely sure? This will wipe your dashboard stats and restart the onboarding wizard.
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button 
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
