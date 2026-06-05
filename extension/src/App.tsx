import { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { PersonalizationService } from './services/PersonalizationService';
import type { UserPersona } from './services/PersonalizationService';

function App() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    PersonalizationService.isOnboardingComplete().then(setIsOnboarded);
  }, []);

  const handleOnboardingComplete = async (persona: UserPersona) => {
    await PersonalizationService.savePersona(persona);
    setIsOnboarded(true);
  };

  if (isOnboarded === null) return <div>Loading...</div>;

  return (
    <div style={{ width: '400px', minHeight: '300px' }}>
      {!isOnboarded ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h2>MambaHelper Active</h2>
          <p>Unmasking is automatic on the visitors page.</p>
          <p>Open any chat to see the AI suggestions button.</p>
          <button 
            onClick={() => setIsOnboarded(false)}
            style={{ marginTop: '20px', fontSize: '12px', cursor: 'pointer' }}
          >
            Reset Settings (Debug)
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
