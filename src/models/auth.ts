import z from "zod";

export const loginSchema = z.object({
  email: z.email("Por favor, insira um endereço de email válido").toLowerCase(),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome deve ter menos de 100 caracteres"),
    email: z
      .email("Por favor, digite um endereço de email válido")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .max(100, "Senha deve ter menos de 100 caracteres"),
    confirmPassword: z.string().min(8, "Por favor, confirme sua senha"),
    role: z.enum(["ADMIN", "USER", "GUEST"], {
      message: "Por favor, selecione um perfil",
    }),
    crp: z
      .string()
      .min(5, "Por favor, digite um CRP válido")
      .max(20, "CRP deve ter menos de 20 caracteres"),
    cpf: z
      .string()
      .min(11, "CPF deve ter 11 dígitos")
      .max(14, "CPF muito longo")
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 11, "CPF deve ter exatamente 11 dígitos"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
