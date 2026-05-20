import { randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { pipeline } from 'stream/promises';
import { BadRequestException } from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_ATTACHMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

// Size limits
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024; // 20 MB
export const MAX_ATTACHMENTS = 10;

export interface FileValidationOptions {
  allowedMimeTypes: string[];
  maxSize: number;
}

export interface SavedFileResult {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Validates a multipart file against MIME type and size constraints.
 * Throws BadRequestException with Spanish error messages on failure.
 */
export function validateFile(
  file: MultipartFile,
  options: FileValidationOptions,
): void {
  const { allowedMimeTypes, maxSize } = options;

  if (!allowedMimeTypes.includes(file.mimetype)) {
    const formats = allowedMimeTypes
      .map((t) => t.split('/')[1]?.toUpperCase() ?? t)
      .join(', ');
    throw new BadRequestException(
      `Formato de archivo no permitido. Formatos aceptados: ${formats}`,
    );
  }

  // Note: file size is checked after consuming the stream (see saveFile)
  // This is a pre-check based on content-type header
  if (file.file.bytesRead > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    throw new BadRequestException(
      `El archivo excede el tamaño máximo de ${maxMB} MB`,
    );
  }
}

/**
 * Generates a unique file name preserving the original extension.
 * Sanitizes the original name to remove unsafe characters.
 */
export function generateFileName(originalName: string): string {
  const uuid = randomUUID();
  const sanitized = originalName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
  return `${uuid}-${sanitized}`;
}

/**
 * Saves a multipart file to the specified destination directory.
 * Creates the directory if it doesn't exist.
 * Validates file size after writing.
 */
export async function saveFile(
  file: MultipartFile,
  destDir: string,
  options: FileValidationOptions,
): Promise<SavedFileResult> {
  // Validate MIME type before saving
  if (!options.allowedMimeTypes.includes(file.mimetype)) {
    const formats = options.allowedMimeTypes
      .map((t) => t.split('/')[1]?.toUpperCase() ?? t)
      .join(', ');
    throw new BadRequestException(
      `Formato de archivo no permitido. Formatos aceptados: ${formats}`,
    );
  }

  await mkdir(destDir, { recursive: true });

  const ext = extname(file.filename) || mimeToExt(file.mimetype);
  const fileName = generateFileName(file.filename || `file${ext}`);
  const filePath = join(destDir, fileName);

  // Write file to disk
  const writeStream = createWriteStream(filePath);
  await pipeline(file.file, writeStream);

  const fileSize = file.file.bytesRead;

  // Validate size after writing
  if (fileSize > options.maxSize) {
    // Clean up the oversized file
    const { unlink } = await import('fs/promises');
    await unlink(filePath).catch(() => {});
    const maxMB = Math.round(options.maxSize / (1024 * 1024));
    throw new BadRequestException(
      `El archivo excede el tamaño máximo de ${maxMB} MB`,
    );
  }

  // Build relative URL for storage
  const relativeUrl = filePath.replace(/\\/g, '/');
  const uploadsIndex = relativeUrl.indexOf('uploads/');
  const fileUrl =
    uploadsIndex >= 0 ? relativeUrl.substring(uploadsIndex) : fileName;

  return {
    fileName,
    fileUrl,
    fileSize,
    mimeType: file.mimetype,
  };
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      '.docx',
    'text/plain': '.txt',
  };
  return map[mime] ?? '';
}
