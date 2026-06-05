export type DatingGoal = 'serious' | 'casual' | 'friendship' | 'not_sure';
export type CommunicationStyle = 'witty' | 'direct' | 'romantic' | 'casual' | 'intellectual';

export interface UserPersona {
  userId: string;
  name: string;
  age?: number;
  goals: DatingGoal[];
  style: CommunicationStyle;
  bio: string;
  redFlags: string[];
  preferences: {
    interests: string[];
    lookingFor: string;
  };
  lastUpdated: number;
}

export const DEFAULT_PERSONA: UserPersona = {
  userId: '',
  name: '',
  goals: ['not_sure'],
  style: 'casual',
  bio: '',
  redFlags: [],
  preferences: {
    interests: [],
    lookingFor: '',
  },
  lastUpdated: Date.now(),
};

export class PersonalizationService {
  private static STORAGE_KEY = 'mamba_helper_persona';

  static async getPersona(): Promise<UserPersona> {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.STORAGE_KEY], (result) => {
        let stored = result[this.STORAGE_KEY] as UserPersona | undefined;
        
        if (!stored) {
          stored = { ...DEFAULT_PERSONA, userId: crypto.randomUUID() };
        } else if (!stored.userId) {
          stored.userId = crypto.randomUUID();
        }
        
        resolve(stored);
      });
    });
  }

  static async savePersona(persona: UserPersona): Promise<void> {
    return new Promise((resolve) => {
      const updatedPersona = { ...persona, lastUpdated: Date.now() };
      chrome.storage.local.set({ [this.STORAGE_KEY]: updatedPersona }, () => {
        resolve();
      });
    });
  }

  static async isOnboardingComplete(): Promise<boolean> {
    const persona = await this.getPersona();
    return !!persona.name && persona.goals.length > 0;
  }
}
