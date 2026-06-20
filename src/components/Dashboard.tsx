import React from 'react';
import { 
  Award, Zap, Car, Utensils, ShoppingBag, 
  Flame, TrendingDown, Target, Info, Globe
} from 'lucide-react';
import type { UserProfile } from '../types';
import { CARBON_AVERAGES, calculateCarbonFootprint } from '../utils/carbonCalculator';

interface DashboardProps {
  profile: UserProfile;
  onNavigateToHabits: () => void;
  onUpdateOffset: (newOffset: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onNavigateToHabits, onUpdateOffset }) => {
  const currentData = profile.currentData;

  if (!currentData) {
    return (
      <div className="glass-card text-center" style={{ padding: '40px' }}>
        <p>No footprint data available. Please complete onboarding first.</p>
      </div>
    );
  }

  const breakdown = calculateCarbonFootprint(currentData);
  const offset = profile.offsetTonnes || 0;
  const netEmissions = Math.max(0, Number((breakdown.total - offset).toFixed(2)));
  
  // Calculations for donut progress
  // Let's assume a "green cap" scale where 15 tonnes is 100% of the circle,
  // and we try to get it down to 2.0 (target) or 0.
  const cap = 15;
  const percentage = Math.min(100, Math.round((netEmissions / cap) * 100));
  const strokeDashOffset = 440 - (440 * percentage) / 100; // 2 * pi * r (r=70) -> 440

  // Category values to render bars
  const maxCategoryValue = Math.max(
    breakdown.transport, 
    breakdown.homeEnergy, 
    breakdown.diet, 
    breakdown.wasteShopping, 
    1.0
  );

  const getBarHeightPercent = (val: number) => {
    return `${(val / maxCategoryValue) * 80 + 10}%`; // at least 10% height, max 90%
  };

  const getEcoAdvice = (val: number) => {
    if (val === 0) {
      return { text: "Congratulations! You have reached Net Zero carbon footprint! Your lifestyle is fully offset.", color: 'var(--primary)' };
    } else if (val <= CARBON_AVERAGES.target) {
      return { text: "Outstanding! Your net emissions are within the safe climate target threshold (2.0t CO₂e). Keep maintaining this green lifestyle!", color: 'var(--primary)' };
    } else if (val <= CARBON_AVERAGES.global) {
      return { text: "Good job! Your net emissions are below the global average, but there is still room to optimize or purchase offsets to hit Net Zero.", color: 'var(--secondary)' };
    } else {
      return { text: "Warning: Your net emissions are above the global average. Consider commuting by transit, reducing household energy, or purchasing carbon offsets.", color: '#ff6b6b' };
    }
  };

  const advice = getEcoAdvice(netEmissions);

  return (
    <div className="main-content">
      {/* Overview stats header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Welcome Back, {profile.name}!</h1>
          <p style={{ color: 'var(--text-sub)' }}>Here is your real-time carbon emissions analysis and action summary.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award style={{ color: '#ff8b3d' }} size={24} aria-hidden="true" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>ECO POINTS</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>{profile.totalPoints} XP</div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingDown style={{ color: 'var(--primary)' }} size={24} aria-hidden="true" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>DAILY STREAK</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>{profile.streakCount} days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Row: Circular Progress, Category Breakdown, Advice */}
      <div className="metrics-row">
        {/* Core Footprint Progress */}
        <div className="glass-card score-circle-wrapper">
          <h3 style={{ marginBottom: '20px' }}>Your Net Footprint</h3>
          <div className="donut-chart-container">
            <svg width="180" height="180" className="donut-svg">
              <circle cx="90" cy="90" r="70" className="donut-ring" />
              <circle 
                cx="90" 
                cy="90" 
                r="70" 
                className="donut-segment"
                strokeDasharray="440"
                strokeDashoffset={strokeDashOffset}
                style={{ 
                  stroke: netEmissions === 0 ? 'var(--primary)' : netEmissions <= 2.0 ? 'var(--primary)' : netEmissions <= 5.0 ? 'var(--secondary)' : '#ef4444'
                }} 
                role="progressbar"
                aria-valuenow={netEmissions}
                aria-valuemin={0}
                aria-valuemax={15}
                aria-label="Net Carbon Footprint Progress"
              />
            </svg>
            <div className="donut-inner-text">
              <span className="donut-value">{netEmissions}</span>
              <span className="donut-unit">net tonnes CO₂e</span>
            </div>
          </div>
          {offset > 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '4px' }}>
              Base: {breakdown.total}t | Offset: -{offset}t
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-sub)', marginTop: '8px' }}>
              <Target size={14} style={{ color: 'var(--primary)' }} aria-hidden="true" />
              <span>Target threshold: 2.0 tonnes</span>
            </div>
          )}
        </div>

        {/* Custom SVG Bar Chart Breakdown */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Category Breakdown</h3>
          <div className="chart-container">
            <div className="chart-bar-wrapper">
              <span className="chart-bar-value" style={{ color: '#3b82f6' }}>{breakdown.transport}</span>
              <div className="chart-bar bar-transport" style={{ height: getBarHeightPercent(breakdown.transport) }} />
              <span className="chart-bar-label"><Car size={12} style={{ marginRight: '4px' }} aria-hidden="true" />Transit</span>
            </div>
            
            <div className="chart-bar-wrapper">
              <span className="chart-bar-value" style={{ color: '#f59e0b' }}>{breakdown.homeEnergy}</span>
              <div className="chart-bar bar-home" style={{ height: getBarHeightPercent(breakdown.homeEnergy) }} />
              <span className="chart-bar-label"><Flame size={12} style={{ marginRight: '4px' }} aria-hidden="true" />Energy</span>
            </div>

            <div className="chart-bar-wrapper">
              <span className="chart-bar-value" style={{ color: '#10b981' }}>{breakdown.diet}</span>
              <div className="chart-bar bar-diet" style={{ height: getBarHeightPercent(breakdown.diet) }} />
              <span className="chart-bar-label"><Utensils size={12} style={{ marginRight: '4px' }} aria-hidden="true" />Diet</span>
            </div>

            <div className="chart-bar-wrapper">
              <span className="chart-bar-value" style={{ color: '#a855f7' }}>{breakdown.wasteShopping}</span>
              <div className="chart-bar bar-waste" style={{ height: getBarHeightPercent(breakdown.wasteShopping) }} />
              <span className="chart-bar-label"><ShoppingBag size={12} style={{ marginRight: '4px' }} aria-hidden="true" />Waste</span>
            </div>
          </div>
        </div>

        {/* Global Reference Index & Comparison */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '12px' }}>How You Compare</h3>
            <p className="info-text mb-4">Average annual carbon emissions per capita in key regions:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span>India Average</span>
                <span style={{ fontWeight: 600 }}>{CARBON_AVERAGES.india} t</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span>Global Average</span>
                <span style={{ fontWeight: 600 }}>{CARBON_AVERAGES.global} t</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span>Europe Average</span>
                <span style={{ fontWeight: 600 }}>{CARBON_AVERAGES.europe} t</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span>USA Average</span>
                <span style={{ fontWeight: 600 }}>{CARBON_AVERAGES.usa} t</span>
              </div>
            </div>
          </div>

          <div 
            style={{ 
              marginTop: '16px', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              background: 'rgba(255, 255, 255, 0.02)',
              borderLeft: `4px solid ${advice.color}`,
              fontSize: '13px'
            }}
            aria-live="polite"
          >
            <strong>Status Check:</strong> {advice.text}
          </div>
        </div>
      </div>

      {/* Action Prompt Call-to-Action & Quick Habits Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '50%', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} aria-hidden="true" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Form Daily Habits</h3>
              <p className="info-text" style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Log daily actions to earn XP and build streaks.</p>
            </div>
          </div>
          <button 
            id="dash-habits-btn"
            data-testid="dash-habits-btn"
            className="btn btn-primary" 
            style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
            onClick={onNavigateToHabits}
          >
            Track Habits Now
          </button>
        </div>

        {/* Carbon Offset Simulator */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>Carbon Offset Simulator</h3>
          </div>
          <p className="info-text" style={{ fontSize: '12px', margin: 0 }}>
            Simulate purchasing carbon offsets (tonnes CO₂e) to bring your net emissions down to **Net Zero**.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button 
              id="offset-add-01"
              data-testid="offset-add-01"
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '11px' }}
              onClick={() => onUpdateOffset(offset + 0.1)}
              aria-label="Add 0.1 tonnes of carbon offset"
            >
              +0.1t
            </button>
            <button 
              id="offset-add-05"
              data-testid="offset-add-05"
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '11px' }}
              onClick={() => onUpdateOffset(offset + 0.5)}
              aria-label="Add 0.5 tonnes of carbon offset"
            >
              +0.5t
            </button>
            <button 
              id="offset-add-10"
              data-testid="offset-add-10"
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '11px' }}
              onClick={() => onUpdateOffset(offset + 1.0)}
              aria-label="Add 1.0 tonnes of carbon offset"
            >
              +1.0t
            </button>
            <button 
              id="offset-reset"
              data-testid="offset-reset"
              type="button" 
              className="btn" 
              style={{ padding: '6px 10px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
              onClick={() => onUpdateOffset(0)}
              disabled={offset === 0}
              aria-label="Reset simulated offsets"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Info size={16} style={{ color: 'var(--secondary)' }} aria-hidden="true" />
              <h3 style={{ margin: 0, fontSize: '16px' }}>Emissions Profile</h3>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
              <p style={{ margin: '0 0 6px 0' }}>
                Your largest contributor is <strong>
                  {breakdown.transport >= Math.max(breakdown.homeEnergy, breakdown.diet, breakdown.wasteShopping) ? 'Transportation' :
                   breakdown.homeEnergy >= Math.max(breakdown.transport, breakdown.diet, breakdown.wasteShopping) ? 'Home Energy' :
                   breakdown.diet >= Math.max(breakdown.transport, breakdown.homeEnergy, breakdown.wasteShopping) ? 'Diet' : 'Waste & Shopping'}
                </strong> ({(Math.max(breakdown.transport, breakdown.homeEnergy, breakdown.diet, breakdown.wasteShopping) / (breakdown.total || 1) * 100).toFixed(0)}%).
              </p>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Use the **Sandbox Sim** to simulate changes to your vehicle or home fuel options.
          </span>
        </div>
      </div>
    </div>
  );
};
