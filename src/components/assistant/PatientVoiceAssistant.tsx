import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Volume2, Loader2, AlertCircle, MessageSquare, Send, Square } from 'lucide-react';
import { AssistantService } from '../../services/ai/AssistantService';
import { SpeechRecognitionService, type SpeechRecognitionState } from '../../services/accessibility/SpeechRecognitionService';
import { SpeechSynthesisService } from '../../services/accessibility/SpeechSynthesisService';
import { PatientService } from '../../services/api/PatientService';
import { useLanguage } from '../../contexts/LanguageContext';

type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const PatientVoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const { t } = useLanguage();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Keep track of the current state to prevent duplicate calls
  const stateRef = useRef<VoiceState>('IDLE');
  useEffect(() => {
    stateRef.current = voiceState;
  }, [voiceState]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentTranscript, voiceState]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      handleStop();
    }
    return () => {
      SpeechRecognitionService.abort();
      SpeechSynthesisService.stop();
    };
  }, [isOpen]);

  const handleStop = () => {
    SpeechRecognitionService.abort();
    SpeechSynthesisService.stop();
    setVoiceState('IDLE');
    setCurrentTranscript('');
  };

  const startListening = () => {
    if (stateRef.current === 'LISTENING' || stateRef.current === 'SPEAKING' || stateRef.current === 'PROCESSING') return;
    
    // Stop any ongoing speech
    SpeechSynthesisService.stop();
    
    setVoiceState('LISTENING');
    setErrorText('');
    setCurrentTranscript('');

    SpeechRecognitionService.startListening(
      (state: SpeechRecognitionState) => {
        if (state === 'ERROR' || state === 'UNSUPPORTED') {
          setVoiceState('ERROR');
          setErrorText(t('assistant.voiceUnavailable', 'Voice unavailable. Please try typing.'));
        }
      },
      (result: string, isFinal: boolean) => {
        setCurrentTranscript(result);
        if (isFinal && result.trim()) {
          handleFinalVoiceInput(result.trim());
        } else if (isFinal && !result.trim()) {
           setVoiceState('ERROR');
           setErrorText(t('assistant.noSpeech', "I couldn't hear anything. Please try again."));
        }
      },
      (err: Error) => {
        console.error("Speech Recognition Error", err);
        setVoiceState('ERROR');
        setErrorText(t('assistant.voiceUnavailable', 'Voice unavailable. Please try typing.'));
      }
    );
  };

  const handleFinalVoiceInput = async (text: string) => {
    SpeechRecognitionService.stopListening();
    setCurrentTranscript('');
    await processUserInput(text);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || stateRef.current === 'PROCESSING') return;
    
    handleStop(); // Stop any ongoing voice or speech
    const text = inputText.trim();
    setInputText('');
    await processUserInput(text);
  };

  const processUserInput = async (text: string) => {
    setVoiceState('PROCESSING');
    
    // Add User Message
    const userMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text }]);
    
    try {
      const patientId = PatientService.getProfile()?.id || 'demo-patient';
      
      // Call Existing Assistant Logic
      const responseText = await AssistantService.generateResponse(patientId, text);
      
      // Add Assistant Message
      const astMsgId = crypto.randomUUID();
      setMessages(prev => [...prev, { id: astMsgId, role: 'assistant', text: responseText }]);
      
      // Speak the response
      setVoiceState('SPEAKING');
      await SpeechSynthesisService.speak(responseText);
      
      // If we are still in speaking state (not cancelled) after speech finishes, return to IDLE
      if (stateRef.current === 'SPEAKING') {
        setVoiceState('IDLE');
      }
    } catch (error) {
      console.error("Assistant Processing Error", error);
      setVoiceState('ERROR');
      setErrorText(t('assistant.error', 'Sorry, I encountered an error.'));
    }
  };

  const renderStateBanner = () => {
    switch (voiceState) {
      case 'LISTENING':
        return (
          <div className="bg-primary-teal/10 text-primary-teal p-4 rounded-2xl flex items-center gap-3 animate-pulse">
            <div className="bg-primary-teal p-2 rounded-full">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">{t('assistant.listening', "I'm listening...")}</span>
          </div>
        );
      case 'PROCESSING':
        return (
          <div className="bg-ai-blue/10 text-ai-blue p-4 rounded-2xl flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-ai-blue" />
            <span className="text-xl font-bold">{t('assistant.processing', "Thinking...")}</span>
          </div>
        );
      case 'SPEAKING':
        return (
          <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
                <Volume2 className="w-8 h-8 animate-pulse text-green-600" />
                <span className="text-xl font-bold">Speaking...</span>
             </div>
             <button 
               onClick={handleStop}
               className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-bold"
             >
               <Square className="w-5 h-5 fill-current" /> Stop
             </button>
          </div>
        );
      case 'ERROR':
        return (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-8 h-8" />
            <span className="text-lg font-bold">{errorText}</span>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 text-gray-500 p-4 rounded-2xl flex items-center gap-3">
            <span className="text-lg font-medium">Tap the microphone to talk</span>
          </div>
        );
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-28 md:bottom-32 right-6 md:right-8 bg-primary-teal text-white p-5 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all z-40 group flex items-center gap-3"
          aria-label="Open Voice Assistant"
        >
          <Mic className="w-8 h-8" />
          <span className="hidden group-hover:inline font-bold pr-2 whitespace-nowrap">{t('assistant.askAssistant', 'Ask Assistant')}</span>
        </button>
      )}

      {/* Assistant Modal / Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-28 sm:right-8 sm:w-[450px] sm:h-[600px] bg-white sm:rounded-[32px] shadow-2xl z-50 flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-primary-teal text-white p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-wide">Smaran Assistant</h2>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {/* Chat History Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <Mic className="w-16 h-16 text-primary-teal" />
                <p className="text-xl font-medium text-gray-500 max-w-[250px]">
                  {t('assistant.howCanIHelp', 'How can I help you today?')}
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-3xl p-4 text-lg shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary-teal text-white rounded-br-sm' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            
            {/* Real-time transcript preview */}
            {currentTranscript && voiceState === 'LISTENING' && (
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-primary-teal/60 text-white rounded-3xl rounded-br-sm p-4 text-lg italic shadow-sm">
                  {currentTranscript}...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Controls Area */}
          <div className="bg-white p-5 border-t border-gray-100 shrink-0 flex flex-col gap-4">
            
            {/* Status Banner */}
            {renderStateBanner()}

            {/* Input Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={voiceState === 'LISTENING' ? handleStop : startListening}
                disabled={voiceState === 'PROCESSING' || voiceState === 'SPEAKING'}
                className={`p-4 rounded-2xl flex-shrink-0 transition-all ${
                  voiceState === 'LISTENING'
                    ? 'bg-red-100 text-red-600 scale-105' 
                    : voiceState === 'PROCESSING' || voiceState === 'SPEAKING'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-teal text-white hover:bg-teal-700'
                }`}
                aria-label={voiceState === 'LISTENING' ? "Stop listening" : "Start listening"}
              >
                {voiceState === 'LISTENING' ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
              </button>
              
              <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary-teal text-gray-800"
                  disabled={voiceState === 'PROCESSING'}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || voiceState === 'PROCESSING'}
                  className="bg-gray-100 text-primary-teal p-4 rounded-2xl disabled:opacity-50 disabled:text-gray-400 hover:bg-gray-200 transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-7 h-7" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
