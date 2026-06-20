import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, RotateCcw, AlertTriangle, Check, ArrowLeft, 
  Sparkles, Award, Gauge, Activity, MessageSquare
} from 'lucide-react';
import type { UserProfile, BattleMessage, PromptOpponent, PromptWarsState } from '../types';
import { GEMINI_API_KEY } from '../config';

interface PromptWarsProps {
  profile: UserProfile;
  onUpdatePoints: (pointsGained: number) => void;
  onAddAchievement: (achievementId: string) => void;
  onUpdatePromptWarsState: (state: PromptWarsState) => void;
}

const OPPONENTS_TEMPLATE: PromptOpponent[] = [
  {
    id: 'sam',
    name: 'SUV Sam',
    avatar: '🚗',
    difficulty: 'Easy',
    startingEmissions: 8.5,
    targetEmissions: 2.5,
    currentEmissions: 8.5,
    resistance: 80,
    bio: 'Sam is extremely proud of his gas-guzzling V8 pickup truck. He thinks cycling is slow, buses are crowded, and electric cars are glorified toys.',
    startingDialog: "Hey there! Don't tell me I need to give up my truck. This beast is my pride and joy, and those electric car batteries are just mining disasters anyway!"
  },
  {
    id: 'carl',
    name: 'Coal-Grid Carl',
    avatar: '🏭',
    difficulty: 'Medium',
    startingEmissions: 12.0,
    targetEmissions: 4.0,
    currentEmissions: 12.0,
    resistance: 90,
    bio: 'Carl runs a casting foundry powered entirely by local coal energy. He thinks solar panels are a high-maintenance fad that will bankrupt his business.',
    startingDialog: "Listen, kid, I have payroll to meet. Solar energy isn't reliable for heavy industrial furnaces, and I'm not spending a million bucks on battery storage to look green."
  },
  {
    id: 'fiona',
    name: 'Fast-Fashion Fiona',
    avatar: '👗',
    difficulty: 'Hard',
    startingEmissions: 6.5,
    targetEmissions: 1.8,
    currentEmissions: 6.5,
    resistance: 95,
    bio: 'Fiona is a style influencer who buys 20 new fast-fashion items a week for her haul videos. She throws them out when trends change.',
    startingDialog: "Oh my god, my followers expect new outfit inspiration every single day! I can't just wear thrift store clothes—they look dusty and aren't aesthetic at all."
  },
  {
    id: 'stan',
    name: 'Steak-Lover Stan',
    avatar: '🥩',
    difficulty: 'Expert',
    startingEmissions: 4.5,
    targetEmissions: 1.2,
    currentEmissions: 4.5,
    resistance: 100,
    bio: 'Stan believes a meal isn\'t a meal without a massive ribeye steak. He thinks plant-based meat is a chemical scam and organic veggies are just expensive grass.',
    startingDialog: "Real men eat beef. I've eaten a steak every single night of my life, and no plant-based burger is ever going to satisfy me. Vegetarian food is just bunny fuel!"
  }
];

const CARDS_TEMPLATE = [
  {
    id: 'science',
    name: 'Fact Check Blast',
    description: 'Injects hard scientific data, reducing opponent resistance by 1.5x.',
    cost: 50,
    icon: '📊'
  },
  {
    id: 'finance',
    name: 'Economic Incentive',
    description: 'Highlights long-term savings and ROI, boosting carbon reduction by 1.5x.',
    cost: 50,
    icon: '💰'
  },
  {
    id: 'empathy',
    name: 'Emotional Appeal',
    description: 'Speaks of future generations, health, and family, cutting emissions by an extra +1.0t.',
    cost: 50,
    icon: '❤️'
  }
];

export const PromptWars: React.FC<PromptWarsProps> = ({ 
  profile, 
  onUpdatePoints, 
  onAddAchievement,
  onUpdatePromptWarsState 
}) => {
  const [activeOpponent, setActiveOpponent] = useState<PromptOpponent | null>(null);
  const [messages, setMessages] = useState<BattleMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [turns, setTurns] = useState<number>(0);
  const [maxTurns] = useState<number>(3);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [battleOutcome, setBattleOutcome] = useState<'victory' | 'defeat' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coachFeedback, setCoachFeedback] = useState<string>('');
  const apiKey = GEMINI_API_KEY;
  const [apiError, setApiError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat log when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initializing state variables safety check
  const state: PromptWarsState = profile.promptWarsState || {
    completedOpponents: [],
    highScores: {},
    purchasedCards: []
  };

  const handleSelectOpponent = (opponent: PromptOpponent) => {
    // Reset battle variables
    const initializedOpponent = {
      ...opponent,
      currentEmissions: opponent.startingEmissions,
      resistance: opponent.resistance
    };
    setActiveOpponent(initializedOpponent);
    setMessages([
      { sender: 'opponent', text: opponent.startingDialog, timestamp: new Date().toLocaleTimeString() }
    ]);
    setTurns(0);
    setSelectedCard(null);
    setBattleOutcome(null);
    setCoachFeedback('');
    setApiError(null);
  };

  const handleBackToSelect = () => {
    setActiveOpponent(null);
    setMessages([]);
    setBattleOutcome(null);
    setCoachFeedback('');
  };

  // Card Purchase mechanic
  const handleBuyCard = (cardId: string, cost: number) => {
    if (profile.totalPoints < cost) return;
    
    const updatedCards = [...state.purchasedCards, cardId];
    onUpdatePoints(-cost);
    onUpdatePromptWarsState({
      ...state,
      purchasedCards: updatedCards
    });
  };

  // Local Keyword-based Persuasion Engine
  const runLocalSimulation = (opponentId: string, prompt: string, cardId: string | null) => {
    const cleanPrompt = prompt.toLowerCase();
    let emissionsDrop = 0.5;
    let resistanceDrop = 5;
    let reply = "";
    let feedback = "";

    // Card boosts application
    const isScience = cardId === 'science';
    const isFinance = cardId === 'finance';
    const isEmpathy = cardId === 'empathy';

    if (opponentId === 'sam') {
      if (cleanPrompt.includes('electric') || cleanPrompt.includes('ev') || cleanPrompt.includes('battery') || cleanPrompt.includes('hybrid')) {
        reply = "Electric cars? I guess some models have high torque and acceleration. It would definitely save me trips to the gas station. Maybe I'll test drive one.";
        emissionsDrop = 2.0;
        resistanceDrop = 20;
      } else if (cleanPrompt.includes('transit') || cleanPrompt.includes('bus') || cleanPrompt.includes('subway') || cleanPrompt.includes('train') || cleanPrompt.includes('cycle') || cleanPrompt.includes('bike')) {
        reply = "Commuting on a bicycle seems tough for long distances, but maybe I could cycle to the local gym or park instead of driving. Or carpool on Thursdays.";
        emissionsDrop = 1.4;
        resistanceDrop = 15;
      } else if (cleanPrompt.includes('money') || cleanPrompt.includes('gas') || cleanPrompt.includes('wallet') || cleanPrompt.includes('save') || cleanPrompt.includes('cost')) {
        reply = "Gas prices are absolutely brutal right now. If I swapped for a hybrid, I'd cut my weekly fuel bill in half. That makes a lot of financial sense.";
        emissionsDrop = 2.2;
        resistanceDrop = 25;
      } else if (cleanPrompt.includes('kid') || cleanPrompt.includes('future') || cleanPrompt.includes('asthma') || cleanPrompt.includes('air') || cleanPrompt.includes('pollution') || cleanPrompt.includes('health')) {
        reply = "You know, tailpipe pollution does mess up the air quality for kids in our neighborhood. I didn't think about that. I should stop idling the engine.";
        emissionsDrop = 1.8;
        resistanceDrop = 20;
      } else {
        reply = "Well, that's easy to say, but my truck makes me feel secure. I need something practical, not just carbon-saving fluff.";
        emissionsDrop = 0.6;
        resistanceDrop = 5;
      }
      feedback = cleanPrompt.includes('gas') || cleanPrompt.includes('money') 
        ? "Excellent focus on Sam's pocketbook! Financial incentives are highly effective for truck owners." 
        : "Good attempt. Trying to connect your argument directly to daily operations, health, or technology yield best results.";
    } 
    else if (opponentId === 'carl') {
      if (cleanPrompt.includes('roi') || cleanPrompt.includes('money') || cleanPrompt.includes('cost') || cleanPrompt.includes('profit') || cleanPrompt.includes('save') || cleanPrompt.includes('finance') || cleanPrompt.includes('subsidy') || cleanPrompt.includes('tax')) {
        reply = "ROI? If there are government tax write-offs that cover 30% of solar installation, and my grid costs drop permanently... my profit margins would expand. Let me check those numbers.";
        emissionsDrop = 2.8;
        resistanceDrop = 25;
      } else if (cleanPrompt.includes('battery') || cleanPrompt.includes('storage') || cleanPrompt.includes('reliable') || cleanPrompt.includes('backup') || cleanPrompt.includes('generator')) {
        reply = "A battery storage bank? Yes, having clean backup power during grid blackouts would protect our machinery from sudden halts. That solves my reliability doubt.";
        emissionsDrop = 2.0;
        resistanceDrop = 15;
      } else if (cleanPrompt.includes('coal') || cleanPrompt.includes('pollution') || cleanPrompt.includes('toxic') || cleanPrompt.includes('health') || cleanPrompt.includes('safety') || cleanPrompt.includes('employees')) {
        reply = "I do care about my workers. Coal smoke is rough on lungs, and cleaner air would reduce employee sick leave. But I need to see if we can afford the capital expense.";
        emissionsDrop = 1.5;
        resistanceDrop = 12;
      } else {
        reply = "Polar bears and climate reports don't cover my payroll. Unless there's a clear economic benefit, coal keeps this foundry profitable.";
        emissionsDrop = 0.5;
        resistanceDrop = 5;
      }
      feedback = cleanPrompt.includes('roi') || cleanPrompt.includes('money')
        ? "Perfect! Carl is a business owner; highlighting tax credits and return on investment broke his defenses."
        : "Moderate response. Try focusing heavily on financial savings or grid reliability using backup battery modules.";
    }
    else if (opponentId === 'fiona') {
      if (cleanPrompt.includes('thrift') || cleanPrompt.includes('vintage') || cleanPrompt.includes('secondhand') || cleanPrompt.includes('unique') || cleanPrompt.includes('aesthetic') || cleanPrompt.includes('style')) {
        reply = "Wait, vintage thrift finds are actually blowing up on TikTok! A 'Thrift Styling Challenge' could look super unique and drive massive organic engagement. I love that vibe!";
        emissionsDrop = 1.8;
        resistanceDrop = 20;
      } else if (cleanPrompt.includes('brand') || cleanPrompt.includes('ethical') || cleanPrompt.includes('cancel') || cleanPrompt.includes('reputation') || cleanPrompt.includes('pr') || cleanPrompt.includes('authentic')) {
        reply = "True, some of these ultra-fast-fashion brands are getting major backlash online. Partnering with ethical, slow-fashion designers would definitely secure my brand reputation.";
        emissionsDrop = 2.2;
        resistanceDrop = 25;
      } else if (cleanPrompt.includes('capsule') || cleanPrompt.includes('wardrobe') || cleanPrompt.includes('durable') || cleanPrompt.includes('quality')) {
        reply = "A capsule wardrobe series? Explaining how to style 10 high-quality sustainable items in 30 different ways is actually great content. It shows style expertise!";
        emissionsDrop = 1.6;
        resistanceDrop = 15;
      } else {
        reply = "I hear you, but my followers will unfollow if I wear the exact same look in every video. Shopping hauls get the most views.";
        emissionsDrop = 0.4;
        resistanceDrop = 5;
      }
      feedback = cleanPrompt.includes('thrift') || cleanPrompt.includes('aesthetic')
        ? "Excellent strategy! Influencers care about brand aesthetic and user engagement. Vintage styling is a direct win."
        : "Okay try. Try using keywords like 'PR reputation', 'vintage aesthetic', or 'capsule wardrobe' to align with her content goals.";
    }
    else if (opponentId === 'stan') {
      if (cleanPrompt.includes('monday') || cleanPrompt.includes('once a week') || cleanPrompt.includes('reduce') || cleanPrompt.includes('step') || cleanPrompt.includes('try')) {
        reply = "Meatless Mondays? Just one day a week doesn't sound too bad. I guess I could grill a portobello burger or try a spicy vegetarian bean chili. It is a start.";
        emissionsDrop = 1.2;
        resistanceDrop = 20;
      } else if (cleanPrompt.includes('heart') || cleanPrompt.includes('cholesterol') || cleanPrompt.includes('health') || cleanPrompt.includes('arteries') || cleanPrompt.includes('doctor') || cleanPrompt.includes('stroke') || cleanPrompt.includes('live')) {
        reply = "Well, my doctor did tell me my cholesterol is off the charts. Heart disease runs in my family, and I'd like to stay alive to watch my kids grow. I might need to cut back.";
        emissionsDrop = 1.6;
        resistanceDrop = 25;
      } else if (cleanPrompt.includes('taste') || cleanPrompt.includes('burger') || cleanPrompt.includes('impossible') || cleanPrompt.includes('beyond') || cleanPrompt.includes('blind') || cleanPrompt.includes('marinade')) {
        reply = "I doubt plant-based meat tastes like a real ribeye, but I've heard some restaurants serve blind taste tests where people can't tell. Maybe I'll buy one to test my palate.";
        emissionsDrop = 1.0;
        resistanceDrop = 15;
      } else {
        reply = "No chance. I'm a meat man. Real food comes from the grill. I'm not eating boring salads for the rest of my life.";
        emissionsDrop = 0.3;
        resistanceDrop = 5;
      }
      feedback = cleanPrompt.includes('cholesterol') || cleanPrompt.includes('monday')
        ? "Superb! Offering a small compromise ('Meatless Mondays') or raising cardiovascular health issues bypassed Stan's meat bias."
        : "Hard opponent. Try suggesting cardiovascular health concerns, plant-based taste tests, or a simple once-a-week reduction.";
    }

    // Apply cards multiplier
    if (isScience) {
      resistanceDrop = Math.min(100, Math.round(resistanceDrop * 1.5));
    }
    if (isFinance) {
      emissionsDrop = Number((emissionsDrop * 1.5).toFixed(2));
    }
    if (isEmpathy) {
      emissionsDrop = Number((emissionsDrop + 1.0).toFixed(2));
    }

    return {
      reply,
      emissionsDrop,
      resistanceDrop,
      feedback
    };
  };

  // Gemini Live AI Persuasion Battle Request
  const runGeminiLiveAI = async (
    opponent: PromptOpponent, 
    prompt: string, 
    chatHistory: BattleMessage[], 
    cardId: string | null
  ) => {
    if (!apiKey) throw new Error("API Key is missing");

    const cardDetails = cardId 
      ? CARDS_TEMPLATE.find(c => c.id === cardId) 
      : null;
    const cardInstruction = cardDetails 
      ? `\nModifier applied: User activated a '${cardDetails.name}' card which has the effect: '${cardDetails.description}'. Incorporate this impact (e.g. drop emissions/resistance more if prompt matches the theme).`
      : "";

    // Format chat history
    const historyString = chatHistory
      .slice(-4)
      .map(m => `${m.sender === 'player' ? 'Eco-Champion' : 'Opponent'}: "${m.text}"`)
      .join('\n');

    const systemPrompt = `You are simulating a text message battle for a game called Prompt Wars. The user is playing as an Eco-Champion trying to convince you, ${opponent.name}, to reduce your carbon footprint.
Your profile:
- Bio: ${opponent.bio}
- Starting Resistance: ${opponent.resistance}%
- Current Carbon Emissions: ${opponent.currentEmissions} tonnes CO2e per year.
${cardInstruction}

Here is the conversation history:
${historyString}

Here is the user's new prompt message:
"${prompt}"

Analyze the user's message. Assess if their argument addresses your character's worries (e.g. financial returns for Carl, brand aesthetics for Fiona, cholesterol/small steps for Stan, gas prices/health for Sam).

Provide your response strictly in the following JSON format, with no markdown tags or wrapper lines:
{
  "reply": "Your dialogue response as the character, reacting to the user (max 3 sentences). Keep it highly in-character.",
  "emissionsDrop": [A float representing carbon footprint reduction, range 0.1 to 3.5],
  "resistanceDrop": [An integer representing how much resistance was lowered, range 2 to 30],
  "feedback": "A one-sentence analytical review from the 'Eco-Coach' advising the player on their prompt engineering tactic."
}`;

    // POST request to Gemini Beta endpoint
    // Using gemini-2.5-flash as it supports JSON output natively
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}. Please check your key or try later.`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("No content received from Gemini model.");
    }

    // Parse structured JSON
    const parsed = JSON.parse(resultText.trim());
    return {
      reply: parsed.reply || "I guess you have a point, but I'm still skeptical.",
      emissionsDrop: Number(parsed.emissionsDrop) || 0.5,
      resistanceDrop: Number(parsed.resistanceDrop) || 5,
      feedback: parsed.feedback || "Your prompt has been sent. Try adapting to the opponent's values."
    };
  };

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || !activeOpponent || battleOutcome) return;

    setIsLoading(true);
    setApiError(null);

    const userMessage: BattleMessage = {
      sender: 'player',
      text: inputPrompt,
      timestamp: new Date().toLocaleTimeString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');

    let simResult;

    try {
      if (apiKey) {
        // Run Gemini Live call
        simResult = await runGeminiLiveAI(activeOpponent, inputPrompt, newMessages, selectedCard);
      } else {
        // Run offline keyword engine
        simResult = runLocalSimulation(activeOpponent.id, inputPrompt, selectedCard);
      }

      // De-escalate active opponent metrics
      const newEmissions = Math.max(
        activeOpponent.targetEmissions,
        Number((activeOpponent.currentEmissions - simResult.emissionsDrop).toFixed(2))
      );
      const newResistance = Math.max(0, activeOpponent.resistance - simResult.resistanceDrop);

      const nextTurns = turns + 1;
      setTurns(nextTurns);

      setCoachFeedback(simResult.feedback);

      const responseMessage: BattleMessage = {
        sender: 'opponent',
        text: simResult.reply,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, responseMessage]);

      const updatedOpponent = {
        ...activeOpponent,
        currentEmissions: newEmissions,
        resistance: newResistance
      };
      setActiveOpponent(updatedOpponent);

      // Check for battle outcome
      if (newEmissions <= activeOpponent.targetEmissions) {
        // VICTORY!
        setBattleOutcome('victory');
        handleBattleEnd(true, updatedOpponent, nextTurns);
      } else if (nextTurns >= maxTurns) {
        // DEFEAT!
        setBattleOutcome('defeat');
        handleBattleEnd(false, updatedOpponent, nextTurns);
      }

      // Consume card
      if (selectedCard) {
        const updatedPurchased = state.purchasedCards.filter((_, idx) => {
          const firstIndex = state.purchasedCards.indexOf(selectedCard);
          return idx !== firstIndex;
        });
        onUpdatePromptWarsState({
          ...state,
          purchasedCards: updatedPurchased
        });
        setSelectedCard(null);
      }

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to contact Gemini AI. Running offline heuristics check instead...");
      
      // Fallback immediately to local engine on error
      const localResult = runLocalSimulation(activeOpponent.id, inputPrompt, selectedCard);
      
      const newEmissions = Math.max(
        activeOpponent.targetEmissions,
        Number((activeOpponent.currentEmissions - localResult.emissionsDrop).toFixed(2))
      );
      const newResistance = Math.max(0, activeOpponent.resistance - localResult.resistanceDrop);

      const nextTurns = turns + 1;
      setTurns(nextTurns);
      setCoachFeedback(localResult.feedback);

      setMessages(prev => [...prev, {
        sender: 'opponent',
        text: localResult.reply + " (API Offline - Simulated Response)",
        timestamp: new Date().toLocaleTimeString()
      }]);

      const updatedOpponent = {
        ...activeOpponent,
        currentEmissions: newEmissions,
        resistance: newResistance
      };
      setActiveOpponent(updatedOpponent);

      if (newEmissions <= activeOpponent.targetEmissions) {
        setBattleOutcome('victory');
        handleBattleEnd(true, updatedOpponent, nextTurns);
      } else if (nextTurns >= maxTurns) {
        setBattleOutcome('defeat');
        handleBattleEnd(false, updatedOpponent, nextTurns);
      }

      if (selectedCard) {
        const updatedPurchased = state.purchasedCards.filter((_, idx) => {
          const firstIndex = state.purchasedCards.indexOf(selectedCard);
          return idx !== firstIndex;
        });
        onUpdatePromptWarsState({
          ...state,
          purchasedCards: updatedPurchased
        });
        setSelectedCard(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBattleEnd = (isVictory: boolean, opponent: PromptOpponent, turnCount: number) => {
    if (isVictory) {
      // Award XP Points
      onUpdatePoints(150);

      // Save highscore
      const oldHighScore = state.highScores[opponent.id] || 999;
      const newHighScore = Math.min(oldHighScore, turnCount);

      const newCompleted = state.completedOpponents.includes(opponent.id)
        ? state.completedOpponents
        : [...state.completedOpponents, opponent.id];

      onUpdatePromptWarsState({
        ...state,
        completedOpponents: newCompleted,
        highScores: {
          ...state.highScores,
          [opponent.id]: newHighScore
        }
      });

      // Award achievement
      onAddAchievement('ac_negotiator'); // Custom negotiation award
      if (newCompleted.length === OPPONENTS_TEMPLATE.length) {
        onAddAchievement('ac_diplomat'); // Defeated all 4
      }
      if (turnCount === 1) {
        onAddAchievement('ac_master_persuader'); // Defeated on turn 1
      }
    }
  };

  return (
    <div className="main-content">
      {!activeOpponent ? (
        // Opponent Selection view
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Prompt Arena</h1>
              <p style={{ color: 'var(--text-sub)' }}>
                Test your prompt engineering skills! Convince carbon-heavy characters to change their lifestyle.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className={`status-badge ${apiKey ? 'live' : 'offline'}`}>
                <Sparkles size={14} /> {apiKey ? 'Gemini Live Active' : 'Offline Simulator Mode'}
              </span>
            </div>
          </div>

          {/* Grid of Opponents */}
          <h3 className="mb-4">Select Your Persuasion Opponent</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {OPPONENTS_TEMPLATE.map(opp => {
              const defeated = state.completedOpponents.includes(opp.id);
              const bestTurns = state.highScores[opp.id];
              return (
                <div key={opp.id} className={`glass-card opponent-card ${defeated ? 'defeated-border' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ fontSize: '48px' }}>{opp.avatar}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span className={`difficulty-tag ${opp.difficulty.toLowerCase()}`}>
                        {opp.difficulty}
                      </span>
                      {defeated && (
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={12} /> Defeated ({bestTurns} turns)
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>{opp.name}</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Starting Footprint: <strong>{opp.startingEmissions}t CO₂e/yr</strong>
                  </p>
                  <p className="info-text mb-6" style={{ fontSize: '13px', minHeight: '60px' }}>
                    {opp.bio}
                  </p>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleSelectOpponent(opp)}
                  >
                    Enter Arena &rarr;
                  </button>
                </div>
              );
            })}
          </div>

          {/* Modifiers Marketplace Panel */}
          <div className="glass-card mt-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Award size={22} style={{ color: 'var(--primary)' }} />
              <h3>Unlock Persuasion Modifier Cards</h3>
            </div>
            <p className="info-text mb-6">
              Spend your earned Eco XP points to acquire modifier cards. Activate them during battles to bypass resistance or slash carbon footprints further!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {CARDS_TEMPLATE.map(card => {
                const count = state.purchasedCards.filter(c => c === card.id).length;
                const canAfford = profile.totalPoints >= card.cost;
                return (
                  <div key={card.id} className="card-item" style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>{card.icon}</span>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 600 }}>
                          Owned: {count}
                        </span>
                      </div>
                      <h4 style={{ margin: '8px 0 4px 0', fontSize: '16px' }}>{card.name}</h4>
                      <p className="info-text" style={{ fontSize: '12px' }}>{card.description}</p>
                    </div>

                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '13px', padding: '6px 12px', justifyContent: 'center' }}
                      disabled={!canAfford}
                      onClick={() => handleBuyCard(card.id, card.cost)}
                    >
                      Buy for {card.cost} XP
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        // Battle Arena view
        <>
          {/* Battle Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <button className="btn btn-secondary" onClick={handleBackToSelect}>
              <ArrowLeft size={16} /> Leave Arena
            </button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className={`status-badge ${apiKey ? 'live' : 'offline'}`}>
                {apiKey ? 'Gemini AI Connection Active' : 'Offline Engine'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '24px', marginTop: '16px' }} className="battle-arena-grid">
            
            {/* Left Column: Opponent Stats & Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Opponent Profile Card */}
              <div className="glass-card text-center" style={{ padding: '20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '8px' }}>{activeOpponent.avatar}</div>
                <h3 style={{ fontSize: '22px' }}>{activeOpponent.name}</h3>
                <span className={`difficulty-tag ${activeOpponent.difficulty.toLowerCase()}`} style={{ margin: '4px auto' }}>
                  {activeOpponent.difficulty}
                </span>
                
                <p className="info-text mt-4" style={{ fontSize: '12px', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <strong>Bio:</strong> {activeOpponent.bio}
                </p>
              </div>

              {/* Persuasion HUD Gauges */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3>Persuasion HUD</h3>
                
                {/* Emissions target bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Gauge size={12} /> Footprint</span>
                    <strong>{activeOpponent.currentEmissions}t CO₂e</strong>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div 
                      style={{ 
                        width: `${Math.max(0, Math.min(100, (activeOpponent.currentEmissions / activeOpponent.startingEmissions) * 100))}%`, 
                        height: '100%', 
                        background: activeOpponent.currentEmissions <= activeOpponent.targetEmissions ? 'var(--primary)' : 'var(--danger)', 
                        transition: 'width 0.4s ease-out' 
                      }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-sub)', marginTop: '4px' }}>
                    <span>Target: {activeOpponent.targetEmissions}t</span>
                    <span>Start: {activeOpponent.startingEmissions}t</span>
                  </div>
                </div>

                {/* Resistance Gauge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12} /> Resistance</span>
                    <strong style={{ color: activeOpponent.resistance > 50 ? 'var(--warning)' : 'var(--primary)' }}>
                      {activeOpponent.resistance}%
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div 
                      style={{ 
                        width: `${activeOpponent.resistance}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, var(--secondary), var(--warning))',
                        transition: 'width 0.4s ease-out' 
                      }} 
                    />
                  </div>
                </div>

                {/* Turns tracker */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <span>Turn Count:</span>
                  <strong>{turns} of {maxTurns}</strong>
                </div>
              </div>

              {/* Active Modifiers Selection */}
              <div className="glass-card">
                <h3>Select Prompt Boost Card</h3>
                <p className="info-text mb-4" style={{ fontSize: '11px' }}>Apply a purchased card to supercharge your next message input.</p>
                
                {state.purchasedCards.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                    No cards in inventory. Buy cards in the marketplace!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {CARDS_TEMPLATE.map(card => {
                      const count = state.purchasedCards.filter(c => c === card.id).length;
                      if (count === 0) return null;
                      
                      const isSelected = selectedCard === card.id;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          className={`option-card ${isSelected ? 'selected' : ''}`}
                          style={{ padding: '8px 12px', flexDirection: 'row', gap: '8px', alignItems: 'center', width: '100%' }}
                          onClick={() => setSelectedCard(isSelected ? null : card.id)}
                        >
                          <span style={{ fontSize: '20px' }}>{card.icon}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{card.name} ({count})</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-sub)' }}>{card.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Chat Logs & Input area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Chat Log Window */}
              <div className="glass-card chat-box-wrapper" style={{ height: '420px', display: 'flex', flexDirection: 'column', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '14px' }}>
                  <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Eco-Persuasion Log</span>
                </div>

                <div className="chat-messages-container" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '8px' }}>
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`chat-bubble ${msg.sender}`}
                      style={{ 
                        alignSelf: msg.sender === 'player' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        lineHeight: 1.4,
                        fontSize: '14px',
                        background: msg.sender === 'player' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.04)',
                        border: msg.sender === 'player' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                        color: msg.sender === 'player' ? '#ffffff' : 'var(--text-main)'
                      }}
                    >
                      <p style={{ margin: 0 }}>{msg.text}</p>
                      <span style={{ fontSize: '9px', color: 'var(--text-sub)', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                        {msg.timestamp}
                      </span>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="chat-bubble opponent loading" style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px' }}>
                      <span className="spinner-dots">Opponent is typing...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Warning/API Alert banner if API fails */}
              {apiError && (
                <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: '#ffffff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Input prompt field */}
              {!battleOutcome ? (
                <form onSubmit={handleSendPrompt} className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <textarea
                      className="styled-input"
                      style={{ flexGrow: 1, minHeight: '60px', maxHeight: '120px', fontSize: '14px', padding: '10px 14px', resize: 'none', fontFamily: 'var(--font-body)' }}
                      value={inputPrompt}
                      onChange={(e) => setInputPrompt(e.target.value)}
                      placeholder={`Draft your message to ${activeOpponent.name}. Focus on their specific values!`}
                      disabled={isLoading}
                      required
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ padding: '0 24px', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      disabled={isLoading || !inputPrompt.trim()}
                    >
                      {isLoading ? 'Processing...' : <><Send size={16} /> Send</>}
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-sub)', marginTop: '8px' }}>
                    <span>Tips: Mention financial ROI for Carl, thrifting for Fiona, medical health for Stan.</span>
                    <span>Characters: {inputPrompt.length}</span>
                  </div>
                </form>
              ) : (
                // Battle Outcome screens
                <div className={`glass-card outcome-card ${battleOutcome}`} style={{ 
                  padding: '32px', 
                  textAlign: 'center',
                  border: battleOutcome === 'victory' ? '2px solid var(--primary)' : '2px solid var(--danger)',
                  boxShadow: battleOutcome === 'victory' ? '0 0 24px rgba(16,185,129,0.15)' : '0 0 24px rgba(239,68,68,0.15)'
                }}>
                  {battleOutcome === 'victory' ? (
                    <>
                      <Award size={48} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                      <h2 style={{ color: 'var(--primary)', fontSize: '28px' }}>Persuasion Successful!</h2>
                      <p className="info-text mb-6">
                        Amazing! You succeeded in lowering {activeOpponent.name}'s carbon footprint to the green target.
                      </p>
                      <div className="victory-reward mb-6" style={{ background: 'var(--primary-glow)', display: 'inline-block', padding: '10px 24px', borderRadius: '12px', fontWeight: 800, color: '#ffffff', fontSize: '20px' }}>
                        +150 XP Points Awarded
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '12px' }} />
                      <h2 style={{ color: 'var(--danger)', fontSize: '28px' }}>Opponent Unconvinced</h2>
                      <p className="info-text mb-6">
                        You ran out of communication turns. {activeOpponent.name}'s carbon footprint is still too high.
                      </p>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={handleBackToSelect}>
                      Exit to Selection
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSelectOpponent(activeOpponent)}>
                      <RotateCcw size={16} /> Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Coach Feedback Panel */}
              {coachFeedback && (
                <div className="glass-card" style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                  <h4 style={{ color: 'var(--secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Sparkles size={14} /> AI Eco-Coach Review
                  </h4>
                  <p style={{ fontSize: '13px', margin: 0 }}>{coachFeedback}</p>
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
};
