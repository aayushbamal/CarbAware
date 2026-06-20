import React from 'react';
import { ShoppingBag, Lock, Sparkles, Coins, Gift, Info } from 'lucide-react';
import type { UserProfile } from '../types';

interface MarketplaceProps {
  profile: UserProfile;
}

const MERCHANDISE_ITEMS = [
  {
    id: 'm1',
    name: 'Bamboo Solar Power Bank',
    category: 'Energy Tech',
    xpCost: 1200,
    icon: '🔋',
    description: 'High-capacity backup battery wrapped in natural bamboo with a monocrystalline solar charger panel.'
  },
  {
    id: 'm2',
    name: 'Organic Hemp Eco-Tee',
    category: 'Fashion',
    xpCost: 800,
    icon: '👕',
    description: 'Ultra-breathable sustainable t-shirt crafted from organic hemp fibers and colored with botanical dyes.'
  },
  {
    id: 'm3',
    name: 'Zero-Waste Travel Mug',
    category: 'Drinkware',
    xpCost: 500,
    icon: '☕',
    description: 'Vacuum-insulated stainless steel coffee tumbler with a biological cork grip. Replaces single-use cups.'
  },
  {
    id: 'm4',
    name: 'Recycled Ocean Backpack',
    category: 'Lifestyle Bags',
    xpCost: 1500,
    icon: '🎒',
    description: 'Waterproof urban roll-top backpack constructed entirely from salvaged marine plastic debris.'
  },
  {
    id: 'm5',
    name: 'Solar-Powered Speaker',
    category: 'Tech Accessories',
    xpCost: 2000,
    icon: '🔊',
    description: 'Outdoor Bluetooth audio speaker with integrated solar panels for unlimited playback in the sun.'
  },
  {
    id: 'm6',
    name: 'Recycled Paper Stationery Set',
    category: 'Office',
    xpCost: 350,
    icon: '📓',
    description: 'Handmade notebook from post-consumer recycled paper paired with a biodegradable bamboo ballpoint pen.'
  }
];

export const Marketplace: React.FC<MarketplaceProps> = ({ profile }) => {
  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Eco Marketplace</h1>
          <p style={{ color: 'var(--text-sub)' }}>Redeem your earned Eco XP points to order physical, climate-conscious merchandise.</p>
        </div>

        <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Coins style={{ color: '#eab308' }} size={24} aria-hidden="true" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>YOUR REDEEMABLE XP</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>{profile.totalPoints} XP</div>
          </div>
        </div>
      </div>

      {/* Under Construction Banner */}
      <div className="glass-card" style={{ 
        border: '1px dashed var(--primary)', 
        background: 'rgba(16, 185, 129, 0.03)', 
        padding: '32px', 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '12px' 
      }}>
        <div style={{ background: 'var(--primary-glow)', padding: '16px', borderRadius: '50%', color: 'var(--primary)', display: 'inline-block' }}>
          <Lock size={32} aria-hidden="true" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Storefront Currently Locked</h2>
        <p style={{ color: 'var(--text-sub)', maxWidth: '500px', fontSize: '14px', margin: 0 }}>
          The merchandise checkout system is **Coming Soon**! We are working with ethical, zero-emission suppliers to fulfill physical rewards. Keep completing Daily Actions and winning battles in the Prompt Arena to bank your XP!
        </p>
        <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
          <Sparkles size={14} aria-hidden="true" /> Beta Phase 1 Storefront
        </span>
      </div>

      {/* Merch Catalog Grid */}
      <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShoppingBag size={20} style={{ color: 'var(--primary)' }} aria-hidden="true" />
        Preview Sustainable Merchandise
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {MERCHANDISE_ITEMS.map((item) => {
          return (
            <div 
              key={item.id} 
              className="glass-card" 
              style={{ 
                opacity: 0.85, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                gap: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Product Info */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '40px' }}>{item.icon}</div>
                  <span style={{ fontSize: '10px', color: 'var(--text-sub)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '10px' }}>
                    {item.category}
                  </span>
                </div>
                
                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{item.name}</h4>
                <p className="info-text" style={{ fontSize: '13px', minHeight: '54px' }}>{item.description}</p>
              </div>

              {/* Price and Lock action */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-sub)' }}><Gift size={14} aria-hidden="true" /> Price:</span>
                  <strong style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}>{item.xpCost} XP</strong>
                </div>

                <button 
                  id={`marketplace-buy-btn-${item.id}`}
                  data-testid={`marketplace-buy-btn-${item.id}`}
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', cursor: 'not-allowed', opacity: 0.6 }}
                  disabled
                >
                  <Lock size={14} style={{ marginRight: '6px' }} aria-hidden="true" /> Coming Soon
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12px', color: 'var(--text-sub)', marginTop: '8px' }}>
        <Info size={14} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
        <p>
          Once the store goes live, redeeming products will deduct XP points from your profile. Shipping is zero-carbon offset certified.
        </p>
      </div>
    </div>
  );
};
