'use client';

import { Badge } from '@/components/ui/badge';

interface DiscipleshipRelation {
  id: string;
  type: string;
  startDate: string;
  mentor: { id: string; firstName: string; lastName: string };
  disciple: { id: string; firstName: string; lastName: string };
}

interface UserDiscipleshipTabProps {
  user: {
    id: string;
    mentoring?: DiscipleshipRelation[];
    discipledBy?: DiscipleshipRelation[];
  };
}

export function UserDiscipleshipTab({ user }: UserDiscipleshipTabProps) {
  const mentoring = user.mentoring ?? [];
  const discipledBy = user.discipledBy ?? [];

  if (mentoring.length === 0 && discipledBy.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Sin relaciones de discipulado activas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {mentoring.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Como Mentor ({mentoring.length})
          </h3>
          {mentoring.map((rel) => (
            <div
              key={rel.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div>
                <p className="text-sm font-medium">
                  {rel.disciple.firstName} {rel.disciple.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Desde {new Date(rel.startDate).toLocaleDateString('es')}
                </p>
              </div>
              <Badge variant="secondary">{rel.type}</Badge>
            </div>
          ))}
        </div>
      )}

      {discipledBy.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Como Discípulo ({discipledBy.length})
          </h3>
          {discipledBy.map((rel) => (
            <div
              key={rel.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div>
                <p className="text-sm font-medium">
                  {rel.mentor.firstName} {rel.mentor.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Desde {new Date(rel.startDate).toLocaleDateString('es')}
                </p>
              </div>
              <Badge variant="outline">{rel.type}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
