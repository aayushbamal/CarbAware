import React, { useState } from 'react';
import { 
  Trees, RefreshCw, Check, Info 
} from 'lucide-react';
import type { UserProfile, CarbonData } from '../types';
import { calculateCarbonFootprint, calculateSavings } from '../utils/carbonCalculator';

interface SandboxProps {
  profile: UserProfile;
  onUpdateProfileData: (data: CarbonData) => void;
}

export const Sandbox: React.FC<SandboxProps> = ({ profile, onUpdateProfileData }) => {
  const currentData = profile.currentData;

  const fallbackData: CarbonData = {
    commuteMode: 'transit',
    weeklyCommuteKm: 50,
    yearlyFlights: 1,
    yearlyLongFlights: 0,
    electricitySource: 'grid_mixed',
    monthlyElectricBill: 50,
    heatingFuel: 'natural_gas',
    homeSizeSqM: 80,
    dietType: 'moderate_meat',
    foodWasteLevel: 'medium',
    recyclingHabits: 'some',
    shoppingFrequency: 'average'
  };

  // Create temporary sandbox data state initialized with current profile data
  const [sandboxData, setSandboxData] = useState<CarbonData>(currentData || fallbackData);

  if (!currentData) {
    return (
      <div className="glass-card text-center" style={{ padding: '40px' }}>
        <p>No profile data available. Please complete onboarding first.</p>
      </div>
    );
  }

  const currentBreakdown = calculateCarbonFootprint(currentData);
  const { newBreakdown, savedTonnes, treesEquivalent } = calculateSavings(
    currentBreakdown,
    currentData,
    sandboxData
  );

  const handleSelect = <K extends keyof CarbonData>(key: K, value: CarbonData[K]) => {
    setSandboxData(prev => ({ ...prev, [key]: value }));
  };

  const handleSliderChange = (key: keyof CarbonData, val: number) => {
    setSandboxData(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setSandboxData({ ...currentData });
  };

  const handleApply = () => {
    onUpdateProfileData(sandboxData);
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>"What If" Sandbox</h1>
          <p style={{ color: 'var(--text-sub)' }}>Simulate changes to your lifestyle to see how much carbon you can save.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            id="sandbox-reset-btn"
            data-testid="sandbox-reset-btn"
            type="button" 
            className="btn btn-secondary" 
            onClick={handleReset} 
            aria-label="Reset sliders"
          >
            <RefreshCw size={16} aria-hidden="true" /> Reset Sliders
          </button>
          <button 
            id="sandbox-apply-btn"
            data-testid="sandbox-apply-btn"
            type="button" 
            className="btn btn-primary" 
            onClick={handleApply}
            disabled={savedTonnes === 0}
            aria-label="Apply simulated options to profile"
          >
            Apply to Profile <Check size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Sliders Configuration */}
        <div className="glass-card sandbox-sliders-container">
          <h3>Simulated Lifestyle Choices</h3>
          
          {/* Commute Distance slider */}
          <div className="slider-group">
            <div className="slider-header">
              <label htmlFor="sandbox-commute" className="slider-label">Weekly Commute (km)</label>
              <span className="slider-value">{sandboxData.weeklyCommuteKm} km</span>
            </div>
            <input 
              id="sandbox-commute"
              data-testid="sandbox-commute-slider"
              type="range"
              min="0"
              max="1000"
              step="10"
              className="sandbox-slider"
              value={sandboxData.weeklyCommuteKm}
              onChange={(e) => handleSliderChange('weeklyCommuteKm', parseInt(e.target.value))}
            />
          </div>

          {/* Commute Mode Selector */}
          <div>
            <label className="number-input-label mb-4" style={{ display: 'block', fontSize: '14px' }}>Commute Mode</label>
            <div className="options-grid" style={{ gap: '10px' }}>
              {[
                { id: 'car_petrol', label: 'Petrol Car' },
                { id: 'car_electric', label: 'Electric Car' },
                { id: 'transit', label: 'Transit' },
                { id: 'bicycle_walk', label: 'Active Travel' }
              ].map(opt => (
                <button
                  key={opt.id}
                  id={`sandbox-commute-${opt.id}`}
                  data-testid={`sandbox-commute-${opt.id}`}
                  type="button"
                  style={{ padding: '12px 14px', fontSize: '13px' }}
                  className={`option-card ${sandboxData.commuteMode === opt.id ? 'selected' : ''}`}
                  onClick={() => handleSelect('commuteMode', opt.id as CarbonData['commuteMode'])}
                  aria-pressed={sandboxData.commuteMode === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Electricity Source */}
          <div>
            <label className="number-input-label mb-4" style={{ display: 'block', fontSize: '14px' }}>Electricity Grid</label>
            <div className="options-grid" style={{ gap: '10px' }}>
              {[
                { id: 'grid_coal', label: 'Coal Heavy' },
                { id: 'grid_mixed', label: 'Mixed Grid' },
                { id: 'solar_renewable', label: 'Solar/Renewable' }
              ].map(opt => (
                <button
                  key={opt.id}
                  id={`sandbox-electricity-${opt.id}`}
                  data-testid={`sandbox-electricity-${opt.id}`}
                  type="button"
                  style={{ padding: '12px 14px', fontSize: '13px' }}
                  className={`option-card ${sandboxData.electricitySource === opt.id ? 'selected' : ''}`}
                  onClick={() => handleSelect('electricitySource', opt.id as CarbonData['electricitySource'])}
                  aria-pressed={sandboxData.electricitySource === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diet style */}
          <div>
            <label className="number-input-label mb-4" style={{ display: 'block', fontSize: '14px' }}>Diet Habits</label>
            <div className="options-grid" style={{ gap: '10px' }}>
              {[
                { id: 'heavy_meat', label: 'Heavy Meat' },
                { id: 'moderate_meat', label: 'Balanced' },
                { id: 'vegetarian', label: 'Vegetarian' },
                { id: 'vegan', label: 'Vegan' }
              ].map(opt => (
                <button
                  key={opt.id}
                  id={`sandbox-diet-${opt.id}`}
                  data-testid={`sandbox-diet-${opt.id}`}
                  type="button"
                  style={{ padding: '12px 14px', fontSize: '13px' }}
                  className={`option-card ${sandboxData.dietType === opt.id ? 'selected' : ''}`}
                  onClick={() => handleSelect('dietType', opt.id as CarbonData['dietType'])}
                  aria-pressed={sandboxData.dietType === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Simulation Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card sandbox-results-panel">
            <Trees size={48} style={{ color: 'var(--primary)', marginBottom: '8px' }} aria-hidden="true" />
            <h3 style={{ fontSize: '20px' }}>Potential Annual Savings</h3>
            <div className="savings-highlight">
              {savedTonnes} tonnes CO₂e
            </div>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', maxWidth: '300px' }}>
              Making these changes would reduce your yearly footprint by{' '}
              <strong>{(savedTonnes / (currentBreakdown.total || 1) * 100).toFixed(0)}%</strong>.
            </p>

            <div 
              style={{ 
                marginTop: '16px', 
                padding: '16px 20px', 
                borderRadius: '12px', 
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                width: '100%'
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>EQUIVALENT ENVIRONMENTAL VALUE</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                {treesEquivalent} mature trees
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                absorbing CO₂ for an entire year.
              </div>
            </div>
          </div>

          {/* Quick comparison panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3>Emissions Comparison</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span>Current Emissions</span>
                  <span style={{ fontWeight: 600 }}>{currentBreakdown.total} tonnes</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#ef4444', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span>Simulated Emissions</span>
                  <span style={{ fontWeight: 600 }}>{newBreakdown.total} tonnes</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${(newBreakdown.total / (currentBreakdown.total || 1)) * 100}%`, 
                      height: '100%', 
                      background: 'var(--primary)', 
                      borderRadius: '4px',
                      transition: 'width 0.4s ease-out'
                    }} 
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '8px', fontSize: '12px', color: 'var(--text-sub)' }}>
              <Info size={14} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              <p>
                Applying sandbox metrics updates your main questionnaire data. This scales down your default dashboard breakdown and updates recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
