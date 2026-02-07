
import { Message } from '../types';
import { OPENROUTER_API_KEY, DEFAULT_MODEL } from '../constants';

export async function getAICompletion(messages: Message[], model: string = DEFAULT_MODEL): Promise<string> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Sanjay AI Interview Platform",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response generated.";
  } catch (error: any) {
    console.error("AI Service Error:", error);
    throw error;
  }
}
