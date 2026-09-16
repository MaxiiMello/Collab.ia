// ======================================
// Collab.ia — Google Gemini Client
// Análisis de texto → JSON estructurado
// ======================================
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// System prompt estricto para extracción de datos
const EXTRACTION_SYSTEM_PROMPT = `Eres un extractor de datos para Collab.ia, una plataforma de voluntariado en la frontera Uruguay-Brasil.
Tu única tarea es analizar el texto del usuario y devolver un JSON VÁLIDO con exactamente estos campos:
{
  "title": "string corto descriptivo en español (máximo 60 caracteres)",
  "required_skills": ["array", "de", "habilidades", "técnicas", "específicas"],
  "required_availability": "string describiendo cuándo se necesita el voluntario",
  "location": "ciudad y país (ej: Rivera, Uruguay o Santana do Livramento, Brasil)"
}

Reglas:
- required_skills debe contener palabras clave técnicas específicas (ej: 'diseño gráfico', 'fotografía', 'sonido', 'carpintería')
- Si no puedes extraer una ciudad específica, usa "Rivera/Livramento"
- NO agregues texto adicional, explicaciones ni markdown. Solo el JSON puro y válido.
- Responde siempre en español`;

export interface ExtractedNeedData {
  title: string;
  required_skills: string[];
  required_availability: string;
  location: string;
}

export async function extractNeedFromText(description: string): Promise<ExtractedNeedData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1, // baja temperatura para output más determinístico
    },
    systemInstruction: EXTRACTION_SYSTEM_PROMPT,
  });

  const prompt = `Analiza esta solicitud de voluntario y extrae los datos:\n\n"${description}"`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parsear el JSON devuelto por Gemini
  const parsed = JSON.parse(text) as ExtractedNeedData;

  // Validación básica
  if (!parsed.title || !Array.isArray(parsed.required_skills)) {
    throw new Error('Gemini devolvió un JSON inválido');
  }

  return parsed;
}
