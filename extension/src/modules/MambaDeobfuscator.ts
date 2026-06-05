import type { VisitorCard } from './MambaBridge';

export class MambaDeobfuscator {
  private intersectionObserver: IntersectionObserver;

  constructor() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const visitorData = (element as any)._visitorData as VisitorCard;
          if (visitorData) {
            this.unmask(visitorData);
            this.intersectionObserver.unobserve(element);
          }
        }
      });
    }, { threshold: 0.1 });
  }

  observe(card: VisitorCard) {
    (card.element as any)._visitorData = card;
    this.intersectionObserver.observe(card.element);
  }

  private async unmask(card: VisitorCard) {
    console.log(`MambaDeobfuscator: Unmasking user ${card.userId}...`);
    
    if (!card.blurredImage) return;

    // Strategy 1: Remove CSS Blur
    card.blurredImage.style.filter = 'none';
    card.blurredImage.style.backdropFilter = 'none';

    // Strategy 2: URL Manipulation
    const currentSrc = card.blurredImage.src;
    const unmaskedSrc = this.tryGetUnmaskedUrl(currentSrc);

    if (unmaskedSrc !== currentSrc) {
      card.blurredImage.src = unmaskedSrc;
    }

    // Strategy 3: Fetch from Profile (Fallback)
    // This would require a more complex fetch/parse logic
    // For now, we flag as completed
    card.element.dataset.deobfuscated = 'true';
  }

  private tryGetUnmaskedUrl(url: string): string {
    // Examples: 
    // .../photo_blurred.jpg -> .../photo.jpg
    // .../100x100_blur.jpg -> .../huge.jpg
    return url
      .replace(/_blurred|_blur|_small|_100x100/g, '')
      .replace(/\?.*blur=\d+/, '');
  }
}
