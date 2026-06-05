import type { UserPersona } from '../services/PersonalizationService';

export interface ChatMessage {
  role: 'me' | 'them';
  text: string;
}

export interface AnalysisResponse {
  analysis: string;
  suggestions: string[];
}

export class DaterEngineService {
  private static API_BASE = 'http://localhost:8000';

  static async analyzeChat(persona: UserPersona, history: ChatMessage[]): Promise<AnalysisResponse> {
    const response = await fetch(`${this.API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: persona.userId,
        chatHistory: history,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }

    return response.json();
  }

  static async syncPersona(persona: UserPersona): Promise<void> {
    await fetch(`${this.API_BASE}/sync/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(persona),
    });
  }
}
