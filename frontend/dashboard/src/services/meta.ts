import type { AgeDemographic, KPIData } from '../types';
import type { GenderDistributionCount } from './analytics';

const API_BASE = `${(import.meta as any).env?.VITE_API_URL ?? ''}/api/v1`;

export interface MetaStatus {
  connected: boolean;
  facebook_connected?: boolean;
  instagram_connected?: boolean;
  page_name: string | null;
  page_id?: string;
  ig_account_id?: string;
  connected_at?: string;
}

export async function fetchMetaStatus(): Promise<MetaStatus> {
  try {
    const res = await fetch(`${API_BASE}/meta/oauth/status`);
    if (!res.ok) return { connected: false, facebook_connected: false, instagram_connected: false, page_name: null };
    return res.json();
  } catch {
    return { connected: false, facebook_connected: false, instagram_connected: false, page_name: null };
  }
}

// --- Parsing helpers ---

function sumMetricValues(values: any[]): number {
  return values.reduce((sum, v) => sum + (v.value ?? 0), 0);
}

function latestMetricValue(values: any[]): number {
  return values.at(-1)?.value ?? 0;
}

function getMetric(data: any, name: string) {
  return data.data?.find((d: any) => d.name === name);
}

function getFirstMetric(data: any, names: string[]) {
  return names.map((name) => getMetric(data, name)).find(Boolean);
}

// --- Facebook ---

export async function fetchMetaFbInsights(days = 28): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${API_BASE}/meta/facebook/insights?days=${days}`);
    if (!res.ok) {
      console.error('[Meta] FB insights error:', res.status, await res.text());
      return {};
    }
    const data = await res.json();
    const followers = latestMetricValue(getMetric(data, 'page_followers')?.values ?? [])
      || latestMetricValue(getMetric(data, 'page_fans')?.values ?? []);
    const views = sumMetricValues(getMetric(data, 'views')?.values ?? [])
      || sumMetricValues(getMetric(data, 'page_views_total')?.values ?? []);
    return {
      page_fans: followers,
      page_followers: followers,
      page_reach: sumMetricValues(getMetric(data, 'page_reach')?.values ?? []),
      page_impressions: views || sumMetricValues(getMetric(data, 'page_impressions')?.values ?? []),
      views,
      page_engaged_users: sumMetricValues(getFirstMetric(data, ['page_engaged_users', 'page_post_engagements'])?.values ?? []),
    };
  } catch (e) {
    console.error('[Meta] FB insights exception:', e);
    return {};
  }
}

export async function fetchMetaFbGender(): Promise<GenderDistributionCount[]> {
  try {
    const res = await fetch(`${API_BASE}/meta/facebook/demographics`);
    if (!res.ok) {
      console.error('[Meta] FB demographics error:', res.status, await res.text());
      return [];
    }
    const data = await res.json();

    const metric = getFirstMetric(data, [
      'page_fans_gender_age',
      'page_fans_by_gender_by_age',
      'page_content_activity_by_age_gender_unique',
      'page_impressions_by_age_gender_unique',
      'page_impressions_by_age_gender',
    ]);
    const latestValue: Record<string, number> = metric?.values?.at(-1)?.value ?? {};
    if (!metric || Object.keys(latestValue).length === 0) {
      console.warn('[Meta] FB gender demographics returned no usable metric values:', data);
    }

    const counts: Record<string, number> = { Female: 0, Male: 0, Other: 0 };
    for (const [key, val] of Object.entries(latestValue)) {
      const prefix = key.split('.')[0];
      if (prefix === 'F') counts.Female += val as number;
      else if (prefix === 'M') counts.Male += val as number;
      else counts.Other += val as number;
    }

    return [
      { name: 'Female', count: counts.Female, color: '#FFB800' },
      { name: 'Male', count: counts.Male, color: '#6B5600' },
      { name: 'Other', count: counts.Other, color: '#E2E8F0' },
    ].filter(item => item.count > 0);
  } catch (e) {
    console.error('[Meta] FB gender exception:', e);
    return [];
  }
}

export async function fetchMetaFbAge(): Promise<AgeDemographic[]> {
  try {
    const res = await fetch(`${API_BASE}/meta/facebook/demographics`);
    if (!res.ok) {
      console.error('[Meta] FB age error:', res.status, await res.text());
      return [];
    }
    const data = await res.json();

    const metric = getFirstMetric(data, [
      'page_fans_gender_age',
      'page_fans_by_gender_by_age',
      'page_content_activity_by_age_gender_unique',
      'page_impressions_by_age_gender_unique',
      'page_impressions_by_age_gender',
    ]);
    const latestValue: Record<string, number> = metric?.values?.at(-1)?.value ?? {};
    if (!metric || Object.keys(latestValue).length === 0) {
      console.warn('[Meta] FB age demographics returned no usable metric values:', data);
    }

    const ageCounts: Record<string, number> = {};
    for (const [key, val] of Object.entries(latestValue)) {
      const age = key.split('.')[1];
      if (age) ageCounts[age] = (ageCounts[age] ?? 0) + (val as number);
    }

    return Object.entries(ageCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([age, count]) => ({ age, meta: count, google: 0 }));
  } catch (e) {
    console.error('[Meta] FB age exception:', e);
    return [];
  }
}

// --- Instagram ---

export async function fetchMetaIgInsights(yearMonth?: string): Promise<Record<string, number>> {
  try {
    let insightsUrl: string;
    if (yearMonth) {
      const year = parseInt(yearMonth.slice(0, 4));
      const month = parseInt(yearMonth.slice(4, 6)) - 1;
      const { since, until } = _monthRange(year, month, new Date());
      insightsUrl = `${API_BASE}/meta/instagram/insights?since=${since}&until=${until}`;
    } else {
      insightsUrl = `${API_BASE}/meta/instagram/insights?days=28`;
    }
    const [insightsRes, accountRes] = await Promise.all([
      fetch(insightsUrl),
      fetch(`${API_BASE}/meta/instagram/account`),
    ]);
    if (!insightsRes.ok) {
      console.error('[Meta] IG insights error:', insightsRes.status, await insightsRes.text());
      return {};
    }
    const data = await insightsRes.json();
    const accountData = accountRes.ok ? await accountRes.json() : {};
    return {
      follower_count: accountData.followers_count ?? 0,
      reach: sumMetricValues(getMetric(data, 'reach')?.values ?? []),
      impressions: sumMetricValues(getMetric(data, 'impressions')?.values ?? []),
    };
  } catch (e) {
    console.error('[Meta] IG insights exception:', e);
    return {};
  }
}

function parseIgBreakdown(data: any, dimension: string): { key: string; value: number }[] {
  const breakdown = data.data?.[0]?.total_value?.breakdowns?.find(
    (b: any) => b.dimension_keys?.[0] === dimension
  );
  return (breakdown?.results ?? []).map((r: any) => ({
    key: r.dimension_values?.[0] ?? '',
    value: r.value ?? 0,
  }));
}

export async function fetchMetaIgGender(): Promise<GenderDistributionCount[]> {
  try {
    const res = await fetch(`${API_BASE}/meta/instagram/demographics?breakdown=gender`);
    if (!res.ok) {
      console.error('[Meta] IG gender error:', res.status, await res.text());
      return [];
    }
    const data = await res.json();

    const NAME_MAP: Record<string, string> = { F: 'Female', M: 'Male', U: 'Other' };
    const COLOR_MAP: Record<string, string> = { F: '#FFB800', M: '#6B5600', U: '#E2E8F0' };

    return parseIgBreakdown(data, 'gender')
      .filter(item => item.value > 0)
      .map(item => ({
        name: NAME_MAP[item.key] ?? item.key,
        count: item.value,
        color: COLOR_MAP[item.key] ?? '#CBD5E1',
      }));
  } catch (e) {
    console.error('[Meta] IG gender exception:', e);
    return [];
  }
}

export async function fetchMetaIgAge(): Promise<AgeDemographic[]> {
  try {
    const res = await fetch(`${API_BASE}/meta/instagram/demographics?breakdown=age`);
    if (!res.ok) {
      console.error('[Meta] IG age error:', res.status, await res.text());
      return [];
    }
    const data = await res.json();

    // Normalise Instagram's 55-64 and 65+ into the chart's 55+ bucket
    return parseIgBreakdown(data, 'age')
      .filter(item => item.key)
      .reduce<AgeDemographic[]>((acc, item) => {
        const age = item.key === '55-64' || item.key === '65+' ? '55+' : item.key;
        const existing = acc.find(r => r.age === age);
        if (existing) existing.meta += item.value;
        else acc.push({ age, meta: item.value, google: 0 });
        return acc;
      }, [])
      .sort((a, b) => a.age.localeCompare(b.age));
  } catch {
    return [];
  }
}

// --- Regional data ---

const COUNTRY_NAMES: Record<string, string> = {
  NZ: 'New Zealand', AU: 'Australia', US: 'United States', GB: 'United Kingdom',
  CA: 'Canada', IN: 'India', NG: 'Nigeria', ZA: 'South Africa', FJ: 'Fiji',
  IE: 'Ireland', SG: 'Singapore', PH: 'Philippines', MY: 'Malaysia', PK: 'Pakistan',
  KE: 'Kenya', GH: 'Ghana', UG: 'Uganda', TZ: 'Tanzania', ZW: 'Zimbabwe',
  NO: 'Norway', DK: 'Denmark', HK: 'Hong Kong', JP: 'Japan',
};

export interface RegionEntry { label: string; count: number; percentage: number; }

export async function fetchMetaIgTopRegions(): Promise<{ countries: RegionEntry[]; cities: RegionEntry[] }> {
  const parse = (raw: any): RegionEntry[] => {
    const results: { dimension_values: string[]; value: number }[] =
      raw?.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? [];
    const total = results.reduce((s, r) => s + r.value, 0) || 1;
    return results
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map(r => {
        const raw = r.dimension_values?.[0] ?? '';
        const label = COUNTRY_NAMES[raw] ?? raw.split(',')[0];
        return { label, count: r.value, percentage: parseFloat(((r.value / total) * 100).toFixed(1)) };
      });
  };

  const [countriesRes, citiesRes] = await Promise.allSettled([
    fetch(`${API_BASE}/meta/instagram/demographics?breakdown=country`).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${API_BASE}/meta/instagram/demographics?breakdown=city`).then(r => r.ok ? r.json() : null).catch(() => null),
  ]);

  return {
    countries: countriesRes.status === 'fulfilled' ? parse(countriesRes.value) : [],
    cities: citiesRes.status === 'fulfilled' ? parse(citiesRes.value) : [],
  };
}

// --- Monthly aggregated data for yearly chart ---

function _monthRange(year: number, month: number, todayDate: Date): { since: string; until: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  const since = `${year}-${pad(month + 1)}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = year === todayDate.getFullYear() && month === todayDate.getMonth();
  const untilDay = isCurrentMonth
    ? new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 1).getDate()
    : lastDay;
  const until = `${year}-${pad(month + 1)}-${pad(untilDay)}`;
  return { since, until };
}

export async function fetchMetaMonthlyData(): Promise<{ ym: string; facebook: number; instagram: number }[]> {
  const today = new Date();
  const year = today.getFullYear();

  // Build one request per month — Meta limits reach/day to ~30 days per request
  const months = Array.from({ length: today.getMonth() + 1 }, (_, m) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const ym = `${year}${pad(m + 1)}`;
    return { ym, ..._monthRange(year, m, today) };
  });

  const igByMonth: Record<string, number> = {};

  await Promise.allSettled(
    months.map(async ({ ym, since, until }) => {
      const raw = await fetch(`${API_BASE}/meta/instagram/insights?since=${since}&until=${until}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);
      const metric = raw?.data?.find((d: any) => ['reach', 'impressions'].includes(d.name));
      const total = (metric?.values ?? []).reduce((s: number, v: any) => s + (v.value ?? 0), 0);
      if (total > 0) igByMonth[ym] = total;
    })
  );

  // Facebook: only has a single current follower count, not a daily time-series
  const fbByMonth: Record<string, number> = {};
  const fbRaw = await fetch(`${API_BASE}/meta/facebook/insights?days=28`)
    .then(r => r.ok ? r.json() : null).catch(() => null);
  const fbMetric = fbRaw?.data?.find((d: any) =>
    ['page_followers', 'page_fans', 'page_impressions', 'views', 'page_reach'].includes(d.name)
  );
  for (const v of fbMetric?.values ?? []) {
    const ym = v.end_time?.slice(0, 7).replace('-', '');
    if (ym) fbByMonth[ym] = (fbByMonth[ym] ?? 0) + (v.value ?? 0);
  }

  const allYms = new Set([...Object.keys(fbByMonth), ...Object.keys(igByMonth)]);
  return Array.from(allYms).sort().map(ym => ({
    ym,
    facebook: fbByMonth[ym] ?? 0,
    instagram: igByMonth[ym] ?? 0,
  }));
}

// --- Combined KPIs for MonthlySummary ---

export async function fetchMetaKPIs(yearMonth?: string): Promise<KPIData[]> {
  const [status, fb, ig] = await Promise.all([fetchMetaStatus(), fetchMetaFbInsights(), fetchMetaIgInsights(yearMonth)]);

  const hasFb = Boolean(status.facebook_connected);
  const hasIg = Boolean(status.instagram_connected);
  if (!hasFb && !hasIg) return [];

  const kpis: KPIData[] = [];

  if (hasFb) {
    kpis.push({ label: 'FB FOLLOWERS', value: (fb.page_fans ?? 0).toLocaleString(), icon: 'users' });
  }
  if (hasIg) {
    kpis.push({ label: 'IG FOLLOWERS', value: (ig.follower_count ?? 0).toLocaleString(), icon: 'users' });
  }

  const totalReach = (fb.page_reach ?? 0) + (ig.reach ?? 0);
  if (totalReach > 0) {
    kpis.push({ label: 'TOTAL REACH', value: totalReach.toLocaleString(), icon: 'globe' });
  }

  const totalImpressions = (fb.page_impressions ?? 0) + (ig.impressions ?? 0);
  if (totalImpressions > 0) {
    kpis.push({ label: 'IMPRESSIONS', value: totalImpressions.toLocaleString(), icon: 'eye' });
  }

  return kpis;
}
