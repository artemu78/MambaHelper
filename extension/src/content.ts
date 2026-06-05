import React from 'react';
import { createRoot } from 'react-dom/client';
import { MambaBridge } from './modules/MambaBridge';
import { MambaDeobfuscator } from './modules/MambaDeobfuscator';
import { SparkleButton } from './components/SparkleButton';

console.log('MambaHelper: Content script loaded.');

const deobfuscator = new MambaDeobfuscator();

const bridge = new MambaBridge(
  (card) => {
    deobfuscator.observe(card);
  },
  (container) => {
    console.log('MambaHelper: Injecting Sparkle button into chat input...');
    const mountPoint = document.createElement('div');
    mountPoint.id = 'mamba-helper-sparkle-mount';
    container.appendChild(mountPoint);

    const root = createRoot(mountPoint);
    root.render(React.createElement(SparkleButton));
  }
);

// Start the bridge
bridge.start();
