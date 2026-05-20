'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Sermon } from '../types/sermon.types';

const sermonFormSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().max(5000).optional(),
  sermonDate: z.string().min(1, 'La fecha es requerida'),
  videoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  externalLink: z.string().url('URL inválida').optional().or(z.literal('')),
  publishAt: z.string().optional(),
  schedulePublish: z.boolean().default(false),
});

export type SermonFormValues = z.infer<typeof sermonFormSchema>;

interface SermonFormProps {
  defaultValues?: Partial<SermonFormValues>;
  sermon?: Sermon;
  onSubmit: (data: SermonFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function SermonForm({
  defaultValues,
  sermon,
  onSubmit,
  isSubmitting,
  submitLabel = 'Guardar',
}: SermonFormProps) {
  const [coverPreview, setCoverPreview] = React.useState<string | null>(
    sermon?.coverImageUrl ?? null,
  );
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const filesInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SermonFormValues>({
    resolver: zodResolver(sermonFormSchema),
    defaultValues: {
      title: sermon?.title ?? defaultValues?.title ?? '',
      description: sermon?.description ?? defaultValues?.description ?? '',
      sermonDate: sermon?.sermonDate
        ? new Date(sermon.sermonDate).toISOString().split('T')[0]
        : defaultValues?.sermonDate ?? '',
      videoUrl: sermon?.videoUrl ?? defaultValues?.videoUrl ?? '',
      externalLink: sermon?.externalLink ?? defaultValues?.externalLink ?? '',
      publishAt: sermon?.publishAt ?? defaultValues?.publishAt ?? '',
      schedulePublish: !!sermon?.publishAt || defaultValues?.schedulePublish || false,
    },
  });

  const schedulePublish = watch('schedulePublish');

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments((prev) => [...prev, ...files].slice(0, 10));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent, type: 'cover' | 'files') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (type === 'cover' && files[0]) {
      setCoverPreview(URL.createObjectURL(files[0]));
    } else if (type === 'files') {
      setAttachments((prev) => [...prev, ...files].slice(0, 10));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Título *
        </label>
        <Input id="title" {...register('title')} placeholder="Título de la predicación" />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="Descripción de la predicación..."
          rows={4}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Sermon Date */}
      <div className="space-y-2">
        <label htmlFor="sermonDate" className="text-sm font-medium">
          Fecha de la predicación *
        </label>
        <Input id="sermonDate" type="date" {...register('sermonDate')} />
        {errors.sermonDate && (
          <p className="text-sm text-destructive">{errors.sermonDate.message}</p>
        )}
      </div>

      {/* Cover Image Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Imagen de portada</label>
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-ring/50 transition-colors"
          onClick={() => coverInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'cover')}
        >
          {coverPreview ? (
            <div className="relative inline-block">
              <img
                src={coverPreview}
                alt="Cover preview"
                className="max-h-40 rounded-md object-cover"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setCoverPreview(null);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <p className="text-sm">Arrastra una imagen o haz clic para seleccionar</p>
              <p className="text-xs">JPEG, PNG, WebP (máx. 5 MB)</p>
            </div>
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleCoverChange}
        />
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <label htmlFor="videoUrl" className="text-sm font-medium">
          URL del video
        </label>
        <Input
          id="videoUrl"
          {...register('videoUrl')}
          placeholder="https://youtube.com/watch?v=..."
        />
        {errors.videoUrl && (
          <p className="text-sm text-destructive">{errors.videoUrl.message}</p>
        )}
      </div>

      {/* External Link */}
      <div className="space-y-2">
        <label htmlFor="externalLink" className="text-sm font-medium">
          Enlace externo
        </label>
        <Input
          id="externalLink"
          {...register('externalLink')}
          placeholder="https://..."
        />
        {errors.externalLink && (
          <p className="text-sm text-destructive">{errors.externalLink.message}</p>
        )}
      </div>

      {/* File Attachments */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Archivos adjuntos</label>
        <div
          className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-ring/50 transition-colors"
          onClick={() => filesInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'files')}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <p className="text-sm">Arrastra archivos o haz clic para seleccionar</p>
            <p className="text-xs">PDF, DOCX, TXT (máx. 20 MB cada uno, máx. 10 archivos)</p>
          </div>
        </div>
        <input
          ref={filesInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />
        {attachments.length > 0 && (
          <ul className="space-y-1 mt-2">
            {attachments.map((file, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* Show existing files for edit mode */}
        {sermon?.files && sermon.files.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Archivos existentes:</p>
            <ul className="space-y-1">
              {sermon.files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{file.fileName}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {(file.fileSize / 1024 / 1024).toFixed(1)} MB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Schedule Toggle (Task 10.11) */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label htmlFor="scheduleToggle" className="text-sm font-medium">
            Programar publicación
          </label>
          <button
            id="scheduleToggle"
            type="button"
            role="switch"
            aria-checked={schedulePublish}
            onClick={() => setValue('schedulePublish', !schedulePublish)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              schedulePublish ? 'bg-primary' : 'bg-input'
            }`}
          >
            <span
              className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                schedulePublish ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm text-muted-foreground">
            {schedulePublish ? 'Programar' : 'Publicar ahora'}
          </span>
        </div>
        {schedulePublish && (
          <div className="space-y-2">
            <label htmlFor="publishAt" className="text-sm font-medium">
              Fecha y hora de publicación
            </label>
            <Input id="publishAt" type="datetime-local" {...register('publishAt')} />
            {errors.publishAt && (
              <p className="text-sm text-destructive">{errors.publishAt.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
