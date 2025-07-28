

export const SESSION_TYPES = ['individual', 'couple', 'family', 'group'] as const;

export interface Tag {
  id: string;
  text: string;
}

export interface SuggestedTag extends Tag {
  relevance: number; // score from 0 to 1
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'report';
  url: string; // a placeholder url
  uploadedAt: string;
}

export interface Session {
  id: string;
  date: string;
  duration: number; // in minutes
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
  crp?: string; // For psychologists
  cpf?: string; // For staff
  linkedUserIds?: string[]; // Psychologist links to staff, staff links to psychologists
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  timestamp: string;
  details: Record<string, any>;
  ipAddress: string; // Simulated IP
  sessionId?: string;
}

export interface Patient {
  id:string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  photoUrl?: string; // To store base64 image
  consent: boolean; // Digital consent
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
    identifier?: string; // CRP or CPF, optional for admin
}