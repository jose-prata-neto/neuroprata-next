
import type { Patient } from '@/types';

export const getPatients = async (): Promise<Patient[]> => {
  try {
    const response = await fetch('/api/patients');
    if (!response.ok) {
      throw new Error('Falha ao buscar pacientes');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Falha ao buscar pacientes da API", error);
    return [];
  }
};

export const savePatients = async (patients: Patient[]): Promise<void> => {
  try {
    // No futuro, esta será a chamada de API real.
    // const response = await fetch('/api/patients', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(patients),
    // });
    // if (!response.ok) {
    //   throw new Error('Falha ao salvar pacientes');
    // }

    console.log("Simulando chamada de API para salvar pacientes...");
    console.log("Pacientes a serem salvos:", patients);
    // Por enquanto, apenas simula o salvamento
  } catch (error) {
    console.error("Falha ao salvar pacientes na API", error);
    throw error; // Re-throw para que o chamador possa tratar o erro
  }
};
