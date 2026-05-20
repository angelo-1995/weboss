const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Analytics request failed');
  return res.json() as Promise<T>;
}

export interface KPIData {
  users: { active: number; newThisMonth: number; growthPct: number | null };
  groups: { active: number; newThisMonth: number };
  memberships: { active: number; newThisMonth: number; growthPct: number | null };
  discipleships: { active: number; completedMilestones: number; pendingCheckIns: number };
  generatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  mentor: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  discipleCount: number;
}

export interface GroupAnalytics {
  byType: { type: string; count: number }[];
  topByMembers: { group: { id: string; name: string; type: string }; memberCount: number }[];
}

export const analyticsService = {
  getKPIs: (token: string, campusId?: string) => {
    const q = campusId ? `?campusId=${campusId}` : '';
    return request<KPIData>(`/analytics/kpis${q}`, token);
  },
  getLeaderboard: (token: string, limit = 10) =>
    request<LeaderboardEntry[]>(`/analytics/leaderboard?limit=${limit}`, token),
  getGroupAnalytics: (token: string, campusId?: string) => {
    const q = campusId ? `?campusId=${campusId}` : '';
    return request<GroupAnalytics>(`/analytics/groups${q}`, token);
  },
  getRetention: (token: string) =>
    request<{ windows: { days: number; activeUsers: number }[] }>('/analytics/retention', token),
};
