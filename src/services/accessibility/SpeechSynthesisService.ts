import { LanguageService } from './LanguageService';

class SpeechSynthesisServiceClass {
  private isSupportedBrowser = false;

  constructor() {
    this.isSupportedBrowser = 'speechSynthesis' in window;
  }

  public isSupported(): boolean {
    return this.isSupportedBrowser;
  }

  /**
   * Speaks the provided text if voice mode is enabled and the browser supports it.
   */
  public speak(text: string) {
    if (!this.isSupportedBrowser) return;
    
    // Only speak if the patient has Voice Mode explicitly enabled
    if (!LanguageService.isVoiceModeEnabled()) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const currentLangCode = LanguageService.getCurrentLanguageCode();
    
    // Map to BCP-47 for speech synthesis
    if (currentLangCode === 'en') utterance.lang = 'en-US';
    if (currentLangCode === 'hi') utterance.lang = 'hi-IN';
    if (currentLangCode === 'as') utterance.lang = 'as-IN';
    if (currentLangCode === 'mr') utterance.lang = 'mr-IN';

    // Adjust for elderly users: slightly slower, clear pitch
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (this.isSupportedBrowser) {
      window.speechSynthesis.cancel();
    }
  }
}

export const SpeechSynthesisService = new SpeechSynthesisServiceClass();
