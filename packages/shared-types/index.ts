export type Language = 'en' | 'hi' | 'ta';

export type RiskProfileType = 'Conservative' | 'Moderate' | 'Aggressive' | null;

export interface User {
  name: string;
  age: number;
  income: number;
  city: string;
  occupation: string;
  accountNo: string;
  branch: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'credit' | 'debit';
  isDiscretionary?: boolean;
}

export interface DerivedMetrics {
  avgMonthlyIncome: number;
  avgMonthlyExpense: number;
  monthlySavings: number;
  recommendedBufferTopUp: number;
  investableSurplus: number;
  spendingByCategory: Record<string, number>;
  financialHealthScore: number;
  emergencyCoverageMonths: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  targetYear: number;
  status: 'Behind' | 'Building' | 'On track';
  category: 'Retirement' | 'Safety' | 'Property' | 'Education';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  riskLevel: 1 | 2 | 3;
  expectedReturn: string;
  liquidity: string;
  minInvestment: number;
  taxSaving: boolean;
  disclosure: string;
  tag?: string;
}

export interface Allocation {
  productId: string;
  productName: string;
  amount: number;
  percentage: number;
  rationale: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  event: string;
  category: 'Risk' | 'Advice' | 'Consent' | 'System';
  details?: string;
  hash: string;
}

export interface ChatMessage {
  id: string;
  sender: 'arthai' | 'user';
  text: string;
  timestamp: string;
  rationale?: string;
  suitabilityNote?: string;
  disclosure?: string;
  recommendedProductId?: string;
}

export interface Appointment {
  id: string;
  type: 'Video Call' | 'Branch Visit';
  date: string;
  time: string;
  branch: string;
  advisorName: string;
  status: 'Confirmed' | 'Pending';
}

export type Screen = 'onboarding-lang' | 'onboarding-risk' | 'home' | 'arthai' | 'plan' | 'activity' | 'profile';

export type Tab = 'home' | 'arthai' | 'plan' | 'activity';

export interface AppState {
  screen: Screen;
  activeTab: Tab;
  viewMode: 'phone' | 'full';
  user: User;
  language: Language;
  riskProfile: RiskProfileType;
  consentGiven: boolean;
  transactions: Transaction[];
  derivedMetrics: DerivedMetrics;
  goals: Goal[];
  productCatalog: Product[];
  recommendations: Allocation[];
  auditLog: AuditEntry[];
  chatMessages: ChatMessage[];
  onboardingAnswers: Record<string, string>;
  riskScore: number;
  planConsented: boolean;
  appointment: Appointment | null;
}

export type AppAction =
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'TOGGLE_VIEW_MODE' }
  | { type: 'SET_ONBOARDING_ANSWER'; questionId: string; answer: string }
  | { type: 'SET_RISK_PROFILE'; profile: RiskProfileType; score: number }
  | { type: 'SET_CONSENT'; consent: boolean }
  | { type: 'SET_PLAN_CONSENT'; consent: boolean }
  | { type: 'ADD_AUDIT_ENTRY'; event: string; category?: 'Risk' | 'Advice' | 'Consent' | 'System'; details?: string }
  | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'SET_RECOMMENDATIONS'; recommendations: Allocation[] }
  | { type: 'BOOK_APPOINTMENT'; appointment: Appointment }
  | { type: 'RESTART' };
