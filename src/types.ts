export const SESSION_TYPES = ['individual', 'couple', 'family', 'group'] as const;

export interface Tag {
  id: string;
  text: string;
}

export interface SuggestedTag extends Tag {
  relevance: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'report';
  url: string;
  uploadedAt: string;
}

export interface Session {
  id: string;
  date: string;
  duration: number;
  sessionType: typeof SESSION_TYPES[number];
  notes: string;
  attachments: { name:string; url: string }[];
  tags: Tag[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'psychologist' | 'staff' | 'admin';
  crp?: string;
  cpf?: string;
  linkedUserIds?: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  timestamp: string;
  details: Record<string, string | number | boolean>;
  ipAddress: string;
  sessionId?: string;
}

export interface Patient {
  id:string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  photoUrl?: string;
  consent: boolean;
  medicalHistory: string;
  documents: Document[];
  sessions: Session[];
  createdAt: string;
  psychologistId?: string;
  paymentType: 'particular' | 'plano';
  healthPlan?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'psychologist' | 'staff' | 'admin';
    identifier?: string;
}