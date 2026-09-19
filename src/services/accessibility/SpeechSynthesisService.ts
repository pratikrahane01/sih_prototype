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
  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSupportedBrowser || !LanguageService.isVoiceModeEnabled()) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const currentLangCode = LanguageService.getCurrentLanguageCode();
      let targetLang = 'en-US';
      if (currentLangCode === 'hi') targetLang = 'hi-IN';
      if (currentLangCode === 'as') targetLang = 'as-IN';
      if (currentLangCode === 'mr') targetLang = 'mr-IN';
      
      utterance.lang = targetLang;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        let bestVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang.split('-')[0]));
        if (!bestVoice && (currentLangCode === 'mr' || currentLangCode === 'as' || currentLangCode === 'hi')) {
          bestVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
        }
        if (!bestVoice) {
          bestVoice = voices.find(v => v.lang === 'en-US') || voices[0];
        }
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
      }

      (window as any)._currentUtterance = utterance;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        resolve();
      };
      utterance.onerror = () => {
        resolve(); // Continue gracefully
      };

      window.speechSynthesis.speak(utterance);
      
      // Fallback just in case onend never fires (known bug in some browsers)
      setTimeout(resolve, Math.max(3000, text.length * 100 + 1000));
    });
  }

  public stop() {
    if (this.isSupportedBrowser) {
      window.speechSynthesis.cancel();
    }
  }
}

export const SpeechSynthesisService = new SpeechSynthesisServiceClass();
