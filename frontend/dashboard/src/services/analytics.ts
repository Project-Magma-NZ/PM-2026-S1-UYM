const API_BASE = 'http://localhost:8000/api/v1';
const CURRENT_YEAR = '2026';

import {
  AGE_DEMOGRAPHICS_FACEBOOK,
  AGE_DEMOGRAPHICS_INSTAGRAM,
  GENDER_DISTRIBUTION_FACEBOOK,
  GENDER_DISTRIBUTION_INSTAGRAM,
} from '../data/mockData';

interface DemographicRecord {
  demographic_dimension: string;
  year_month: string;
  demographic_value: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  engagedSessions: number;
  eventCount: number;
  userEngagementDuration: number;
  date_range_start: string;
  date_range_end: string;
}

interface DemographicsResponse {
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  items: DemographicRecord[];
}

export interface GenderDistributionCount {
  name: string;
  count: number;
  color: string;
}

async function fetchDimension(dimension: string, yearMonth?: string): Promise<DemographicRecord[]> {
  const params = new URLSearchParams({ limit: '1000' });
  if (yearMonth && yearMonth !== 'YTD') params.set('year_month', yearMonth);
  const res = await fetch(`${API_BASE}/demographics/${dimension}?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch ${dimension}`);
  const data: DemographicsResponse = await res.json();
  let items = data.items;
  if (yearMonth === 'YTD') {
    items = items.filter(r => r.year_month.startsWith(CURRENT_YEAR));
  }
  return items;
}

export async function fetchAvailableMonths(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/metadata/months`);
  if (!res.ok) throw new Error('Failed to fetch months');
  const data = await res.json();
  return (data.items ?? data) as string[];
}

export async function fetchKPIs(yearMonth?: string) {
  const records = await fetchDimension('userGender', yearMonth);
  const totalActive = records.reduce((s, r) => s + r.activeUsers, 0);
  const totalNew = records.reduce((s, r) => s + r.newUsers, 0);
  const totalSessions = records.reduce((s, r) => s + r.sessions, 0);
  const totalEngaged = records.reduce((s, r) => s + r.engagedSessions, 0);
  const engagementRate =
    totalSessions > 0 ? ((totalEngaged / totalSessions) * 100).toFixed(2) : '0';
  return { totalActive, totalNew, engagementRate, totalSessions };
}

export async function fetchAgeDemographics(yearMonth?: string) {
  const records = await fetchDimension('userAgeBracket', yearMonth);
  const grouped = new Map<string, number>();
  for (const r of records) {
    grouped.set(r.demographic_value, (grouped.get(r.demographic_value) || 0) + r.activeUsers);
  }
  return Array.from(grouped.entries())
    .map(([age, google]) => ({ age, google, meta: 0 }))
    .sort((a, b) => a.age.localeCompare(b.age));
}

export async function fetchFacebookAgeDemographics() {
  return AGE_DEMOGRAPHICS_FACEBOOK;
}

export async function fetchInstagramAgeDemographics() {
  return AGE_DEMOGRAPHICS_INSTAGRAM;
}

export async function fetchGenderDistributionCounts(yearMonth?: string): Promise<GenderDistributionCount[]> {
  const records = await fetchDimension('userGender', yearMonth);
  const grouped = new Map<string, number>();

  for (const r of records) {
    grouped.set(r.demographic_value, (grouped.get(r.demographic_value) || 0) + r.activeUsers);
  }

  const COLORS: Record<string, string> = {
    female: '#FFB800',
    male: '#6B5600',
    unknown: '#E2E8F0',
  };
  const NAME_MAP: Record<string, string> = {
    female: 'Female',
    male: 'Male',
    unknown: 'Other',
  };

  return Array.from(grouped.entries())
    .map(([key, count]) => ({
      name: NAME_MAP[key] ?? key,
      count,
      color: COLORS[key] ?? '#CBD5E1',
    }))
    .sort((a, b) => b.count - a.count);
}

export async function fetchFacebookGenderDistributionCounts() {
  return GENDER_DISTRIBUTION_FACEBOOK.map((item) => ({
    name: item.name,
    count: item.value,
    color: item.color,
  }));
}

export async function fetchInstagramGenderDistributionCounts() {
  return GENDER_DISTRIBUTION_INSTAGRAM.map((item) => ({
    name: item.name,
    count: item.value,
    color: item.color,
  }));
}

export async function fetchGenderDistribution(yearMonth?: string) {
  const items = await fetchGenderDistributionCounts(yearMonth);
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
  return items.map((item) => ({
    name: item.name,
    value: parseFloat(((item.count / total) * 100).toFixed(1)),
    color: item.color,
  }));
}

export async function fetchCountryReach(yearMonth?: string) {
  const records = await fetchDimension('country', yearMonth);
  const grouped = new Map<string, number>();
  for (const r of records) {
    if (r.demographic_value && r.demographic_value !== '(not set)') {
      grouped.set(r.demographic_value, (grouped.get(r.demographic_value) || 0) + r.activeUsers);
    }
  }
  const total = Array.from(grouped.values()).reduce((s, v) => s + v, 0);
  return Array.from(grouped.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
    }));
}

export async function fetchMonthlyWebsiteData() {
  const records = await fetchDimension('userGender');
  const grouped = new Map<string, number>();
  for (const r of records) {
    grouped.set(r.year_month, (grouped.get(r.year_month) || 0) + r.activeUsers);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, count]) => {
      const month = new Date(parseInt(ym.slice(0, 4)), parseInt(ym.slice(4, 6)) - 1)
        .toLocaleString('default', { month: 'short' }).toUpperCase();
      return { month, website: count };
    });
}

export async function fetchNZRegions(yearMonth?: string) {
  const records = await fetchDimension('region', yearMonth);
  const grouped = new Map<string, number>();
  for (const r of records) {
    if (r.demographic_value && r.demographic_value !== '(not set)') {
      grouped.set(r.demographic_value, (grouped.get(r.demographic_value) || 0) + r.activeUsers);
    }
  }
  const total = Array.from(grouped.values()).reduce((s, v) => s + v, 0);
  return Array.from(grouped.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({
      label,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
    }));
}
