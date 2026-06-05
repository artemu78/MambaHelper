import type { ChatMessage } from '../services/DaterEngineService';

export interface VisitorCard {
  element: HTMLElement;
  userId: string | null;
  blurredImage: HTMLImageElement | null;
}

export class MambaBridge {
  private observer: MutationObserver | null = null;
  private onVisitorDetected: (card: VisitorCard) => void;
  private onChatDetected: (container: HTMLElement) => void;

  constructor(
    onVisitorDetected: (card: VisitorCard) => void,
    onChatDetected: (container: HTMLElement) => void
  ) {
    this.onVisitorDetected = onVisitorDetected;
    this.onChatDetected = onChatDetected;
  }

  start() {
    console.log('MambaBridge: Starting DOM observation...');
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          this.scanForVisitors();
          this.scanForChat();
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial scans
    this.scanForVisitors();
    this.scanForChat();
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
  }

  private scanForVisitors() {
    if (!window.location.pathname.includes('event-list/all')) return;

    const cards = document.querySelectorAll('a[href*="/profile/"]');
    
    cards.forEach((card) => {
      const element = card as HTMLElement;
      if (element.dataset.deobfuscated) return;

      const userIdMatch = element.getAttribute('href')?.match(/\/profile\/(\d+)/);
      const userId = userIdMatch ? userIdMatch[1] : null;
      
      const blurredImage = element.querySelector('img') as HTMLImageElement;

      if (userId) {
        element.dataset.deobfuscated = 'pending';
        this.onVisitorDetected({ element, userId, blurredImage });
      }
    });
  }

  private scanForChat() {
    // Target common chat input or container indicators on Mamba
    // Typically message views have a specific class or container
    const chatInputArea = document.querySelector('[class*="chat-input"], [class*="message-form"]');
    
    if (chatInputArea && !chatInputArea.querySelector('#mamba-helper-sparkle')) {
      this.onChatDetected(chatInputArea as HTMLElement);
    }
  }

  static scrapeChatHistory(): ChatMessage[] {
    const messages: ChatMessage[] = [];
    
    // Mamba messages usually have distinct classes for 'inbound' and 'outbound'
    // This is a heuristic targeting common patterns
    const messageElements = document.querySelectorAll('[class*="message-item"], [class*="chat-msg"]');
    
    messageElements.forEach((el) => {
      const text = el.querySelector('[class*="text"], [class*="content"]')?.textContent?.trim();
      if (!text) return;

      // Determine role based on class or alignment
      const isMe = el.className.includes('outbound') || el.className.includes('my-msg');
      messages.push({
        role: isMe ? 'me' : 'them',
        text: text
      });
    });

    // Only take the last 15 messages for context
    return messages.slice(-15);
  }
}
