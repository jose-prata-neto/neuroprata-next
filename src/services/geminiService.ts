import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SuggestedTag } from "@/interfaces";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

if (!genAI) {
  console.warn(
    "NEXT_PUBLIC_GEMINI_API_KEY environment variable not set. AI features will be disabled."
  );
}

interface GeminiTagResponse {
  tag: string;
  relevance: number;
}

export const analyzeSessionNotes = async (
  notes: string
): Promise<SuggestedTag[]> => {
  if (!genAI) {
    console.warn("Gemini AI client not initialized, NLP analysis is disabled.");
    return Promise.resolve([]);
  }

  if (!notes.trim()) {
    return Promise.resolve([]);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Como um microserviço de NLP especializado em psicologia, analise o texto da sessão a seguir. Sua tarefa é:
1. Identificar entidades clínicas chave, temas, emoções e tópicos discutidos (ex: "ansiedade social", "crise de pânico", "luto", "conflito familiar", "ideação suicida").
2. Para cada tema identificado, gere uma tag curta e concisa em português.
3. Atribua um score de relevância de 0.0 a 1.0 para cada tag, indicando o quão central o tema é na sessão.
4. Retorne no máximo 7 tags, ordenadas pela maior relevância. Não inclua temas triviais.
5. A sua resposta DEVE ser um JSON array válido.

Texto da sessão:
"""
${notes}
"""`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const jsonResponse: GeminiTagResponse[] = JSON.parse(text);

    const suggestedTags: SuggestedTag[] = jsonResponse.map((item) => ({
      id: crypto.randomUUID(),
      text: item.tag,
      relevance: item.relevance,
    }));

    return suggestedTags.sort((a, b) => b.relevance - a.relevance);
  } catch (error) {
    console.error("Error analyzing session notes with Gemini:", error);
    return [{ id: "error", text: "Erro na análise de IA", relevance: 1.0 }];
  }
};
