import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, RefreshCw, AlertTriangle } from 'lucide-react';
import type { UserProfile, BattleMessage } from '../types';
import { GEMINI_API_KEY, NVIDIA_API_KEY } from '../config';
import { calculateCarbonFootprint } from '../utils/carbonCalculator';

interface EcodroidProps {
  profile: UserProfile;
}

export const Ecodroid: React.FC<EcodroidProps> = ({ profile }) => {
  const [messages, setMessages] = useState<BattleMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const apiKey = GEMINI_API_KEY;
  const isNvidiaActive = !!NVIDIA_API_KEY;
  const isGeminiActive = !!apiKey;
  const isAiActive = isNvidiaActive || isGeminiActive;

  // Calculate user footprint metrics for Ecodroid's context
  const carbonBreakdown = calculateCarbonFootprint(profile.currentData || {
    commuteMode: 'car_petrol',
    weeklyCommuteKm: 100,
    yearlyFlights: 1,
    yearlyLongFlights: 0,
    electricitySource: 'grid_mixed',
    monthlyElectricBill: 100,
    heatingFuel: 'natural_gas',
    homeSizeSqM: 80,
    dietType: 'moderate_meat',
    foodWasteLevel: 'medium',
    recyclingHabits: 'some',
    shoppingFrequency: 'average'
  });

  const getPersonaGreeting = () => {
    const persona = profile.settings?.assistantPersona || 'friendly';
    const userName = profile.name || 'Eco Champion';
    const footprint = carbonBreakdown.total.toFixed(1);

    switch (persona) {
      case 'strict':
        return `Hello ${userName}. I am Ecodroid 🤖. Analysis complete. Your annual emissions stand at ${footprint} tonnes of CO₂e. This is unacceptable if we wish to meet planetary boundaries. Let us formulate a strict, non-negotiable emission reduction plan immediately. State your query.`;
      case 'optimist':
        return `Hi there, ${userName}! 🌿 I'm Ecodroid, your positive green sidekick! ☀️ We calculated your footprint at ${footprint} tonnes of CO₂e, and guess what? That means there's so much amazing potential to make a difference! Together, we can find fun, clean habits to save our lovely planet. What would you like to build or discuss first? ✨`;
      case 'general':
        return `Ecodroid combat-unit online 🎖️. Target: Carbon emissions (${footprint} tonnes CO₂e/yr). Objective: Strategic reduction of footprint metrics. Identify sector for immediate tactical intervention: transport, home grid, or consumption habits. Standing by for commands.`;
      case 'friendly':
      default:
        return `Hello ${userName}! I am Ecodroid, your personal carbon-neutral assistant. 🤖🌿 I've analyzed your lifestyle choices and calculated your annual carbon footprint to be ${footprint} tonnes of CO₂e. What would you like to discuss today? I can help you find green alternatives, calculate emissions savings, or design daily habits.`;
    }
  };

  // Reset conversation and set greeting based on persona
  const resetChat = () => {
    setMessages([
      {
        sender: 'opponent', // Render as assistant bubble
        text: getPersonaGreeting(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setApiError(null);
  };

  useEffect(() => {
    resetChat();
  }, [profile.settings?.assistantPersona, profile.name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Predefined prompt suggestion chips
  const suggestionChips = [
    { label: '🚗 Transport Footprint', prompt: 'Analyze my transportation choices and give me specific ways to cut emissions.' },
    { label: '🥗 Diet Tips', prompt: 'Suggest vegetarian or low-impact meal preps that fit my lifestyle.' },
    { label: '💡 Renewable Solar', prompt: 'Is switching to solar power worth it for my home size and electric usage?' },
    { label: '📊 Footprint Analysis', prompt: 'Explain the breakdown of my carbon footprint and which area I should tackle first.' },
    { label: '🏆 Custom Action Plan', prompt: 'Draft a simple, 3-step action plan for this week based on my profile.' }
  ];

  const callAIProxy = async (userPrompt: string, history: BattleMessage[]) => {
    const persona = profile.settings?.assistantPersona || 'friendly';
    const temp = profile.settings?.modelTemperature !== undefined ? profile.settings.modelTemperature : 0.7;

    const data = profile.currentData;
    const commuteInfo = data ? `${data.weeklyCommuteKm} km weekly via ${data.commuteMode.replace('_', ' ')}` : 'Unknown';
    const electricityInfo = data ? `${data.electricitySource.replace('_', ' ')}` : 'Mixed Grid';
    const dietInfo = data ? `${data.dietType}` : 'balanced';

    let personaDirective = '';
    if (persona === 'strict') {
      personaDirective = 'You are strict, scientific, no-nonsense, and direct. Emphasize urgent environmental limits, avoid sweet-talking, and give raw numbers and rigid rules.';
    } else if (persona === 'optimist') {
      personaDirective = 'You are highly positive, cheerful, encouraging, and focus on the hopeful aspects of green lifestyle changes. Use words of encouragement and positive reinforcement.';
    } else if (persona === 'general') {
      personaDirective = 'Adopt a military tactical commander style. Use terminology like "operation", "tactical target", "deployment", "combat emissions". Keep instructions precise and action-oriented.';
    } else {
      personaDirective = 'Be a friendly, helpful, and rational environmental coach. Keep explanations practical, accessible, and balanced.';
    }

    const systemPrompt = `You are Ecodroid, a helpful futuristic eco-assistant droid for the CarbAware web app.
The user is ${profile.name || 'Eco Champion'}.
User footprint profile context:
- Annual carbon footprint: ${carbonBreakdown.total.toFixed(2)} tonnes CO2e
- Transport breakdown: ${carbonBreakdown.transport.toFixed(2)} tonnes
- Home Energy breakdown: ${carbonBreakdown.homeEnergy.toFixed(2)} tonnes
- Diet breakdown: ${carbonBreakdown.diet.toFixed(2)} tonnes
- Waste/Shopping breakdown: ${carbonBreakdown.wasteShopping.toFixed(2)} tonnes
- Details: Commute commute details: ${commuteInfo}, Grid power source: ${electricityInfo}, Diet habits: ${dietInfo}.

Task: Respond to the user's message. Address their specific situation using their footprint data whenever possible.
Guidelines:
1. ${personaDirective}
2. Keep responses relatively short (maximum 4-5 sentences or a short bulleted list) so they look clean in a chat interface.
3. Keep a warm, smart, slightly robotic but cute personality (utilize eco emojis like 🤖, 🌿, 🔋, ⚡, 🥗).
4. Do not mention system details or API parameters. Just be Ecodroid.`;

    const chatHistoryPayload = history.slice(-6).map(m => ({
      role: m.sender === 'player' ? 'user' : 'assistant',
      content: m.text
    }));

    // Target the proxy endpoint
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistoryPayload,
          { role: 'user', content: userPrompt }
        ],
        temperature: temp,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed response: ${response.status}. ${errorText}`);
    }

    const resData = await response.json();
    return resData.choices?.[0]?.message?.content || "I'm sorry, I couldn't compute a response right now. Please try again.";
  };

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    setIsLoading(true);
    setApiError(null);

    const userMsg: BattleMessage = {
      sender: 'player',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');

    try {
      let botResponse = '';
      if (isAiActive) {
        botResponse = await callAIProxy(messageText, updatedHistory);
      } else {
        // Simple offline responses if no API keys are loaded
        botResponse = `🤖 (Offline Mode) I see you asked about "${messageText}". To get full intelligent suggestions from meta-llama, please add your NVIDIA NIM API Key to the configurations! Locally, I can tell you that reducing travel and eating plant-based meals are the fastest ways to cut down your current ${carbonBreakdown.total.toFixed(1)} tonnes of carbon emissions.`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'opponent',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An error occurred while communicating with Ecodroid.');
      setMessages(prev => [
        ...prev,
        {
          sender: 'opponent',
          text: '⚠️ Bip-bop! My connection circuits are encountering resistance (CORS or network error). Please ensure your NVIDIA API Key is valid and the serverless proxy is running.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Ecodroid AI</h1>
            <span className={`status-badge ${isAiActive ? 'live' : 'offline'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
              {isNvidiaActive ? 'NVIDIA Llama Active' : isGeminiActive ? 'Gemini Live Active' : 'Offline Mode'}
            </span>
          </div>
          <p style={{ color: 'var(--text-sub)' }}>
            Discuss carbon reductions, ask green alternatives questions, and get custom advisor guidelines.
          </p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={resetChat} aria-label="Clear chat history">
          <RefreshCw size={14} aria-hidden="true" /> Clear Chat
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', marginTop: '20px' }} className="grid-2">
        {/* Chat Log Panel */}
        <div 
          className="glass-card" 
          style={{ 
            height: '520px', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '20px',
            position: 'relative'
          }}
        >
          {apiError && (
            <div 
              style={{ 
                background: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                color: 'var(--danger)', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                marginBottom: '14px', 
                fontSize: '13px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Messages Wrapper */}
          <div 
            style={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              paddingRight: '8px',
              marginBottom: '16px'
            }}
          >
            {messages.map((msg, idx) => {
              const isPlayer = msg.sender === 'player';
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isPlayer ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    display: 'flex',
                    gap: '10px',
                    flexDirection: isPlayer ? 'row-reverse' : 'row',
                    alignItems: 'flex-start'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isPlayer ? 'var(--primary)' : 'var(--primary-glow)',
                      color: isPlayer ? '#ffffff' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    {isPlayer ? profile.settings?.avatarEmoji || '🌱' : '🤖'}
                  </div>

                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      lineHeight: 1.5,
                      fontSize: '14px',
                      background: isPlayer ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)',
                      border: isPlayer ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                      color: isPlayer ? '#ffffff' : 'var(--text-main)'
                    }}
                  >
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                    <span style={{ fontSize: '9px', color: 'var(--text-sub)', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary-glow)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0
                  }}
                >
                  🤖
                </div>
                <div style={{ color: 'var(--text-sub)', fontSize: '13px', fontStyle: 'italic' }}>
                  Ecodroid is thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Form Area */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputMessage); }}
            style={{ 
              display: 'flex', 
              gap: '12px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '16px'
            }}
          >
            <input
              id="chat-input"
              type="text"
              className="styled-input"
              style={{ flexGrow: 1, height: '44px', fontSize: '14px', paddingLeft: '16px' }}
              placeholder="Ask Ecodroid about carbon savings..."
              aria-label="Ask Ecodroid about carbon savings"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ height: '44px', width: '44px', padding: 0, justifyContent: 'center' }}
              disabled={isLoading || !inputMessage.trim()}
              aria-label="Send message to Ecodroid"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </div>

        {/* Right Info Panel & Suggested Queries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Ecodroid Configuration Display */}
          <div className="glass-card" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={16} style={{ color: 'var(--primary)' }} aria-hidden="true" /> Ecodroid Bio
            </h3>
            <p className="info-text mt-4" style={{ fontSize: '12px', lineHeight: 1.4 }}>
              Ecodroid is active under the <strong>{profile.settings?.assistantPersona || 'friendly'}</strong> persona, querying Llama 3.3 with <strong>{((profile.settings?.modelTemperature || 0.7) * 100).toFixed(0)}% creativity</strong>.
            </p>
            <p className="info-text mt-2" style={{ fontSize: '12px', lineHeight: 1.4 }}>
              It reads your carbon footprint categories dynamically to offer customized, actionable guidance. Change preferences in Settings.
            </p>
          </div>

          {/* Quick Topics */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Suggested Queries</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="option-card"
                  style={{ 
                    padding: '10px 12px', 
                    fontSize: '12px', 
                    textAlign: 'left', 
                    justifyContent: 'flex-start',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    width: '100%',
                    cursor: 'pointer',
                    color: 'var(--text-main)'
                  }}
                  disabled={isLoading}
                  onClick={() => handleSend(chip.prompt)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
