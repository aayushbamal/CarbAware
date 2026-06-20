import React, { useState } from 'react';
import { 
  Car, Shield, ArrowRight, ArrowLeft, Check, 
  ShoppingBag, Zap, Flame, CheckSquare 
} from 'lucide-react';
import type { CarbonData } from '../types';
import { calculateCarbonFootprint } from '../utils/carbonCalculator';

interface OnboardingQuizProps {
  onComplete: (data: CarbonData) => void;
}

export const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<CarbonData>({
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
  });

  const handleSelect = <K extends keyof CarbonData>(key: K, value: CarbonData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNumberChange = <K extends keyof CarbonData>(key: K, val: string) => {
    const parsed = Math.max(0, parseInt(val) || 0);
    setFormData(prev => ({ ...prev, [key]: parsed }));
  };

  const currentFootprint = calculateCarbonFootprint(formData);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const handleSubmit = () => onComplete(formData);

  return (
    <div className="quiz-container glass-card">
      <div className="quiz-header">
        <h2>Eco Footprint Onboarding</h2>
        <span className="info-text">Step {step} of 3</span>
      </div>

      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {step === 1 && (
        <div className="quiz-step-pane">
          <h3 className="quiz-step-title">1. Transportation habits</h3>
          <p className="quiz-step-desc">How do you move around on a daily and yearly basis?</p>

          <div className="mb-6">
            <label className="number-input-label mb-4" style={{ display: 'block' }}>Primary Commute Mode</label>
            <div className="options-grid">
              <button 
                id="commute-petrol-car"
                data-testid="commute-petrol-car"
                type="button"
                className={`option-card ${formData.commuteMode === 'car_petrol' ? 'selected' : ''}`}
                onClick={() => handleSelect('commuteMode', 'car_petrol')}
                aria-pressed={formData.commuteMode === 'car_petrol'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Car size={18} className="logo-icon" aria-hidden="true" />
                  <span className="option-title">Petrol Car</span>
                </div>
                <span className="option-desc">Regular fuel combustion vehicle</span>
              </button>

              <button 
                id="commute-diesel-car"
                data-testid="commute-diesel-car"
                type="button"
                className={`option-card ${formData.commuteMode === 'car_diesel' ? 'selected' : ''}`}
                onClick={() => handleSelect('commuteMode', 'car_diesel')}
                aria-pressed={formData.commuteMode === 'car_diesel'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Car size={18} style={{ color: '#d97706' }} aria-hidden="true" />
                  <span className="option-title">Diesel Car</span>
                </div>
                <span className="option-desc">High mileage diesel combustion</span>
              </button>

              <button 
                id="commute-electric-car"
                data-testid="commute-electric-car"
                type="button"
                className={`option-card ${formData.commuteMode === 'car_electric' ? 'selected' : ''}`}
                onClick={() => handleSelect('commuteMode', 'car_electric')}
                aria-pressed={formData.commuteMode === 'car_electric'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Zap size={18} style={{ color: '#10b981' }} aria-hidden="true" />
                  <span className="option-title">Electric Car</span>
                </div>
                <span className="option-desc">Battery or plug-in hybrid vehicle</span>
              </button>

              <button 
                id="commute-transit"
                data-testid="commute-transit"
                type="button"
                className={`option-card ${formData.commuteMode === 'transit' ? 'selected' : ''}`}
                onClick={() => handleSelect('commuteMode', 'transit')}
                aria-pressed={formData.commuteMode === 'transit'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Shield size={18} style={{ color: '#06b6d4' }} aria-hidden="true" />
                  <span className="option-title">Public Transit</span>
                </div>
                <span className="option-desc">Subways, trains, and buses</span>
              </button>

              <button 
                id="commute-active"
                data-testid="commute-active"
                type="button"
                className={`option-card ${formData.commuteMode === 'bicycle_walk' ? 'selected' : ''}`}
                style={{ gridColumn: 'span 2' }}
                onClick={() => handleSelect('commuteMode', 'bicycle_walk')}
                aria-pressed={formData.commuteMode === 'bicycle_walk'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckSquare size={18} style={{ color: '#34d399' }} aria-hidden="true" />
                  <span className="option-title">Active Travel (Cycle / Walk / Run)</span>
                </div>
                <span className="option-desc">Zero direct carbon emission lifestyle</span>
              </button>
            </div>
          </div>

          <div className="number-input-container mb-6">
            <label htmlFor="quiz-weekly-commute" className="number-input-label">Weekly Commute Distance (Kilometers)</label>
            <input 
              id="quiz-weekly-commute"
              data-testid="quiz-weekly-commute"
              type="number" 
              className="styled-input"
              value={formData.weeklyCommuteKm}
              onChange={(e) => handleNumberChange('weeklyCommuteKm', e.target.value)}
              min="0"
              max="2000"
            />
          </div>

          <div className="grid-2">
            <div className="number-input-container">
              <label htmlFor="quiz-short-flights" className="number-input-label">Short flights per year (&lt; 3 hrs)</label>
              <input 
                id="quiz-short-flights"
                data-testid="quiz-short-flights"
                type="number" 
                className="styled-input"
                value={formData.yearlyFlights}
                onChange={(e) => handleNumberChange('yearlyFlights', e.target.value)}
                min="0"
              />
            </div>
            <div className="number-input-container">
              <label htmlFor="quiz-long-flights" className="number-input-label">Long flights per year (&gt; 3 hrs)</label>
              <input 
                id="quiz-long-flights"
                data-testid="quiz-long-flights"
                type="number" 
                className="styled-input"
                value={formData.yearlyLongFlights}
                onChange={(e) => handleNumberChange('yearlyLongFlights', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="quiz-step-pane">
          <h3 className="quiz-step-title">2. Home Energy Footprint</h3>
          <p className="quiz-step-desc">How clean and energy-efficient is your living environment?</p>

          <div className="mb-6">
            <label className="number-input-label mb-4" style={{ display: 'block' }}>Primary Electricity Source</label>
            <div className="options-grid">
              <button 
                id="electricity-coal"
                data-testid="electricity-coal"
                type="button"
                className={`option-card ${formData.electricitySource === 'grid_coal' ? 'selected' : ''}`}
                onClick={() => handleSelect('electricitySource', 'grid_coal')}
                aria-pressed={formData.electricitySource === 'grid_coal'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Flame size={18} style={{ color: '#ef4444' }} aria-hidden="true" />
                  <span className="option-title">Coal-Heavy Grid</span>
                </div>
                <span className="option-desc">Mainly powered by fossil fuels</span>
              </button>

              <button 
                id="electricity-mixed"
                data-testid="electricity-mixed"
                type="button"
                className={`option-card ${formData.electricitySource === 'grid_mixed' ? 'selected' : ''}`}
                onClick={() => handleSelect('electricitySource', 'grid_mixed')}
                aria-pressed={formData.electricitySource === 'grid_mixed'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Zap size={18} style={{ color: '#f59e0b' }} aria-hidden="true" />
                  <span className="option-title">Standard Grid mix</span>
                </div>
                <span className="option-desc">Average blend of renewables and fossil fuels</span>
              </button>

              <button 
                id="electricity-renewable"
                data-testid="electricity-renewable"
                type="button"
                className={`option-card ${formData.electricitySource === 'solar_renewable' ? 'selected' : ''}`}
                style={{ gridColumn: 'span 2' }}
                onClick={() => handleSelect('electricitySource', 'solar_renewable')}
                aria-pressed={formData.electricitySource === 'solar_renewable'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Zap size={18} style={{ color: '#10b981' }} aria-hidden="true" />
                  <span className="option-title">100% Renewable / Home Solar</span>
                </div>
                <span className="option-desc">Clean green electricity profile</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="number-input-label mb-4" style={{ display: 'block' }}>Primary Heating Fuel</label>
            <div className="options-grid">
              <button 
                id="heating-gas"
                data-testid="heating-gas"
                type="button"
                className={`option-card ${formData.heatingFuel === 'natural_gas' ? 'selected' : ''}`}
                onClick={() => handleSelect('heatingFuel', 'natural_gas')}
                aria-pressed={formData.heatingFuel === 'natural_gas'}
              >
                <span className="option-title">Natural Gas</span>
                <span className="option-desc">Standard gas utility line</span>
              </button>

              <button 
                id="heating-electric"
                data-testid="heating-electric"
                type="button"
                className={`option-card ${formData.heatingFuel === 'electricity' ? 'selected' : ''}`}
                onClick={() => handleSelect('heatingFuel', 'electricity')}
                aria-pressed={formData.heatingFuel === 'electricity'}
              >
                <span className="option-title">Heat Pump / Electric</span>
                <span className="option-desc">Electric radiator or central air</span>
              </button>

              <button 
                id="heating-oil"
                data-testid="heating-oil"
                type="button"
                className={`option-card ${formData.heatingFuel === 'heating_oil' ? 'selected' : ''}`}
                onClick={() => handleSelect('heatingFuel', 'heating_oil')}
                aria-pressed={formData.heatingFuel === 'heating_oil'}
              >
                <span className="option-title">Heating Oil / Coal</span>
                <span className="option-desc">Oil tank or boiler combustion</span>
              </button>

              <button 
                id="heating-wood"
                data-testid="heating-wood"
                type="button"
                className={`option-card ${formData.heatingFuel === 'wood' ? 'selected' : ''}`}
                onClick={() => handleSelect('heatingFuel', 'wood')}
                aria-pressed={formData.heatingFuel === 'wood'}
              >
                <span className="option-title">Wood Biomass</span>
                <span className="option-desc">Wood burners or pellet heating</span>
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div className="number-input-container">
              <label htmlFor="quiz-electric-bill" className="number-input-label">Monthly Electric Bill ($ equivalent)</label>
              <input 
                id="quiz-electric-bill"
                data-testid="quiz-electric-bill"
                type="number" 
                className="styled-input"
                value={formData.monthlyElectricBill}
                onChange={(e) => handleNumberChange('monthlyElectricBill', e.target.value)}
                min="0"
              />
            </div>
            <div className="number-input-container">
              <label htmlFor="quiz-home-size" className="number-input-label">Home Size (Square Meters)</label>
              <input 
                id="quiz-home-size"
                data-testid="quiz-home-size"
                type="number" 
                className="styled-input"
                value={formData.homeSizeSqM}
                onChange={(e) => handleNumberChange('homeSizeSqM', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="quiz-step-pane">
          <h3 className="quiz-step-title">3. Diet & Lifestyle</h3>
          <p className="quiz-step-desc">How does your household shop, eat, and recycle?</p>

          <div className="mb-6">
            <label className="number-input-label mb-4" style={{ display: 'block' }}>Diet Profile</label>
            <div className="options-grid">
              <button 
                id="diet-heavy-meat"
                data-testid="diet-heavy-meat"
                type="button"
                className={`option-card ${formData.dietType === 'heavy_meat' ? 'selected' : ''}`}
                onClick={() => handleSelect('dietType', 'heavy_meat')}
                aria-pressed={formData.dietType === 'heavy_meat'}
              >
                <span className="option-title">Frequent Meat</span>
                <span className="option-desc">Red meat or poultry daily</span>
              </button>

              <button 
                id="diet-moderate-meat"
                data-testid="diet-moderate-meat"
                type="button"
                className={`option-card ${formData.dietType === 'moderate_meat' ? 'selected' : ''}`}
                onClick={() => handleSelect('dietType', 'moderate_meat')}
                aria-pressed={formData.dietType === 'moderate_meat'}
              >
                <span className="option-title">Balanced / Flexitarian</span>
                <span className="option-desc">Poultry, fish, occasional red meat</span>
              </button>

              <button 
                id="diet-vegetarian"
                data-testid="diet-vegetarian"
                type="button"
                className={`option-card ${formData.dietType === 'vegetarian' ? 'selected' : ''}`}
                onClick={() => handleSelect('dietType', 'vegetarian')}
                aria-pressed={formData.dietType === 'vegetarian'}
              >
                <span className="option-title">Vegetarian</span>
                <span className="option-desc">No meat or fish, eggs/dairy okay</span>
              </button>

              <button 
                id="diet-vegan"
                data-testid="diet-vegan"
                type="button"
                className={`option-card ${formData.dietType === 'vegan' ? 'selected' : ''}`}
                onClick={() => handleSelect('dietType', 'vegan')}
                aria-pressed={formData.dietType === 'vegan'}
              >
                <span className="option-title">Vegan</span>
                <span className="option-desc">100% plant-based dietary lifestyle</span>
              </button>
            </div>
          </div>

          <div className="grid-2 mb-6">
            <div className="settings-group">
              <label htmlFor="quiz-food-waste" className="settings-label">Household Food Waste</label>
              <select 
                id="quiz-food-waste"
                data-testid="quiz-food-waste"
                className="settings-select"
                value={formData.foodWasteLevel}
                onChange={(e) => handleSelect('foodWasteLevel', e.target.value as CarbonData['foodWasteLevel'])}
              >
                <option value="low">Minimal - we finish everything</option>
                <option value="medium">Average - compost / some discards</option>
                <option value="high">Frequent - throw away left-overs</option>
              </select>
            </div>

            <div className="settings-group">
              <label htmlFor="quiz-recycling" className="settings-label">Recycling Practices</label>
              <select 
                id="quiz-recycling"
                data-testid="quiz-recycling"
                className="settings-select"
                value={formData.recyclingHabits}
                onChange={(e) => handleSelect('recyclingHabits', e.target.value as CarbonData['recyclingHabits'])}
              >
                <option value="all">Sort everything (cans, plastic, paper)</option>
                <option value="some">Recycle sometimes</option>
                <option value="none">Throw everything in general waste</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="number-input-label mb-4" style={{ display: 'block' }}>Consumer Shopping Habit</label>
            <div className="options-grid">
              <button 
                id="shopping-rarely"
                data-testid="shopping-rarely"
                type="button"
                className={`option-card ${formData.shoppingFrequency === 'rarely' ? 'selected' : ''}`}
                onClick={() => handleSelect('shoppingFrequency', 'rarely')}
                aria-pressed={formData.shoppingFrequency === 'rarely'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ShoppingBag size={16} aria-hidden="true" />
                  <span className="option-title">Minimalist</span>
                </div>
                <span className="option-desc">Only purchase essentials</span>
              </button>

              <button 
                id="shopping-average"
                data-testid="shopping-average"
                type="button"
                className={`option-card ${formData.shoppingFrequency === 'average' ? 'selected' : ''}`}
                onClick={() => handleSelect('shoppingFrequency', 'average')}
                aria-pressed={formData.shoppingFrequency === 'average'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ShoppingBag size={16} aria-hidden="true" />
                  <span className="option-title">Average Shopper</span>
                </div>
                <span className="option-desc">Standard electronics and fast-fashion</span>
              </button>

              <button 
                id="shopping-frequently"
                data-testid="shopping-frequently"
                type="button"
                className={`option-card ${formData.shoppingFrequency === 'frequently' ? 'selected' : ''}`}
                style={{ gridColumn: 'span 2' }}
                onClick={() => handleSelect('shoppingFrequency', 'frequently')}
                aria-pressed={formData.shoppingFrequency === 'frequently'}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ShoppingBag size={16} aria-hidden="true" />
                  <span className="option-title">Frequent Shopper / Gadget-Enthusiast</span>
                </div>
                <span className="option-desc">Regular upgrading of clothes, furniture, tech</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Calculator Feedback Bar - Visual Wow Factor */}
      <div 
        style={{ 
          marginTop: '32px', 
          padding: '16px', 
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Live Estimate
          </span>
          <h4 style={{ fontSize: '18px', color: '#ffffff', margin: 0, fontWeight: 700 }}>
            {currentFootprint.total} tonnes CO₂e / yr
          </h4>
        </div>
        <div style={{ fontSize: '11px', color: currentFootprint.total < 4.5 ? 'var(--primary)' : 'var(--warning)', fontWeight: 600 }}>
          {currentFootprint.total < 4.5 ? 'Below Global Average' : 'Above Global Average'}
        </div>
      </div>

      <div className="navigation-buttons" style={{ marginTop: '24px' }}>
        {step > 1 ? (
          <button 
            id="quiz-back-btn"
            data-testid="quiz-back-btn"
            type="button" 
            className="btn btn-secondary" 
            onClick={prevStep}
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button 
            id="quiz-next-btn"
            data-testid="quiz-next-btn"
            type="button" 
            className="btn btn-primary" 
            onClick={nextStep}
          >
            Next <ArrowRight size={16} aria-hidden="true" />
          </button>
        ) : (
          <button 
            id="quiz-submit-btn"
            data-testid="quiz-submit-btn"
            type="button" 
            className="btn btn-primary" 
            onClick={handleSubmit}
          >
            Generate Profile <Check size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
