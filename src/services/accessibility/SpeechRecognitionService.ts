import { LanguageService } from './LanguageService';

export type SpeechRecognitionState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'ERROR' | 'UNSUPPORTED';

class SpeechRecognitionServiceClass {
  private recognition: any = null;
  private isSupportedBrowser = false;

  constructor() {
    this.init();
  }

  private init() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupportedBrowser = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // Stop listening after one phrase
      this.recognition.interimResults = false;
    }
  }

  public isSupported(): boolean {
    return this.isSupportedBrowser;
  }

  /**
   * Starts listening for speech.
   * Resolves with the transcribed text, or rejects with an error.
   */
  public startListening(onStateChange: (state: SpeechRecognitionState) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isSupportedBrowser || !this.recognition) {
        onStateChange('UNSUPPORTED');
        reject(new Error("Voice input is not supported on this device."));
        return;
      }

      // Configure language based on the user's current profile
      const currentLangCode = LanguageService.getCurrentLanguageCode();
      
      // Standard BCP-47 language tags for the speech recognition engine
      let bcp47 = 'en-US';
      if (currentLangCode === 'hi') bcp47 = 'hi-IN';
      if (currentLangCode === 'as') bcp47 = 'as-IN'; // If the browser supports Assamese
      
      this.recognition.lang = bcp47;

      this.recognition.onstart = () => {
        onStateChange('LISTENING');
      };

      this.recognition.onresult = (event: any) => {
        onStateChange('PROCESSING');
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Soft error
          onStateChange('ERROR');
          reject(new Error("I didn't hear anything. Please try again."));
        } else if (event.error === 'not-allowed') {
          onStateChange('ERROR');
          reject(new Error("Microphone access is needed for voice input. You can continue using text."));
        } else {
          onStateChange('ERROR');
          reject(new Error("Speech recognition error."));
        }
      };

      this.recognition.onend = () => {
        // If it ended without results or error, we usually go back to idle.
        // The promise should have already resolved or rejected.
      };

      try {
        this.recognition.start();
      } catch (err) {
        // Handle cases where start() is called while already started
        onStateChange('ERROR');
        reject(err);
      }
    });
  }

  public stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export const SpeechRecognitionService = new SpeechRecognitionServiceClass();
