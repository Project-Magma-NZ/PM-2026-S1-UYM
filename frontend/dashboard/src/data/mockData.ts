import { KPIData, AgeDemographic, GenderData, CountryReach, AgeGroup, Region, YearlySummaryData } from '../types';

// =============================================================================
// MOCK DATA — All data in the app lives here. Replace each export with a real
// API call when you're ready to connect live data.
//
// HOW TO INTEGRATE REAL DATA:
// 1. Create src/services/analytics.ts — put your fetch/axios calls there
// 2. In each component, replace the import with a useEffect or React Query hook:
//
//    const [data, setData] = useState<KPIData[]>([]);
//    useEffect(() => {
//      fetch('/api/monthly-kpis').then(r => r.json()).then(setData);
//    }, []);
//
//    Or with React Query (recommended — handles loading/error states):
//    const { data } = useQuery({ queryKey: ['monthly-kpis'], queryFn: fetchMonthlyKpis });
// =============================================================================


// --- Monthly Stats ---

// REPLACE: Pull from Meta Ads API + Google Analytics
export const MONTHLY_KPIS: KPIData[] = [
  { label: 'TOTAL USERS', value: '1.2k', change: '+12.4%', trend: 'up', icon: 'users' },
  { label: 'NEW USERS', value: '128', isNew: true, icon: 'user-plus' },
  { label: 'ENGAGEMENT RATE', value: '4.82%', change: '-2.1%', trend: 'down', icon: 'mouse' },
  { label: 'ACTIVE USERS', value: '109', icon: 'heart' },
];

// REPLACE: Pull from Meta Ads API + Google Analytics audience insights
// Shape: { age: string, meta: number, google: number }
export const AGE_DEMOGRAPHICS: AgeDemographic[] = [
  { age: '13-17', meta: 45, google: 30 },
  { age: '18-24', meta: 80, google: 65 },
  { age: '25-34', meta: 120, google: 90 },
  { age: '35-44', meta: 95, google: 75 },
  { age: '45-54', meta: 60, google: 50 },
  { age: '55+', meta: 40, google: 35 },
];

export const AGE_DEMOGRAPHICS_FACEBOOK: AgeDemographic[] = [
  { age: '13-17', meta: 24, google: 0 },
  { age: '18-24', meta: 42, google: 0 },
  { age: '25-34', meta: 68, google: 0 },
  { age: '35-44', meta: 46, google: 0 },
  { age: '45-54', meta: 28, google: 0 },
  { age: '55+', meta: 18, google: 0 },
];

export const AGE_DEMOGRAPHICS_INSTAGRAM: AgeDemographic[] = [
  { age: '13-17', meta: 20, google: 0 },
  { age: '18-24', meta: 35, google: 0 },
  { age: '25-34', meta: 52, google: 0 },
  { age: '35-44', meta: 34, google: 0 },
  { age: '45-54', meta: 22, google: 0 },
  { age: '55+', meta: 16, google: 0 },
];

// REPLACE: Pull from Meta Ads API or Google Analytics gender breakdown
// Shape: { name: string, value: number (percentage), color: string }
export const GENDER_DISTRIBUTION: GenderData[] = [
  { name: 'Female', value: 72.4, color: '#FFB800' },
  { name: 'Male', value: 25.1, color: '#6B5600' },
  { name: 'Other', value: 2.5, color: '#E2E8F0' },
];

export const GENDER_DISTRIBUTION_FACEBOOK: GenderData[] = [
  { name: 'Female', value: 520, color: '#FFB800' },
  { name: 'Male', value: 340, color: '#6B5600' },
  { name: 'Other', value: 28, color: '#E2E8F0' },
];

export const GENDER_DISTRIBUTION_INSTAGRAM: GenderData[] = [
  { name: 'Female', value: 210, color: '#FFB800' },
  { name: 'Male', value: 95, color: '#6B5600' },
  { name: 'Other', value: 12, color: '#E2E8F0' },
];

// REPLACE: Pull from Google Analytics geographic report
// Shape: { name: string, percentage: number }
export const COUNTRY_REACH: CountryReach[] = [
  { name: 'United States', percentage: 38.5 },
  { name: 'United Kingdom', percentage: 22.1 },
  { name: 'New Zealand', percentage: 18.4 },
  { name: 'Australia', percentage: 12.6 },
];


// --- Yearly Stats ---

// REPLACE: Pull from your CRM (e.g. Salesforce, Airtable)
// Shape: see YearlySummaryData in types.ts
export const YEARLY_SUMMARY: YearlySummaryData = {
  livesImpacted: '1,248',
  livesImpactedChange: '+14.2% from 2022',
  activeMatches: '412',
  matchesGoalPercent: 82,
  mentorRetention: '94%',
};

// REPLACE: Pull from your CRM — mentee count grouped by age bracket
// Shape: { label: string, value: string, change: string, color: string }
export const YEARLY_AGE_GROUPS: AgeGroup[] = [
  { label: 'AGE 5', value: '312', change: '+4% YoY', color: 'bg-brand-yellow' },
  { label: 'AGE 11-14', value: '584', change: '+18% YoY', color: 'bg-brand-yellow' },
  { label: 'AGE 15+', value: '352', change: 'Stable', color: 'bg-slate-100' },
];

// REPLACE: Pull from your CRM — mentee count grouped by NZ region
// Shape: { label: string, percentage: number }
export const REGIONS: Region[] = [
  { label: 'Auckland Central', percentage: 42 },
  { label: 'Wellington', percentage: 28 },
];

// REPLACE: Pull from your CRM — monthly mentee count vs previous year baseline
// Shape: { month: string, actual: number, baseline: number }
export const GROWTH_TRAJECTORY = [
  { month: 'JAN', actual: 200, baseline: 180 },
  { month: 'MAR', actual: 350, baseline: 280 },
  { month: 'MAY', actual: 420, baseline: 380 },
  { month: 'JUL', actual: 580, baseline: 450 },
  { month: 'SEP', actual: 650, baseline: 520 },
  { month: 'NOV', actual: 780, baseline: 600 },
];

// REPLACE: Pull from your CRM — gender breakdown of mentees (yearly program data)
// Shape: { label: string, value: string, percentage: number, color: string }
export const YEARLY_GENDER = [
  { label: 'Male', value: '54%', percentage: 54, color: 'bg-slate-900' },
  { label: 'Female', value: '42%', percentage: 42, color: 'bg-brand-yellow' },
  { label: 'Non-Binary / Other', value: '4%', percentage: 4, color: 'bg-slate-200' },
];
