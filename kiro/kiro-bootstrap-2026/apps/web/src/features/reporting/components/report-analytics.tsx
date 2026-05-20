'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '@/lib/api-client';

interface CellReport {
  id: string;
  meetingDate: string;
  totalAttendance: number;
  convertsCount: number;
  visitorsCount: number;
  group: { id: string; name: string };
}

interface ReportResponse {
  data: CellReport[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export function ReportAnalytics() {
  const [reports, setReports] = useState<CellReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const res = await api.get<ReportResponse>('/reports/cell', {
          startDate,
          endDate,
          pageSize: 500,
        });
        setReports(res.data);
      } catch {
        setReports([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [startDate, endDate]);

  const kpis = useMemo(() => {
    const now = new Date();
    const thisMonth = reports.filter((r) => {
      const d = new Date(r.meetingDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalReports = thisMonth.length;
    const totalAttendance = reports.reduce((s, r) => s + r.totalAttendance, 0);
    const avgAttendance = reports.length > 0 ? Math.round(totalAttendance / reports.length) : 0;
    const totalConverts = reports.reduce((s, r) => s + r.convertsCount, 0);
    const totalVisitors = reports.reduce((s, r) => s + r.visitorsCount, 0);
    return { totalReports, avgAttendance, totalConverts, totalVisitors };
  }, [reports]);

  const weeklyData = useMemo(() => {
    const map = new Map<string, { week: string; attendance: number; converts: number }>();
    for (const r of reports) {
      const d = new Date(r.meetingDate);
      const weekStart = new Date(d);
      const day = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
      const key = weekStart.toISOString().split('T')[0];
      const existing = map.get(key) || { week: key, attendance: 0, converts: 0 };
      existing.attendance += r.totalAttendance;
      existing.converts += r.convertsCount;
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.week.localeCompare(b.week));
  }, [reports]);

  const topCells = useMemo(() => {
    const map = new Map<string, { name: string; attendance: number }>();
    for (const r of reports) {
      const existing = map.get(r.group.id) || { name: r.group.name, attendance: 0 };
      existing.attendance += r.totalAttendance;
      map.set(r.group.id, existing);
    }
    return Array.from(map.values())
      .sort((a, b) => b.attendance - a.attendance)
      .slice(0, 10);
  }, [reports]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium">Desde</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Hasta</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Reportes este mes" value={kpis.totalReports} />
        <KpiCard label="Asistencia promedio" value={kpis.avgAttendance} />
        <KpiCard label="Total convertidos" value={kpis.totalConverts} />
        <KpiCard label="Total visitantes" value={kpis.totalVisitors} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Tendencia de asistencia por semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" name="Asistencia" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Convertidos por semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="converts" name="Convertidos" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Cells */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold mb-4">Top 10 células por asistencia</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topCells} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="attendance" name="Asistencia total" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
