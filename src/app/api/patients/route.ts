import { NextResponse } from 'next/server';
import type { Patient } from '@/types'; // Importando nosso tipo de Paciente

// Dados de exemplo para simular um banco de dados
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ana Silva (Dados da API)',
    cpf: '111.222.333-44',
    email: 'ana.silva@example.com',
    phone: '(11) 98765-4321',
    birthDate: '1990-05-15',
    photoUrl: '',
    consent: true,
    medicalHistory: 'Histórico de ansiedade.',
    documents: [],
    sessions: [],
    createdAt: new Date().toISOString(),
    psychologistId: 'psico-123',
    paymentType: 'particular',
  },
  {
    id: '2',
    name: 'Bruno Costa (Dados da API)',
    cpf: '555.666.777-88',
    email: 'bruno.costa@example.com',
    phone: '(21) 91234-5678',
    birthDate: '1985-11-20',
    photoUrl: '',
    consent: true,
    medicalHistory: 'Tratamento para fobias.',
    documents: [],
    sessions: [],
    createdAt: new Date().toISOString(),
    psychologistId: 'psico-123',
    paymentType: 'plano',
    healthPlan: 'Plano Saúde Total'
  }
];

// Esta função lida com requisições GET para /api/patients
export async function GET() {
  // No futuro, aqui você buscaria os dados de um banco de dados real.
  // Por enquanto, apenas retornamos nossos dados de exemplo.

  // Adicionando um pequeno delay para simular uma chamada de rede real
  await new Promise(resolve => setTimeout(resolve, 500)); 

  return NextResponse.json(mockPatients);
} 