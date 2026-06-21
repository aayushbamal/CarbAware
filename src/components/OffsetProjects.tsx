import React from 'react';
import { Heart, Trees, Zap, Wind, Coins } from 'lucide-react';
import type { UserProfile } from '../types';
import { calculateCarbonFootprint } from '../utils/carbonCalculator';

interface OffsetProjectsProps {
  profile: UserProfile;
  onPurchaseOffset: (tonnes: number, pointsCost: number) => void;
}

export const OffsetProjects: React.FC<OffsetProjectsProps> = ({ profile, onPurchaseOffset }) => {
  const currentData = profile.currentData;

  if (!currentData) {
    return (
      <div className="glass-card text-center" style={{ padding: '40px' }}>
        <p>No profile data available. Please complete onboarding first.</p>
      </div>
    );
  }

  const breakdown = calculateCarbonFootprint(currentData);
  const netEmissions = Math.max(0, Number((breakdown.total - profile.offsetTonnes).toFixed(2)));

  const projects = [
    {
      id: 'p1',
      title: 'Amazon Reforestation',
      icon: <Trees size={24} style={{ color: '#10b981' }} aria-hidden="true" />,
      badge: '🌲',
      costPerTonne: 200,
      description: 'Supports planting native trees in deforested areas of Brazil to rebuild ecosystems and sequester CO₂.',
      tag: 'Gold Standard Certified'
    },
    {
      id: 'p2',
      title: 'North Sea Offshore Wind',
      icon: <Wind size={24} style={{ color: '#06b6d4' }} aria-hidden="true" />,
      badge: '💨',
      costPerTonne: 150,
      description: 'Funds the installation of high-efficiency ocean wind farms to feed clean power into mixed grids.',
      tag: 'Verified Carbon Standard'
    },
    {
      id: 'p3',
      title: 'Sahara Solar Infrastructure',
      icon: <Zap size={24} style={{ color: '#f59e0b' }} aria-hidden="true" />,
      badge: '☀️',
      costPerTonne: 120,
      description: 'Expands concentrated solar farm grids in desert regions to replace heavy coal generators.',
      tag: 'VCS Certified'
    },
    {
      id: 'p4',
      title: 'Clean Rural Cookstoves',
      icon: <span style={{ fontSize: '20px' }}>🍳</span>,
      badge: '🍳',
      costPerTonne: 100,
      description: 'Provides fuel-efficient cookstoves to communities, cutting wood fuel usage and reducing toxic smoke.',
      tag: 'Climate Action Reserve'
    }
  ];

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Carbon Offset Marketplace</h1>
          <p style={{ color: 'var(--text-sub)' }}>Redeem your earned Eco Points (XP) to finance certified green projects and offset your footprint.</p>
        </div>

        <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Coins style={{ color: '#eab308' }} size={24} aria-hidden="true" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>REDEEMABLE XP</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>{profile.totalPoints} XP</div>
          </div>
        </div>
      </div>

      {/* Overview Status Grid */}
      <div className="grid-2 mb-4">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3>Your Offsetting Progress</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span>Original Emissions:</span>
            <span style={{ fontWeight: 600 }}>{breakdown.total} tonnes CO₂e</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Emissions Offset:</span>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>-{profile.offsetTonnes} tonnes CO₂e</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
            <strong>Net Carbon Footprint:</strong>
            <strong style={{ color: netEmissions === 0 ? 'var(--primary)' : 'inherit' }}>
              {netEmissions} tonnes CO₂e
            </strong>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Heart size={36} style={{ color: '#ef4444', fill: '#ef4444' }} aria-hidden="true" />
          <div style={{ textAlign: 'left' }}>
            <h4>Why Offset?</h4>
            <p className="info-text mt-4" style={{ fontSize: '13px' }}>
              For emissions that are difficult to eliminate entirely (like airline travel or mandatory home heating), support projects that actively capture carbon or prevent fuel burn.
            </p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <h3 className="mb-4">Certified Carbon Reduction Projects</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {projects.map((proj) => {
          const hasPoints = profile.totalPoints >= proj.costPerTonne;
          const isNeutral = netEmissions === 0;

          return (
            <div key={proj.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '10px' }}>
                    {proj.icon}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    {proj.tag}
                  </span>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{proj.title}</h4>
                <p className="info-text" style={{ fontSize: '13px' }}>{proj.description}</p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                  <span>Cost per 1.0 Tonne:</span>
                  <strong style={{ color: '#eab308' }}>{proj.costPerTonne} XP</strong>
                </div>

                <button 
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => onPurchaseOffset(1.0, proj.costPerTonne)}
                  disabled={!hasPoints || isNeutral}
                >
                  {isNeutral ? (
                    'Carbon Neutral!'
                  ) : hasPoints ? (
                    `Offset 1.0 Tonne (-${proj.costPerTonne} XP)`
                  ) : (
                    `Need ${proj.costPerTonne - profile.totalPoints} more XP`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
