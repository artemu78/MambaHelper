# MambaHelper Domain Context

## Core Concepts

- **Visitor Deobfuscation (Unmasking):** The process of revealing the clear profile photo of a user who visited your profile, which is blurred by default in the "Visitors" section.
- **DaterEngine:** The AI analysis component that processes chat history and profile information to provide strategic advice.
- **Personalization Profile (Persona):** A user-defined and AI-refined set of preferences, goals, and communication styles.
- **Passive Observation:** The background process of analyzing the user's successful chat patterns to improve the Personalization Profile.
- **Event-List/All:** The specific Mamba.ru page where visitors are listed and where automatic unmasking is triggered.

## Modules

- **MambaBridge:** Handles DOM interaction and network request interception.
- **MambaDeobfuscator:** Implements the lazy-loading logic for unmasking visitor photos.
- **DaterEngine:** Interface for LLM-based chat and profile analysis.
- **Personalization:** Manages state and storage for user preferences.
- **OverlayUI:** React components injected into the Mamba web interface.

## Technical Stack

- **Extension:** React 18, Vite, TypeScript.
- **Backend:** FastAPI, Python, OpenAI/Gemini integration.
- **Storage:** Chrome Local Storage (Extension) + Backend Database (Full Sync).
