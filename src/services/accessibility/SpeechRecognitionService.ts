import { LanguageService } from './LanguageService';

export type SpeechRecognitionState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'ERROR' | 'UNSUPPORTED';

class SpeechRecognitionServiceClass {
  private recognition: any = null;
  private isSupportedBrowser = false;
  private intentionalStop = false;
  private fullFinalTranscript = '';
  private lastInterimTranscript = '';
  private SpeechRecognitionConstructor: any = null;

  constructor() {
    this.init();
  }

  private init() {
    // Check for browser support
    this.SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (this.SpeechRecognitionConstructor) {
      this.isSupportedBrowser = true;
      console.log("[Diagnostics] SpeechRecognition: Browser supports SpeechRecognition API.");
    } else {
      console.warn("[Diagnostics] SpeechRecognition: Browser DOES NOT support SpeechRecognition API.");
    }
  }

  public isSupported(): boolean {
    return this.isSupportedBrowser;
  }

  private resolveSpeechLocale(langCode: string): string {
    switch (langCode) {
      case 'as': return 'hi-IN'; // Fallback to Hindi STT for Assamese to guarantee mic opens
      case 'mr': return 'mr-IN';
      case 'hi': return 'hi-IN';
      case 'en': return 'en-IN';
      default: return 'en-US';
    }
  }

  private onStateChangeCb?: (state: SpeechRecognitionState) => void;
  private onResultCb?: (transcript: string, isFinal: boolean) => void;
  private onErrorCb?: (err: Error) => void;

  /**
   * Starts listening for speech in real-time.
   */
  public startListening(
    onStateChange: (state: SpeechRecognitionState) => void,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: Error) => void
  ): void {
      this.intentionalStop = false;
      this.fullFinalTranscript = '';
      this.lastInterimTranscript = '';
      this.onStateChangeCb = onStateChange;
      this.onResultCb = onResult;
      this.onErrorCb = onError;

      if (!this.isSupportedBrowser || !this.SpeechRecognitionConstructor) {
        console.warn("[Diagnostics] SpeechRecognition: Cannot start listening. Unsupported.");
        if (this.onStateChangeCb) this.onStateChangeCb('UNSUPPORTED');
        if (this.onErrorCb) this.onErrorCb(new Error("Browser does not support voice input. Please use Chrome or Edge."));
        return;
      }

      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {}
      }
      this.recognition = new this.SpeechRecognitionConstructor();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      const currentLangCode = LanguageService.getCurrentLanguageCode();
      const resolvedLocale = this.resolveSpeechLocale(currentLangCode);
      
      console.log(`[Diagnostics] SpeechRecognition: Starting engine. UI Lang: ${currentLangCode} -> Locale: ${resolvedLocale}`);
      this.recognition.lang = resolvedLocale;

      this.recognition.onstart = () => {
        if (this.onStateChangeCb) this.onStateChangeCb('LISTENING');
      };

      this.recognition.onresult = (event: any) => {
        if (this.onStateChangeCb) this.onStateChangeCb('PROCESSING');
        let currentFinal = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }
        
        this.fullFinalTranscript = currentFinal;
        
        const displayTranscript = currentFinal + currentInterim;
        this.lastInterimTranscript = displayTranscript;

        if (displayTranscript.trim().length > 0 && this.onResultCb) {
          this.onResultCb(displayTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          this.intentionalStop = true;
          if (this.onStateChangeCb) this.onStateChangeCb('ERROR');
          if (this.onErrorCb) this.onErrorCb(new Error("Microphone access is blocked. Please allow microphone access in your browser settings."));
        } else if (event.error === 'language-not-supported' || event.error === 'network') {
          console.warn(`[Diagnostics] SpeechRecognition Error: ${event.error} for ${this.recognition.lang}. Falling back to en-US.`);
          if (this.recognition.lang !== 'en-US') {
            this.recognition.lang = 'en-US';
            try {
              this.recognition.start();
            } catch (e) {
              this.intentionalStop = true;
              if (this.onStateChangeCb) this.onStateChangeCb('ERROR');
              if (this.onErrorCb) this.onErrorCb(new Error(event.error === 'network' ? "Network error: Voice input requires an internet connection." : "Voice input language is not supported on this device."));
            }
          } else {
            this.intentionalStop = true;
            if (this.onStateChangeCb) this.onStateChangeCb('ERROR');
            if (this.onErrorCb) this.onErrorCb(new Error(event.error === 'network' ? "Network error: Voice input requires an internet connection." : "Voice input language is not supported on this device."));
          }
        } else if (event.error !== 'no-speech' && event.error !== 'audio-capture' && event.error !== 'aborted') {
          console.error(`[Diagnostics] SpeechRecognition Error: ${event.error}. Locale: ${resolvedLocale}`);
          this.intentionalStop = true;
          if (this.onStateChangeCb) this.onStateChangeCb('ERROR');
          if (this.onErrorCb) this.onErrorCb(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      this.recognition.onend = () => {
        let finalTrimmed = this.fullFinalTranscript.trim();
        if (finalTrimmed.length === 0) {
          finalTrimmed = this.lastInterimTranscript.trim();
        }
        
        if (finalTrimmed.length > 0 && this.onResultCb) {
          console.log(`[Diagnostics] SpeechRecognition: Session ended. Final accumulated transcript: "${finalTrimmed}"`);
          this.onResultCb(finalTrimmed, true);
        }

        if (!this.intentionalStop) {
          try {
            this.recognition.start();
          } catch (e) {}
        }
      };

      try {
        this.recognition.start();
      } catch (err: any) {}
  }

  public stopListening() {
    this.intentionalStop = true;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public abort() {
    this.intentionalStop = true;
    this.onStateChangeCb = undefined;
    this.onResultCb = undefined;
    this.onErrorCb = undefined;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}

export const SpeechRecognitionService = new SpeechRecognitionServiceClass();
