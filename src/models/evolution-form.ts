import { z } from 'zod';
import type { SessionType } from '@/server/db/schema';

// File validation schema that works in both SSR and client environments
const fileListSchema = z
  .custom<FileList>((val) => {
    // In SSR, FileList might not be available, so we allow undefined
    if (typeof window === 'undefined') {
      return true;
    }
    return val instanceof FileList;
  }, 'Deve ser uma lista de arquivos válida')
  .optional()
  .refine((files) => {
    if (!files || files.length === 0) {
      return true;
    }
    return Array.from(files).every((file) => file.size <= 10 * 1024 * 1024); // 10MB limit
  }, 'Cada arquivo deve ter no máximo 10MB')
  .refine((files) => {
    if (!files || files.length === 0) {
      return true;
    }
    const allowedTypes = [
      'image/',
      'application/pdf',
      'text/',
      'application/msword',
      'application/vnd.openxmlformats-officedocument',
    ];
    return Array.from(files).every((file) =>
      allowedTypes.some((type) => file.type.startsWith(type))
    );
  }, 'Tipos de arquivo permitidos: imagens, PDF, documentos de texto');

export const evolutionFormSchema = z.object({
  notes: z
    .string()
    .min(1, 'As anotações são obrigatórias')
    .min(10, 'As anotações devem ter pelo menos 10 caracteres')
    .max(5000, 'As anotações não podem exceder 5000 caracteres'),

  duration: z
    .number()
    .min(1, 'A duração deve ser maior que zero')
    .max(600, 'A duração não pode exceder 10 horas (600 minutos)')
    .int('A duração deve ser um número inteiro'),

  sessionDate: z
    .string()
    .min(1, 'A data da sessão é obrigatória')
    .refine((date) => {
      const sessionDate = new Date(date);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);

      return sessionDate >= oneYearAgo && sessionDate <= oneYearFromNow;
    }, 'A data da sessão deve estar entre 1 ano atrás e 1 ano no futuro'),

  sessionType: z.enum(['INDIVIDUAL', 'COUPLE', 'FAMILY', 'GROUP'] as const, {
    message: 'Tipo de sessão é obrigatório',
  }) satisfies z.ZodType<SessionType>,

  attachments: fileListSchema,
});

export type EvolutionFormValues = z.infer<typeof evolutionFormSchema>;

// Helper type for the form with converted attachment files
export type EvolutionFormData = Omit<EvolutionFormValues, 'attachments'> & {
  attachmentFiles: File[];
};
