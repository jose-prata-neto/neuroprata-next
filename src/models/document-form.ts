'use client';
import { z } from 'zod';

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const documentFormSchema = z.object({
  name: z.string().min(1, 'Nome do documento é obrigatório'),
  type: z.enum(['report', 'pdf', 'image'] as const),
  file: z.custom<FileList>(
    (files) =>
      typeof window !== 'undefined' &&
      typeof FileList !== 'undefined' &&
      files instanceof FileList &&
      files.length > 0 &&
      files[0].size <= MAX_FILE_SIZE_BYTES,
    {
      message: `Arquivo é obrigatório e deve ter no máximo ${MAX_FILE_SIZE_MB}MB`,
    }
  ),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
