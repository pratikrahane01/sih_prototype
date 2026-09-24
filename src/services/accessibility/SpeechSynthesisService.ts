import { LanguageService } from './LanguageService';

class SpeechSynthesisServiceClass {
  private isSupportedBrowser = false;
  private voicesLoaded = false;
  private voiceCache: SpeechSynthesisVoice[] = [];

  constructor() {
    this.isSupportedBrowser = 'speechSynthesis' in window;
    if (this.isSupportedBrowser) {
      // Diagnostic log
      console.log("[Diagnostics] SpeechSynthesis: Browser supports speechSynthesis API.");
      
      this.loadVoices().then(voices => {
        console.log(`[Diagnostics] SpeechSynthesis: Initialized with ${voices.length} voices.`);
      });
    } else {
      console.warn("[Diagnostics] SpeechSynthesis: Browser DOES NOT support speechSynthesis API.");
    }
  }

  public isSupported(): boolean {
    return this.isSupportedBrowser;
  }

  /**
   * Loads voices asynchronously handling the `onvoiceschanged` event.
   */
  private loadVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!this.isSupportedBrowser) {
        return resolve([]);
      }

      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.voicesLoaded = true;
        this.voiceCache = voices;
        return resolve(voices);
      }

      // If not loaded, wait for the event
      const onVoicesChanged = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        voices = window.speechSynthesis.getVoices();
        this.voicesLoaded = true;
        this.voiceCache = voices;
        resolve(voices);
      };

      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      
      // Fallback timeout in case onvoiceschanged never fires
      setTimeout(() => {
        if (!this.voicesLoaded) {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
          voices = window.speechSynthesis.getVoices();
          this.voicesLoaded = true;
          this.voiceCache = voices;
          resolve(voices);
        }
      }, 1500);
    });
  }

  /**
   * Resolves the best available voice for the given language code.
   * Priority: Exact match -> Language match -> Family/Region Fallback -> System Default
   */
  private resolveVoice(voices: SpeechSynthesisVoice[], targetLangCode: string): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;

    console.log(`[Diagnostics] SpeechSynthesis: Resolving voice for requested locale: ${targetLangCode}`);
    
    // 1. Exact match (e.g., 'as-IN')
    let bestVoice = voices.find(v => v.lang === targetLangCode);
    
    // 2. Language match (e.g., 'as')
    if (!bestVoice) {
      const shortLang = targetLangCode.split('-')[0];
      bestVoice = voices.find(v => v.lang.startsWith(shortLang));
    }
    
    // 3. Fallback for regional Indian languages without native voices
    if (!bestVoice) {
      const shortLang = targetLangCode.split('-')[0];
      if (shortLang === 'as' || shortLang === 'mr' || shortLang === 'hi') {
        console.log(`[Diagnostics] SpeechSynthesis: Native voice unavailable for ${shortLang}. Falling back to Hindi (hi-IN).`);
        bestVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
      }
    }
    
    // 4. Ultimate fallback (English)
    if (!bestVoice) {
      console.log(`[Diagnostics] SpeechSynthesis: Ultimate fallback to English (en-US).`);
      bestVoice = voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en')) || voices[0];
    }
    
    if (bestVoice) {
      console.log(`[Diagnostics] SpeechSynthesis: Selected voice: ${bestVoice.name} (${bestVoice.lang})`);
    } else {
      console.log(`[Diagnostics] SpeechSynthesis: No voice could be resolved.`);
    }

    return bestVoice;
  }

  private transliterateAssameseToDevnagari(text: string): string {
    const map: Record<string, string> = {
      'অ': 'अ', 'আ': 'आ', 'ই': 'इ', 'ঈ': 'ई', 'উ': 'उ', 'ঊ': 'ऊ', 'ঋ': 'ऋ', 'এ': 'ए', 'ঐ': 'ऐ', 'ও': 'ओ', 'ঔ': 'औ',
      'ক': 'क', 'খ': 'ख', 'গ': 'ग', 'ঘ': 'घ', 'ঙ': 'ङ',
      'চ': 'च', 'ছ': 'छ', 'জ': 'ज', 'ঝ': 'झ', 'ঞ': 'ञ',
      'ট': 'ट', 'ঠ': 'ठ', 'ড': 'ड', 'ঢ': 'ढ', 'ণ': 'ण',
      'ত': 'त', 'থ': 'थ', 'দ': 'द', 'ধ': 'ध', 'ন': 'न',
      'প': 'प', 'ফ': 'फ', 'ব': 'ब', 'ভ': 'भ', 'ম': 'म',
      'য': 'य', 'ৰ': 'र', 'ল': 'ल', 'ৱ': 'व', 'শ': 'श', 'ষ': 'ष', 'স': 'स', 'হ': 'ह',
      'ক্ষ': 'क्ष', 'জ্ঞ': 'ज्ञ',
      'া': 'ा', 'ি': 'ि', 'ী': 'ी', 'ু': 'ु', 'ূ': 'ू', 'ৃ': 'ृ', 'ে': 'े', 'ৈ': 'ै', 'ো': 'ो', 'ৌ': 'ौ',
      '্': '्', 'ং': 'ं', 'ঃ': 'ः', 'ঁ': 'ँ', 'য়': 'य',
      'ড়': 'ड़', 'ঢ়': 'ढ़', 'য়': 'य'
    };
    return text.split('').map(c => map[c] || c).join('');
  }

  private cancelToken = 0;

  /**
   * Speaks the provided text if voice mode is enabled and the browser supports it.
   */
  public async speak(text: string): Promise<void> {
    if (!this.isSupportedBrowser || !LanguageService.isVoiceModeEnabled()) {
      return Promise.resolve();
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Increment token for this new utterance
    this.cancelToken++;
    const currentToken = this.cancelToken;

    // Ensure voices are loaded
    let voices = this.voiceCache;
    if (voices.length === 0) {
      voices = await this.loadVoices();
    }

    return new Promise((resolve) => {
      const currentLangCode = LanguageService.getCurrentLanguageCode();
      let targetLang = 'en-US';
      if (currentLangCode === 'hi') targetLang = 'hi-IN';
      if (currentLangCode === 'as') targetLang = 'as-IN';
      if (currentLangCode === 'mr') targetLang = 'mr-IN';
      
      const voice = this.resolveVoice(voices, targetLang);
      
      let finalSpeechText = text;
      if (voice && (voice.lang === 'hi-IN' || voice.lang.startsWith('hi')) && currentLangCode === 'as') {
        finalSpeechText = this.transliterateAssameseToDevnagari(finalSpeechText);
      }

      const utterance = new SpeechSynthesisUtterance(finalSpeechText);
      
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = targetLang; // Fallback
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      let hasResolved = false;

      utterance.onstart = () => {};

      utterance.onend = () => {
        if (!hasResolved) {
          hasResolved = true;
          if (this.cancelToken === currentToken) resolve();
        }
      };

      utterance.onerror = (e) => {
        console.error("[Diagnostics] SpeechSynthesis error:", e);
        if (!hasResolved) {
          hasResolved = true;
          if (this.cancelToken === currentToken) resolve();
        }
      };

      (window as any)._currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      
      setTimeout(() => {
        if (!hasResolved) {
          console.warn("[Diagnostics] SpeechSynthesis: onend timeout triggered.");
          hasResolved = true;
          if (this.cancelToken === currentToken) resolve();
        }
      }, Math.max(3000, text.length * 100 + 1000));
    });
  }

  public stop() {
    this.cancelToken++;
    if (this.isSupportedBrowser) {
      window.speechSynthesis.cancel();
    }
  }
}

export const SpeechSynthesisService = new SpeechSynthesisServiceClass();
