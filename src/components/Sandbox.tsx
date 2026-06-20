import React from 'react';
import { 
  Trees, RefreshCw, Check, Info 
} from 'lucide-react';
import type { UserProfile, CarbonData } from '../types';
import { calculateCarbonFootprint, calculateSavings } from '../utils/carbonCalculator';
import { useSandboxSim } from '../hooks/useSandboxSim';

interface SandboxProps {
  profile: UserProfile;
  onUpdateProfileData: (data: CarbonData) => void;
}

export const Sandbox: React.FC<SandboxProps> = ({ profile, onUpdateProfileData }) => {
  const currentData = profile.currentData;

  const {
    sandboxData,
    handleSelect,
    handleSliderChange,
    handleReset,
    handleApply
  } = useSandboxSim(profile, onUpdateProfileData);

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
          
          {/* Section 1: Travel & Commute */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '16px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>🚗 Travel & Commute</h4>
            
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
            <div style={{ marginBottom: '14px' }}>
              <label className="number-input-label mb-2" style={{ display: 'block', fontSize: '13px' }}>Commute Mode</label>
              <div className="options-grid" style={{ gap: '8px' }}>
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
                    style={{ padding: '8px 10px', fontSize: '12px' }}
                    className={`option-card ${sandboxData.commuteMode === opt.id ? 'selected' : ''}`}
                    onClick={() => handleSelect('commuteMode', opt.id as CarbonData['commuteMode'])}
                    aria-pressed={sandboxData.commuteMode === opt.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flights sliders */}
            <div className="grid-2" style={{ gap: '16px' }}>
              <div className="slider-group" style={{ margin: 0 }}>
                <div className="slider-header">
                  <label htmlFor="sandbox-short-flights" className="slider-label" style={{ fontSize: '12px' }}>Short Flights (yearly)</label>
                  <span className="slider-value" style={{ fontSize: '12px' }}>{sandboxData.yearlyFlights}</span>
                </div>
                <input 
                  id="sandbox-short-flights"
                  data-testid="sandbox-short-flights-slider"
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  className="sandbox-slider"
                  value={sandboxData.yearlyFlights}
                  onChange={(e) => handleSliderChange('yearlyFlights', parseInt(e.target.value))}
                />
              </div>

              <div className="slider-group" style={{ margin: 0 }}>
                <div className="slider-header">
                  <label htmlFor="sandbox-long-flights" className="slider-label" style={{ fontSize: '12px' }}>Long Flights (yearly)</label>
                  <span className="slider-value" style={{ fontSize: '12px' }}>{sandboxData.yearlyLongFlights}</span>
                </div>
                <input 
                  id="sandbox-long-flights"
                  data-testid="sandbox-long-flights-slider"
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  className="sandbox-slider"
                  value={sandboxData.yearlyLongFlights}
                  onChange={(e) => handleSliderChange('yearlyLongFlights', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Home Energy */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '16px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>💡 Home & Power Grid</h4>

            {/* Electric Bill slider */}
            <div className="slider-group">
              <div className="slider-header">
                <label htmlFor="sandbox-electric-bill" className="slider-label">Monthly Electric Bill ($)</label>
                <span className="slider-value">${sandboxData.monthlyElectricBill}</span>
              </div>
              <input 
                id="sandbox-electric-bill"
                data-testid="sandbox-electric-bill-slider"
                type="range"
                min="0"
                max="500"
                step="10"
                className="sandbox-slider"
                value={sandboxData.monthlyElectricBill}
                onChange={(e) => handleSliderChange('monthlyElectricBill', parseInt(e.target.value))}
              />
            </div>

            {/* Electricity Source */}
            <div style={{ marginBottom: '14px' }}>
              <label className="number-input-label mb-2" style={{ display: 'block', fontSize: '13px' }}>Grid Source</label>
              <div className="options-grid" style={{ gap: '8px' }}>
                {[
                  { id: 'grid_coal', label: 'Coal Heavy' },
                  { id: 'grid_mixed', label: 'Mixed Grid' },
                  { id: 'solar_renewable', label: 'Renewables' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    id={`sandbox-electricity-${opt.id}`}
                    data-testid={`sandbox-electricity-${opt.id}`}
                    type="button"
                    style={{ padding: '8px 10px', fontSize: '12px' }}
                    className={`option-card ${sandboxData.electricitySource === opt.id ? 'selected' : ''}`}
                    onClick={() => handleSelect('electricitySource', opt.id as CarbonData['electricitySource'])}
                    aria-pressed={sandboxData.electricitySource === opt.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Heating Fuel */}
            <div>
              <label className="number-input-label mb-2" style={{ display: 'block', fontSize: '13px' }}>Heating Fuel</label>
              <div className="options-grid" style={{ gap: '8px' }}>
                {[
                  { id: 'natural_gas', label: 'Gas' },
                  { id: 'electricity', label: 'Electric' },
                  { id: 'heating_oil', label: 'Oil/Coal' },
                  { id: 'wood', label: 'Biomass' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    id={`sandbox-heating-${opt.id}`}
                    data-testid={`sandbox-heating-${opt.id}`}
                    type="button"
                    style={{ padding: '8px 10px', fontSize: '12px' }}
                    className={`option-card ${sandboxData.heatingFuel === opt.id ? 'selected' : ''}`}
                    onClick={() => handleSelect('heatingFuel', opt.id as CarbonData['heatingFuel'])}
                    aria-pressed={sandboxData.heatingFuel === opt.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Diet & Waste */}
          <div>
            <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>🥗 Diet & Waste Management</h4>

            {/* Diet style */}
            <div style={{ marginBottom: '14px' }}>
              <label className="number-input-label mb-2" style={{ display: 'block', fontSize: '13px' }}>Diet Type</label>
              <div className="options-grid" style={{ gap: '8px' }}>
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
                    style={{ padding: '8px 10px', fontSize: '12px' }}
                    className={`option-card ${sandboxData.dietType === opt.id ? 'selected' : ''}`}
                    onClick={() => handleSelect('dietType', opt.id as CarbonData['dietType'])}
                    aria-pressed={sandboxData.dietType === opt.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recycling Habits */}
            <div>
              <label className="number-input-label mb-2" style={{ display: 'block', fontSize: '13px' }}>Recycling Habits</label>
              <div className="options-grid" style={{ gap: '8px' }}>
                {[
                  { id: 'all', label: 'Recycle All' },
                  { id: 'some', label: 'Sometimes' },
                  { id: 'none', label: 'No Recycling' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    id={`sandbox-recycling-${opt.id}`}
                    data-testid={`sandbox-recycling-${opt.id}`}
                    type="button"
                    style={{ padding: '8px 10px', fontSize: '12px' }}
                    className={`option-card ${sandboxData.recyclingHabits === opt.id ? 'selected' : ''}`}
                    onClick={() => handleSelect('recyclingHabits', opt.id as CarbonData['recyclingHabits'])}
                    aria-pressed={sandboxData.recyclingHabits === opt.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Simulation Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card sandbox-results-panel" aria-live="polite">
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
