import React, { useState } from 'react';
import { DaterEngineService } from '../services/DaterEngineService';
import type { AnalysisResponse } from '../services/DaterEngineService';
import { PersonalizationService } from '../services/PersonalizationService';
import { MambaBridge } from '../modules/MambaBridge';

export const SparkleButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const persona = await PersonalizationService.getPersona();
      const history = MambaBridge.scrapeChatHistory();
      
      if (history.length === 0) {
        throw new Error('No messages found to analyze.');
      }

      const result = await DaterEngineService.analyzeChat(persona, history);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="mamba-helper-sparkle-container" style={{ position: 'relative', display: 'inline-block', marginLeft: '10px' }}>
      <button
        id="mamba-helper-sparkle"
        onClick={handleAnalyze}
        disabled={loading}
        title="Analyze Chat"
        style={{
          background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          cursor: 'pointer',
          color: 'white',
          fontSize: '18px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {loading ? '...' : '✨'}
      </button>

      {(response || error) && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '0',
          width: '300px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          zIndex: 10000,
          fontFamily: 'sans-serif'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong style={{ color: '#333' }}>AI Analysis</strong>
            <button onClick={() => { setResponse(null); setError(null); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
          </div>

          {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
          
          {response && (
            <>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px', lineHeight: '1.4' }}>
                {response.analysis}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {response.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const input = document.querySelector('textarea, [contenteditable="true"]') as HTMLTextAreaElement;
                      if (input) {
                        if (input.tagName === 'TEXTAREA') {
                          input.value = s;
                        } else {
                          input.innerText = s;
                        }
                        setResponse(null);
                      }
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '8px',
                      fontSize: '12px',
                      backgroundColor: '#f0f4ff',
                      border: '1px solid #d0deff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
