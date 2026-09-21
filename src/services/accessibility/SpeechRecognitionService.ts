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

      if (!this.isSupportedBrowser || !this.SpeechRecognitionConstructor) {
        console.warn("[Diagnostics] SpeechRecognition: Cannot start listening. Unsupported.");
        onStateChange('UNSUPPORTED');
        onError(new Error("Voice input is not supported on this device."));
        return;
      }

      // Always recreate the recognition instance to guarantee language switches take effect
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {}
      }
      this.recognition = new this.SpeechRecognitionConstructor();
      this.recognition.continuous = false; // Auto-stop on silence to trigger onend
      this.recognition.interimResults = true;

      // Configure language based on the user's current profile
      const currentLangCode = LanguageService.getCurrentLanguageCode();
      const resolvedLocale = this.resolveSpeechLocale(currentLangCode);
      
      console.log(`[Diagnostics] SpeechRecognition: Starting engine. UI Lang: ${currentLangCode} -> Locale: ${resolvedLocale}`);
      this.recognition.lang = resolvedLocale;

      this.recognition.onstart = () => {
        onStateChange('LISTENING');
      };

      this.recognition.onresult = (event: any) => {
        onStateChange('PROCESSING');
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

        if (displayTranscript.trim().length > 0) {
          // Fire interim result so the UI updates
          onResult(displayTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          this.intentionalStop = true;
          onStateChange('ERROR');
          onError(new Error("Microphone access is needed for voice input."));
        } else if (event.error !== 'no-speech' && event.error !== 'audio-capture' && event.error !== 'aborted') {
          console.error(`[Diagnostics] SpeechRecognition Error: ${event.error}. Locale: ${resolvedLocale}`);
          this.intentionalStop = true;
          onStateChange('ERROR');
          onError(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      this.recognition.onend = () => {
        let finalTrimmed = this.fullFinalTranscript.trim();
        if (finalTrimmed.length === 0) {
          finalTrimmed = this.lastInterimTranscript.trim();
        }
        
        if (finalTrimmed.length > 0) {
          console.log(`[Diagnostics] SpeechRecognition: Session ended. Final accumulated transcript: "${finalTrimmed}"`);
          // Send the complete transcript to the evaluator
          onResult(finalTrimmed, true);
        }

        // Only restart if we haven't intentionally stopped AND we didn't just capture a final sentence.
        // Wait, if we captured a final sentence, `onResult(..., true)` will synchronously trigger `stopListening`
        // which sets `intentionalStop = true`. So this logic holds perfectly.
        if (!this.intentionalStop) {
          try {
            this.recognition.start();
          } catch (e) {
            // Ignore if already started
          }
        }
      };

      try {
        this.recognition.start();
      } catch (err: any) {
        // Ignore if already started
      }
  }

  public stopListening() {
    this.intentionalStop = true;
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export const SpeechRecognitionService = new SpeechRecognitionServiceClass();
