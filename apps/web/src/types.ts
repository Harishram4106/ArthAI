export type Language = 'en' | 'hi' | 'ta';

export type RiskProfileType = 'Conservative' | 'Moderate' | 'Aggressive' | 'Very Aggressive';

export interface User {
  id: string;
  email: string;
  name?: string;
  profile?: any;
  [key: string]: any;
}

export type Tab = string;

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: string;
  category: string;
  [key: string]: any;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  [key: string]: any;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  expectedReturn: any;
  riskLevel: any;
  disclosure: string;
  [key: string]: any;
}

export interface Allocation {
  productId: string;
  percentage: number;
  amount: number;
  rationale: string;
  product?: Product;
  [key: string]: any;
}

export interface AuditEntry {
  id: string;
  event: string;
  category: string;
  details: any;
  createdAt: string;
  hash: string;
  [key: string]: any;
}

export interface AppState {
  token: string | null;
  user: User | null;
  language: Language;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  [key: string]: any;
}

export interface AppAction {
  type: string;
  [key: string]: any;
}
