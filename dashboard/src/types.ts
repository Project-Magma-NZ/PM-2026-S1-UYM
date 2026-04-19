export type View = 'login' | 'monthly' | 'yearly';

export interface KPIData {
  label: string;
  value: string | number;
  change?: string;
  isNew?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export interface AgeDemographic {
  age: string;
  meta: number;
  google: number;
}

export interface GenderData {
  name: string;
  value: number;
  color: string;
}

export interface CountryReach {
  name: string;
  percentage: number;
}

export interface AgeGroup {
  label: string;
  value: string;
  change: string;
  color: string;
}

export interface Region {
  label: string;
  percentage: number;
}

export interface YearlySummaryData {
  livesImpacted: string;
  livesImpactedChange: string;
  activeMatches: string;
  matchesGoalPercent: number;
  mentorRetention: string;
}
