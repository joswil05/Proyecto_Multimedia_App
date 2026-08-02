import { AIPolishData } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export type PolishFocus = 'viral' | 'educativo' | 'comunidad' | 'simplificar' | 'default';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface AssistantAction {
  type: 'CREATE_IDEA' | 'UPDATE_IDEA';
  payload: any;
}

export interface ChatResponse {
  text: string;
  action?: AssistantAction;
}

export const polishIdeaWithGemini = async (ideaText: string, focus: PolishFocus = 'default'): Promise<AIPolishData> => {
  if (!API_KEY) {
    throw new Error('No se ha configurado la API Key de Gemini en EXPO_PUBLIC_GEMINI_API_KEY');
  }

  let focusInstruction = '';
  switch (focus) {
    case 'viral':
      focusInstruction = 'Haz que los ángulos sean altamente virales, polémicos o con ganchos de extrema retención.';
      break;
    case 'educativo':
      focusInstruction = 'Enfócate en la enseñanza paso a paso, aportando valor práctico y claro.';
      break;
    case 'comunidad':
      focusInstruction = 'Genera ángulos que inviten a la interacción, comentarios y conexión emocional con la audiencia.';
      break;
    case 'simplificar':
      focusInstruction = 'Haz que la producción sea lo más sencilla posible, ideal para grabar rápido sin tanta edición.';
      break;
  }

  const prompt = `Actúa como un Co-Director Creativo experto en redes sociales.
Analiza la siguiente idea de contenido: "${ideaText}"

${focusInstruction}

Devuelve estrictamente un objeto JSON con la siguiente estructura y sin formato markdown alrededor, solo el JSON:
{
  "conceptAngles": [
    { "title": "Título o gancho 1", "narrative": "Cómo grabar/abordar 1" },
    { "title": "Título o gancho 2", "narrative": "Cómo grabar/abordar 2" },
    { "title": "Título o gancho 3", "narrative": "Cómo grabar/abordar 3" }
  ],
  "recommendedFormat": "Formato óptimo (ej. Reel, Carrusel, etc.)",
  "productionTip": "Un consejo clave de producción o grabación",
  "suggestedCaption": "Un borrador de caption para el post"
}
`;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Error en Gemini API: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Respuesta inválida de Gemini');
    }

    const parsedData: AIPolishData = JSON.parse(responseText);
    return parsedData;
  } catch (error) {
    console.error('Error in polishIdeaWithGemini:', error);
    throw error;
  }
};

const SYSTEM_PROMPT = `Eres el Co-Director Creativo de una aplicación de gestión de contenido.
Tu tarea es conversar con el creador, ayudarle a hacer lluvia de ideas, responder preguntas de producción y ayudarle a gestionar sus ideas.
Si el usuario te pide crear una idea, debes responder de manera natural, pero al final de tu mensaje debes incluir obligatoriamente un bloque JSON con la acción a ejecutar.
Usa exactamente este formato si deseas ejecutar una acción:
\`\`\`json
{
  "action": "CREATE_IDEA",
  "payload": {
    "text": "Título corto y descriptivo de la idea",
    "pillar": "crecimiento",
    "channels": ["youtube", "tiktok", "instagram"]
  }
}
\`\`\`
Los canales válidos son: "youtube", "tiktok", "instagram", "twitter", "linkedin", "threads".
Los pilares válidos son: "crecimiento", "autoridad", "monetizacion".

Si no necesitas ejecutar ninguna acción, simplemente responde en Markdown normal con un tono animado y útil.`;

export const chatWithGemini = async (messages: ChatMessage[]): Promise<ChatResponse> => {
  if (!API_KEY) {
    throw new Error('No se ha configurado la API Key de Gemini en EXPO_PUBLIC_GEMINI_API_KEY');
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        generationConfig: {
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Error en Gemini API: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse action if present
    let action: AssistantAction | undefined = undefined;
    let cleanText = responseText;

    const jsonBlockRegex = /\`\`\`json\s*(\{[\\s\\S]*?\})\s*\`\`\`/;
    const match = responseText.match(jsonBlockRegex);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed.action && parsed.payload) {
          action = { type: parsed.action as 'CREATE_IDEA' | 'UPDATE_IDEA', payload: parsed.payload };
          // Remove the json block from the user-facing text
          cleanText = responseText.replace(jsonBlockRegex, '').trim();
        }
      } catch (e) {
        console.error("Failed to parse action json", e);
      }
    }

    return { text: cleanText, action };
  } catch (error) {
    console.error('Error in chatWithGemini:', error);
    throw error;
  }
};
