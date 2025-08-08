import type { Patient, Session } from "@/interfaces";

export const getPatients = async (): Promise<Patient[]> => {
  try {
    const response = await fetch("/api/patients");
    if (!response.ok) {
      throw new Error("Falha ao buscar pacientes da API");
    }
    const patientsFromApi: Patient[] = await response.json();
    return patientsFromApi.map((patient) => ({
      ...patient,
      sessions: patient.sessions || [],
      documents: patient.documents || [],
    }));
  } catch (error) {
    console.error("Falha ao carregar pacientes da API", error);
    return [];
  }
};

export const addPatient = async (
  patientData: Omit<Patient, "id" | "createdAt" | "sessions" | "documents">
): Promise<Patient> => {
  try {
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) {
      throw new Error("Falha ao criar paciente");
    }
    return await response.json();
  } catch (error) {
    console.error("Falha ao adicionar paciente via API", error);
    throw error;
  }
};

// DEBBUGING: Adicionados console.log para seguir o fluxo
export const addSession = async (
  sessionData: Omit<Session, "id" | "attachments" | "tags"> & {
    patientId: string;
  }
): Promise<Session> => {
  console.log(
    "4. A função addSession no storageService foi chamada. A fazer a chamada de rede para /api/sessions..."
  );
  try {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    });

    console.log("5. A API respondeu. Status da resposta:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("!!! ERRO na resposta da API:", errorText);
      throw new Error(`Falha ao criar sessão: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("!!! ERRO na chamada de rede (fetch) em addSession:", error);
    throw error;
  }
};
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Falha ao apagar sessão");
    }
  } catch (error) {
    console.error("Falha ao apagar sessão via API", error);
    throw error;
  }
};
export const updateSessionPaymentStatus = async (
  sessionId: string,
  status: "paid" | "pending"
): Promise<Session> => {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentStatus: status }),
    });

    if (!response.ok) {
      throw new Error("Falha ao atualizar o estado do pagamento da sessão");
    }
    return await response.json();
  } catch (error) {
    console.error("Falha ao atualizar o pagamento via API", error);
    throw error;
  }
};
