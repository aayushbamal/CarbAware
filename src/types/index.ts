export interface CarbonData {
  // Transportation
  commuteMode: 'car_petrol' | 'car_diesel' | 'car_electric' | 'transit' | 'bicycle_walk';
  weeklyCommuteKm: number;
  yearlyFlights: number; // short-haul flights < 3 hours
  yearlyLongFlights: number; // long-haul flights > 3 hours

  // Home Energy
  electricitySource: 'grid_coal' | 'grid_mixed' | 'solar_renewable';
  monthlyElectricBill: number; // in local currency (estimate)
  heatingFuel: 'natural_gas' | 'electricity' | 'heating_oil' | 'wood';
  homeSizeSqM: number;

  // Diet & Waste
  dietType: 'heavy_meat' | 'moderate_meat' | 'vegetarian' | 'vegan';
  foodWasteLevel: 'low' | 'medium' | 'high';
  recyclingHabits: 'all' | 'some' | 'none';
  shoppingFrequency: 'rarely' | 'average' | 'frequently'; // lifestyle buying
}

export interface HistoricalCalculation {
  id: string;
  date: string;
  totalEmissions: number; // in metric tonnes CO2e / year
  breakdown: {
    transport: number;
    homeEnergy: number;
    diet: number;
    wasteShopping: number;
  };
}

export interface DailyHabit {
  id: string;
  name: string;
  category: 'transport' | 'energy' | 'diet' | 'waste';
  co2SavedKg: number; // CO2 saved per execution
  points: number;
  completed: boolean;
  streak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string; // Emoji representing badge
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
}
export interface UserProfile {
  name: string;
  onboarded: boolean;
  currentData: CarbonData | null;
  history: HistoricalCalculation[];
  habits: DailyHabit[];
  achievements: Achievement[];
  totalPoints: number;
  streakCount: number;
  lastCheckedDate: string | null;
  theme: 'forest' | 'ocean' | 'solar';
  offsetTonnes: number; // Tracks purchased carbon offsets (tonnes CO2e)
  promptWarsState?: PromptWarsState;
}

export interface BattleMessage {
  sender: 'player' | 'opponent' | 'coach';
  text: string;
  timestamp: string;
}

export interface PromptOpponent {
  id: string;
  name: string;
  avatar: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  startingEmissions: number;
  targetEmissions: number;
  currentEmissions: number;
  resistance: number; // 0 to 100
  bio: string;
  startingDialog: string;
}

export interface PromptWarsState {
  completedOpponents: string[]; // List of opponent IDs defeated
  highScores: Record<string, number>; // opponentId -> fewest turns or lowest emissions
  purchasedCards: string[]; // Purchased modifier cards (e.g. 'science', 'finance', 'future')
}

