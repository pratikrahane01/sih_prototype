import { LanguageService } from './LanguageService';

export type SpeechRecognitionState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'ERROR' | 'UNSUPPORTED';

class SpeechRecognitionServiceClass {
  private recognition: any = null;
  private isSupportedBrowser = false;
  private intentionalStop = false;

  constructor() {
    this.init();
  }

  private init() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupportedBrowser = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // Keep listening for partial phrases
      this.recognition.interimResults = true;
    }
  }

  public isSupported(): boolean {
    return this.isSupportedBrowser;
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
      if (!this.isSupportedBrowser || !this.recognition) {
        onStateChange('UNSUPPORTED');
        onError(new Error("Voice input is not supported on this device."));
        return;
      }

      // Configure language based on the user's current profile
      const currentLangCode = LanguageService.getCurrentLanguageCode();
      
      // Standard BCP-47 language tags for the speech recognition engine
      let bcp47 = 'en-US';
      if (currentLangCode === 'hi') bcp47 = 'hi-IN';
      if (currentLangCode === 'as') bcp47 = 'as-IN';
      if (currentLangCode === 'mr') bcp47 = 'mr-IN';
      
      this.recognition.lang = bcp47;

      this.recognition.onstart = () => {
        onStateChange('LISTENING');
      };

      this.recognition.onresult = (event: any) => {
        onStateChange('PROCESSING');
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const isFinal = finalTranscript.length > 0;
        const transcript = isFinal ? finalTranscript : interimTranscript;
        
        if (transcript.trim().length > 0) {
          onResult(transcript, isFinal);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          this.intentionalStop = true;
          onStateChange('ERROR');
          onError(new Error("Microphone access is needed for voice input."));
        } else if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
          this.intentionalStop = true;
          onStateChange('ERROR');
          onError(new Error("Speech recognition error."));
        }
      };

      this.recognition.onend = () => {
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
