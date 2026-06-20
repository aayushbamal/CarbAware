import React, { useState } from 'react';
import { 
  Check, Flame, Award, Lock
} from 'lucide-react';
import type { UserProfile } from '../types';

interface HabitsTrackerProps {
  profile: UserProfile;
  onToggleHabit: (habitId: string) => void;
  onAddHabit: (name: string, category: 'transport' | 'energy' | 'diet' | 'waste', co2SavedKg: number, points: number) => void;
}

export const HabitsTracker: React.FC<HabitsTrackerProps> = ({ profile, onToggleHabit, onAddHabit }) => {
  const { habits, achievements, totalPoints, streakCount } = profile;

  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<'transport' | 'energy' | 'diet' | 'waste'>('energy');
  const [customCo2, setCustomCo2] = useState<number>(1.5);
  const [customPoints, setCustomPoints] = useState<number>(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddHabit(
      customName.trim(),
      customCategory,
      Math.max(0, Number(Number(customCo2).toFixed(1))),
      Math.max(0, Math.round(customPoints))
    );
    setCustomName('');
  };

  const co2SavedToday = habits
    .filter(h => h.completed)
    .reduce((sum, h) => sum + h.co2SavedKg, 0);

  return (
    <div className="main-content">
      {/* Header section with streak highlights */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Eco Action Hub</h1>
          <p style={{ color: 'var(--text-sub)' }}>Complete daily simple habits to earn points and scale down your carbon impact.</p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Flame style={{ color: '#ff5a00' }} size={24} className="pulse-red" aria-hidden="true" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>STREAK</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>{streakCount} Days</div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award style={{ color: 'var(--primary)' }} size={24} aria-hidden="true" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>TOTAL SCORE</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>{totalPoints} XP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Habits Checklist */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Daily Eco Actions</h3>
            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
              Saved Today: {co2SavedToday.toFixed(1)} kg CO₂e
            </span>
          </div>

          <div className="habits-grid">
            {habits.map((habit) => (
              <div 
                key={habit.id} 
                className={`habit-row ${habit.completed ? 'completed' : ''}`}
              >
                <div className="habit-left">
                  <button 
                    id={`habit-checkbox-${habit.id}`}
                    data-testid={`habit-checkbox-${habit.id}`}
                    type="button" 
                    className="habit-checkbox"
                    onClick={() => onToggleHabit(habit.id)}
                    aria-label={`Mark "${habit.name}" as ${habit.completed ? 'incomplete' : 'complete'}`}
                  >
                    <Check size={14} style={{ strokeWidth: 3 }} aria-hidden="true" />
                  </button>
                  
                  <div className="habit-details">
                    <span className="habit-name">{habit.name}</span>
                    <div className="habit-stats">
                      <span className="habit-points">+{habit.points} XP</span>
                      <span>•</span>
                      <span className="habit-savings">-{habit.co2SavedKg} kg CO₂e</span>
                    </div>
                  </div>
                </div>

                {habit.streak > 0 && (
                  <div className="habit-streak">
                    <Flame size={14} aria-hidden="true" />
                    <span>{habit.streak}d</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Custom Action Creator Form */}
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px' }}>Create Custom Action</h4>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="grid-2" style={{ gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="custom-habit-name" style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Action Title</label>
                  <input
                    id="custom-habit-name"
                    data-testid="custom-habit-name"
                    type="text"
                    className="styled-input"
                    placeholder="e.g. Unplug unused charger"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    style={{ height: '36px', fontSize: '13px', paddingLeft: '10px' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="custom-habit-category" style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Category</label>
                  <select
                    id="custom-habit-category"
                    data-testid="custom-habit-category"
                    className="settings-select"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as 'transport' | 'energy' | 'diet' | 'waste')}
                    style={{ height: '36px', fontSize: '13px', padding: '0 8px' }}
                  >
                    <option value="energy">Home Energy 💡</option>
                    <option value="transport">Transportation 🚗</option>
                    <option value="diet">Diet & Meals 🥗</option>
                    <option value="waste">Waste & Recycling ♻️</option>
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="custom-habit-co2" style={{ fontSize: '11px', color: 'var(--text-sub)' }}>CO₂ Savings (kg)</label>
                  <input
                    id="custom-habit-co2"
                    data-testid="custom-habit-co2"
                    type="number"
                    step="0.1"
                    min="0"
                    className="styled-input"
                    value={customCo2}
                    onChange={(e) => setCustomCo2(parseFloat(e.target.value) || 0)}
                    style={{ height: '36px', fontSize: '13px', paddingLeft: '10px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="custom-habit-points" style={{ fontSize: '11px', color: 'var(--text-sub)' }}>XP Award</label>
                  <input
                    id="custom-habit-points"
                    data-testid="custom-habit-points"
                    type="number"
                    min="1"
                    className="styled-input"
                    value={customPoints}
                    onChange={(e) => setCustomPoints(parseInt(e.target.value) || 0)}
                    style={{ height: '36px', fontSize: '13px', paddingLeft: '10px' }}
                  />
                </div>
              </div>

              <button
                id="custom-habit-add-btn"
                data-testid="custom-habit-add-btn"
                type="submit"
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '12px', marginTop: '4px', justifyContent: 'center' }}
                disabled={!customName.trim()}
              >
                Add Action Checkbox
              </button>
            </form>
          </div>
        </div>

        {/* Gamified Achievements Panel */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Award size={20} style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <h3>Achievements & Badges</h3>
          </div>

          <div className="achievements-grid">
            {achievements.map((badge) => (
              <div 
                key={badge.id} 
                className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
              >
                <span className="badge-icon" role="img" aria-label={badge.title}>
                  {badge.badge}
                </span>
                <span className="badge-title">{badge.title}</span>
                <span className="badge-desc">{badge.description}</span>
                {badge.unlocked ? (
                  <span className="badge-unlocked-at">
                    Unlocked!
                  </span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '9px', color: 'var(--text-muted)' }}>
                    <Lock size={10} aria-hidden="true" />
                    <span>{badge.requirement}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
