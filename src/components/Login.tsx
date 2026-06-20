import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Shield, Mail, Lock, User, AlertTriangle, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Warp } from "@paper-design/shaders-react";

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

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      setErrorMsg("Supabase is not configured. Please supply environment variables or click Bypass.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to initiate Google sign-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}>
        <Warp
          style={{ width: "100%", height: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1}
          colors={["hsl(203, 100%, 62%)", "hsl(255, 100%, 72%)", "hsl(158, 99%, 59%)", "hsl(264, 100%, 61%)"]}
        />
      </div>
      <div className="login-card glass-card" style={{ position: 'relative', zIndex: 10 }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))', 
            padding: '16px', 
            borderRadius: '50%', 
            color: 'var(--primary)', 
            marginBottom: '16px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 0 24px rgba(16, 185, 129, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={36} />
          </div>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: 800, 
            fontFamily: 'var(--font-display)', 
            letterSpacing: '-0.03em', 
            background: 'linear-gradient(120deg, #ffffff 40%, var(--accent) 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            marginBottom: '6px' 
          }}>
            CarbAware
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '14px', maxWidth: '340px', lineHeight: 1.4 }}>
            Calculate footprints, track green actions, and consult Ecodroid AI.
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0' }}>
              <div style={{ flexGrow: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-sub)', textTransform: 'uppercase' }}>or</span>
              <div style={{ flexGrow: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ 
                width: '100%', 
                height: '44px', 
                justifyContent: 'center', 
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#ffffff',
                gap: '10px',
                marginTop: '4px'
              }}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.67H24v9.09h12.75c-.53 2.87-2.13 5.31-4.53 6.91l7.02 5.44C43.34 36.36 46.5 30.79 46.5 24z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.02-5.44c-1.95 1.3-4.48 2.1-8.87 2.1-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="#FBBC05" d="M10.54 28.94C10.04 27.44 9.75 25.8 9.75 24s.29-3.44.79-4.94l-7.98-6.19C.99 16.24 0 20 0 24s.99 7.76 2.56 11.13l7.98-6.19z"/>
              </svg>
              Continue with Google
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
