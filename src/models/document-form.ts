import { z } from "zod";

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const documentFormSchema = z.object({
  name: z.string().min(1, "Nome do documento é obrigatório"),
  type: z.enum(["report", "pdf", "image"] as const),
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Arquivo é obrigatório")
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE_BYTES,
      `O arquivo excede o limite de ${MAX_FILE_SIZE_MB}MB`
    ),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
