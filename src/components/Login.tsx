import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Shield, Mail, Lock, User, AlertTriangle, ArrowRight, Sparkles, Check } from 'lucide-react';

interface LoginProps {
  onBypassAuth: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBypassAuth }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if Supabase keys are provided
  const isSupabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setErrorMsg("Supabase is not configured. Please supply environment variables or click Bypass.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || 'Eco Champion'
            }
          }
        });

        if (error) throw error;
        
        // Supabase sign up could require email verification
        if (data?.user && data.session === null) {
          setSuccessMsg("Registration successful! Please check your email inbox to verify your account.");
        } else if (data?.session) {
          setSuccessMsg("Account created and logged in successfully!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card glass-card">
        {/* Logo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ background: 'var(--primary-glow)', padding: '16px', borderRadius: '50%', color: 'var(--primary)', marginBottom: '12px' }}>
            <Shield size={36} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>CarbAware & PromptWars</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginTop: '4px' }}>
            Calculate footprints, track green actions, and battle climate skeptics.
          </p>
        </div>

        {/* Supabase Missing Configuration Banner */}
        {!isSupabaseConfigured && (
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.08)', 
            border: '1px solid rgba(245, 158, 11, 0.25)', 
            borderRadius: '10px', 
            padding: '14px', 
            marginBottom: '20px',
            fontSize: '12px',
            lineHeight: 1.4
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', fontWeight: 700, marginBottom: '6px' }}>
              <AlertTriangle size={16} />
              <span>Supabase Connection Missing</span>
            </div>
            <p style={{ color: 'var(--text-sub)', marginBottom: '8px' }}>
              To connect actual user database logins, create a <code>.env</code> file in the root folder with:
            </p>
            <pre style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '8px', 
              borderRadius: '6px', 
              fontFamily: 'monospace', 
              fontSize: '10px',
              overflowX: 'auto',
              color: 'var(--accent)'
            }}>
              VITE_SUPABASE_URL=your-supabase-url<br />
              VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
            </pre>
            <button 
              type="button"
              className="btn btn-secondary mt-4" 
              style={{ width: '100%', fontSize: '11px', padding: '8px', justifyContent: 'center' }}
              onClick={onBypassAuth}
            >
              <Sparkles size={12} /> Bypass Auth (Simulated Local Mode)
            </button>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.08)', 
            border: '1px solid rgba(239, 68, 68, 0.25)', 
            borderRadius: '8px', 
            padding: '10px 14px', 
            marginBottom: '16px',
            fontSize: '13px',
            color: '#ff8888',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.08)', 
            border: '1px solid rgba(16, 185, 129, 0.25)', 
            borderRadius: '8px', 
            padding: '10px 14px', 
            marginBottom: '16px',
            fontSize: '13px',
            color: '#a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={14} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms */}
        {isSupabaseConfigured && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isSignUp && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="styled-input" 
                    style={{ width: '100%', paddingLeft: '40px', fontSize: '14px', height: '44px' }}
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="styled-input" 
                  style={{ width: '100%', paddingLeft: '40px', fontSize: '14px', height: '44px' }}
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="styled-input" 
                  style={{ width: '100%', paddingLeft: '40px', fontSize: '14px', height: '44px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', height: '44px', justifyContent: 'center', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (
                <>
                  {isSignUp ? 'Create Eco Account' : 'Access Account'} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab Toggle Footer */}
        {isSupabaseConfigured && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-sub)' }}>
              {isSignUp ? "Already have an account? " : "New to the platform? "}
            </span>
            <button 
              type="button" 
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
