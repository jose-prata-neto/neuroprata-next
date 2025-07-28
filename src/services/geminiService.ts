
import { GoogleGenAI, Type } from "@google/genai";
import type { SuggestedTag } from '@/types';

const API_KEY = process.env.API_KEY;

// Conditionally initialize the AI client only if the API key exists.
// This prevents a crash on startup if the key is not configured.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

if (!ai) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

export const analyzeSessionNotes = async (notes: string): Promise<SuggestedTag[]> => {
  // Check for the initialized client instance, not just the key.
  if (!ai) {
    console.warn("Gemini AI client not initialized, NLP analysis is disabled.");
    return Promise.resolve([]);
  }

  if (!notes.trim()) {
    return Promise.resolve([]);
  }
  
  const prompt = `Como um microserviço de NLP especializado em psicologia, analise o texto da sessão a seguir. Sua tarefa é:
1. Identificar entidades clínicas chave, temas, emoções e tópicos discutidos (ex: "ansiedade social", "crise de pânico", "luto", "conflito familiar", "ideação suicida").
2. Para cada tema identificado, gere uma tag curta e concisa em português.
3. Atribua um score de relevância de 0.0 a 1.0 para cada tag, indicando o quão central o tema é na sessão.
4. Retorne no máximo 7 tags, ordenadas pela maior relevância. Não inclua temas triviais.

Texto da sessão:
"""
${notes}
"""`;
    
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tag: {
                type: Type.STRING,
                description: 'A tag clínica concisa em português.'
              },
              relevance: {
                type: Type.NUMBER,
                description: 'O score de relevância de 0.0 a 1.0.'
              }
            },
            required: ['tag', 'relevance']
          }
        },
        temperature: 0.3,
      }
    });

    const jsonResponse = JSON.parse(response.text);

    const suggestedTags: SuggestedTag[] = jsonResponse.map((item: any) => ({
      id: crypto.randomUUID(),
      text: item.tag,
      relevance: item.relevance,
    }));
    
    return suggestedTags.sort((a, b) => b.relevance - a.relevance);

  } catch (error) {
    console.error("Error analyzing session notes with Gemini:", error);
    return [{ id: 'error', text: 'Erro na análise de IA', relevance: 1.0 }];
  }
};
