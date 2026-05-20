import type { CreateCellReportInput } from '../schemas/cell-report.schema';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    const err = new Error((error as { message?: string }).message ?? 'Error al procesar la solicitud');
    (err as any).status = res.status;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface CellReport {
  id: string;
  groupId: string;
  reporterId: string;
  cellCode: string;
  meetingDate: string;
  coverageName: string;
  leaderName: string;
  coLeaderName: string | null;
  contactPhone: string | null;
  menCount: number;
  womenCount: number;
  youthMaleCount: number;
  youthFemaleCount: number;
  childrenCount: number;
  totalAttendance: number;
  visitorsCount: number;
  convertsCount: number;
  reconciledCount: number;
  messageTopic: string | null;
  startTime: string;
  endTime: string;
  offeringAmount: number | null;
  district: string | null;
  neighborhood: string | null;
  sector: string | null;
  street: string | null;
  houseNumber: string | null;
  wasSupervised: boolean;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  group: { id: string; name: string };
  reporter: { id: string; firstName: string; lastName: string };
}

export interface CellReportsResponse {
  data: CellReport[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface PendingGroup {
  groupId: string;
  groupName: string;
  leaderName: string;
}

export interface CellReportsQuery {
  groupId?: string;
  networkId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const cellReportService = {
  create: (token: string, data: CreateCellReportInput) =>
    request<CellReport>('/reports/cell', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  findAll: (token: string, params: CellReportsQuery = {}) => {
    const searchParams = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]),
    );
    const qs = searchParams.toString();
    return request<CellReportsResponse>(`/reports/cell${qs ? `?${qs}` : ''}`, token);
  },

  findPending: (token: string) =>
    request<PendingGroup[]>('/reports/cell/pending', token),
};
