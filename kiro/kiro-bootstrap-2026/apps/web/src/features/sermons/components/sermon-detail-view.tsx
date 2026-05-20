'use client';

import { Download, ExternalLink, FileText } from 'lucide-react';
import type { Sermon } from '../types/sermon.types';

interface SermonDetailViewProps {
  sermon: Sermon;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getVideoEmbed(url: string): { type: 'youtube' | 'vimeo' | 'generic'; embedUrl: string } {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Generic iframe
  return { type: 'generic', embedUrl: url };
}

export function SermonDetailView({ sermon }: SermonDetailViewProps) {
  return (
    <div className="space-y-8">
      {/* Video embed */}
      {sermon.videoUrl && (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={getVideoEmbed(sermon.videoUrl).embedUrl}
            title={sermon.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Title and metadata */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{sermon.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{formatDate(sermon.sermonDate)}</span>
          {sermon.createdBy && (
            <>
              <span>•</span>
              <span>
                {sermon.createdBy.firstName} {sermon.createdBy.lastName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {sermon.description && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {sermon.description}
          </p>
        </div>
      )}

      {/* External link */}
      {sermon.externalLink && (
        <a
          href={sermon.externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Enlace externo
        </a>
      )}

      {/* File downloads */}
      {sermon.files && sermon.files.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Archivos adjuntos</h2>
          <div className="space-y-2">
            {sermon.files.map((file) => (
              <a
                key={file.id}
                href={file.fileUrl}
                download={file.fileName}
                className="flex items-center gap-3 p-3 rounded-md border border-border/50 bg-card hover:bg-accent/30 transition-colors group"
              >
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.fileSize)} • {file.mimeType.split('/')[1]?.toUpperCase()}
                  </p>
                </div>
                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
