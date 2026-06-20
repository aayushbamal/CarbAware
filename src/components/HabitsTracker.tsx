import React from 'react';
import { 
  Check, Flame, Award, Lock
} from 'lucide-react';
import type { UserProfile } from '../types';

interface HabitsTrackerProps {
  profile: UserProfile;
  onToggleHabit: (habitId: string) => void;
}

export const HabitsTracker: React.FC<HabitsTrackerProps> = ({ profile, onToggleHabit }) => {
  const { habits, achievements, totalPoints, streakCount } = profile;

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
