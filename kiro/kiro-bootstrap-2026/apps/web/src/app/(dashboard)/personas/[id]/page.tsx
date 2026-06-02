'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Edit,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { PersonTimeline } from './timeline';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  address: string | null;
  avatarUrl: string | null;
  notes: string | null;
  createdAt: string;
  pipelineStage: { id: string; name: string; code: string; color: string } | null;
  currentGroup: { id: string; name: string; code: string } | null;
}

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'history'>('info');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Person>(`/persons/${params.id}`);
        setPerson(data);
      } catch (err) {
        console.error('Error loading person:', err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Persona no encontrada</p>
        <button onClick={() => router.back()} className="text-sm text-primary mt-2 hover:underline">
          ← Volver
        </button>
      </div>
    );
  }

  const initials = `${person.firstName[0]}${person.lastName[0]}`;
  const memberSince = new Date(person.createdAt).toLocaleDateString('es-PA', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Personas
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-muted/50 transition-colors">
          <Edit className="h-3.5 w-3.5" />
          Editar
        </button>
      </div>

      {/* Profile Header */}
      <div className="border rounded-xl p-6 bg-card">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            {person.avatarUrl ? (
              <img src={person.avatarUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">{initials}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-heading tracking-tight">
              {person.firstName} {person.lastName}
            </h1>

            {/* Stage Badge */}
            {person.pipelineStage && (
              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full mt-2"
                style={{
                  backgroundColor: `${person.pipelineStage.color}15`,
                  color: person.pipelineStage.color,
                  border: `1px solid ${person.pipelineStage.color}30`,
                }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {person.pipelineStage.name}
              </span>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              {person.currentGroup && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {person.currentGroup.code} · {person.currentGroup.name}
                </span>
              )}
              {person.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {person.phone}
                </span>
              )}
              {person.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {person.email}
                </span>
              )}
              {person.address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {person.address}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Desde {memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {[
            { key: 'info', label: 'Información', icon: Users },
            { key: 'timeline', label: 'Timeline Espiritual', icon: Clock },
            { key: 'history', label: 'Historial', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <div className="border rounded-xl p-5 bg-card space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Datos Personales</h3>
            <InfoRow label="Nombre completo" value={`${person.firstName} ${person.lastName}`} />
            <InfoRow label="Teléfono" value={person.phone ?? 'Sin registro'} />
            <InfoRow label="Email" value={person.email ?? 'Sin registro'} />
            <InfoRow label="Dirección" value={person.address ?? 'Sin registro'} />
            <InfoRow label="Género" value={person.gender === 'MALE' ? 'Masculino' : person.gender === 'FEMALE' ? 'Femenino' : 'Sin registro'} />
            <InfoRow label="Fecha de nacimiento" value={person.birthDate ? new Date(person.birthDate).toLocaleDateString('es-PA') : 'Sin registro'} />
          </div>

          {/* Ministry Info Card */}
          <div className="border rounded-xl p-5 bg-card space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Información Ministerial</h3>
            <InfoRow label="Equipo actual" value={person.currentGroup ? `${person.currentGroup.code} - ${person.currentGroup.name}` : 'Sin asignar'} />
            <InfoRow label="Stage pastoral" value={person.pipelineStage?.name ?? 'Sin asignar'} />
            <InfoRow label="Miembro desde" value={memberSince} />
            {person.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{person.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <PersonTimeline personId={person.id} />
      )}

      {activeTab === 'history' && (
        <div className="border rounded-xl p-6 text-center">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">Historial de cambios</p>
          <p className="text-xs text-muted-foreground mt-1">Próximamente: transferencias, cambios de equipo, notas pastorales</p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}
