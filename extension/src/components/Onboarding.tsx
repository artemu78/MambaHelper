import React, { useState } from 'react';
import { DEFAULT_PERSONA } from '../services/PersonalizationService';
import type { UserPersona, DatingGoal, CommunicationStyle } from '../services/PersonalizationService';

interface OnboardingProps {
  onComplete: (persona: UserPersona) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState<UserPersona>(DEFAULT_PERSONA);

  const updatePersona = (updates: Partial<UserPersona>) => {
    setPersona((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep((s) => s + 1);

  return (
    <div style={{ padding: '20px', maxWidth: '400px', fontFamily: 'sans-serif' }}>
      {step === 1 && (
        <section>
          <h2>Welcome to MambaHelper</h2>
          <p>Let's set up your profile to give you better suggestions.</p>
          <label>
            What's your name?
            <input
              type="text"
              value={persona.name}
              onChange={(e) => updatePersona({ name: e.target.value })}
              style={{ display: 'block', width: '100%', margin: '10px 0', padding: '8px' }}
            />
          </label>
          <button onClick={nextStep} disabled={!persona.name} style={buttonStyle}>
            Next
          </button>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2>Dating Goals</h2>
          <p>What are you looking for?</p>
          {(['serious', 'casual', 'friendship', 'not_sure'] as DatingGoal[]).map((goal) => (
            <label key={goal} style={{ display: 'block', margin: '5px 0' }}>
              <input
                type="checkbox"
                checked={persona.goals.includes(goal)}
                onChange={(e) => {
                  const newGoals = e.target.checked
                    ? [...persona.goals.filter(g => g !== 'not_sure'), goal]
                    : persona.goals.filter((g) => g !== goal);
                  updatePersona({ goals: newGoals.length ? newGoals : ['not_sure'] });
                }}
              />
              {goal.replace('_', ' ')}
            </label>
          ))}
          <button onClick={nextStep} style={buttonStyle}>
            Next
          </button>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2>Communication Style</h2>
          <p>How do you usually talk to people?</p>
          {(['witty', 'direct', 'romantic', 'casual', 'intellectual'] as CommunicationStyle[]).map((style) => (
            <label key={style} style={{ display: 'block', margin: '5px 0' }}>
              <input
                type="radio"
                name="style"
                checked={persona.style === style}
                onChange={() => updatePersona({ style })}
              />
              {style}
            </label>
          ))}
          <button onClick={() => onComplete(persona)} style={buttonStyle}>
            Finish Setup
          </button>
        </section>
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '20px',
};
