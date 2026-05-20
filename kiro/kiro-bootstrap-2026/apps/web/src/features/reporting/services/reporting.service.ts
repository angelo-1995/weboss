const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 }, // ISR 5 min for reports
  });
  if (!res.ok) throw new Error('Report request failed');
  return res.json() as Promise<T>;
}

export interface OverviewReport {
  users: { total: number; active: number };
  groups: { total: number; active: number };
  memberships: { total: number; active: number };
  discipleships: { active: number };
  generatedAt: string;
}

export interface GrowthSeries {
  month: string;
  count: number;
}

export interface GrowthReport {
  users: GrowthSeries[];
  memberships: GrowthSeries[];
  groups: GrowthSeries[];
  generatedAt: string;
}

export interface GroupReport {
  group: { id: string; name: string; type: string; isActive: boolean };
  members: { total: number; byRole: Record<string, number> };
  memberships: { active: number };
  checkInsLast30Days: number;
  generatedAt: string;
}

export interface DiscipleshipReport {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  milestones: { completed: number };
  checkIns: { pending: number };
  generatedAt: string;
}

export const reportingService = {
  getOverview: (token: string, campusId?: string) => {
    const q = campusId ? `?campusId=${campusId}` : '';
    return request<OverviewReport>(`/reports/overview${q}`, token);
  },

  getGrowth: (token: string, months = 12) =>
    request<GrowthReport>(`/reports/growth?months=${months}`, token),

  getGroupReport: (token: string, groupId: string) =>
    request<GroupReport>(`/reports/groups/${groupId}`, token),

  getDiscipleshipReport: (token: string, mentorId?: string) => {
    const q = mentorId ? `?mentorId=${mentorId}` : '';
    return request<DiscipleshipReport>(`/reports/discipleship${q}`, token);
  },
};
