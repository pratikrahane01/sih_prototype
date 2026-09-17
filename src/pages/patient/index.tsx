import React, { useEffect, useState } from 'react';
import { PatientService } from '../../services/api/PatientService';
import type { Patient } from '../../types';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GameRegistry } from '../../data/GameRegistry';
import { GameEngine } from '../../components/engine/GameEngine';
import { Brain, Star, Activity, Map, Clock, Play, MapPin, UserCircle } from 'lucide-react';
import { RouteService } from '../../services/api/RouteService';
import nerHero from '../../assets/cultural/ner-hero.jpg';
import nerBanner from '../../assets/cultural/ner-banner.jpg';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Brain': return Brain;
    case 'Star': return Star;
    case 'Activity': return Activity;
    case 'Map': return Map;
    default: return Brain;
  }
};

const ActivityCard = ({ icon: Icon, title, description, to, bgColor, poster }: any) => (
  <Link to={to} className={`rounded-[24px] p-4 sm:p-5 flex flex-col justify-between transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md border border-white/50 min-h-[160px] sm:min-h-[180px] ${bgColor}`}>
    {poster ? (
      <div className="mb-3 relative h-24 sm:h-32 rounded-[18px] overflow-hidden shadow-sm shrink-0">
        <img src={poster} alt={`${title} activity illustration`} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 backdrop-blur-md shadow-sm">
          <Play className="w-3 h-3 sm:w-4 sm:h-4 text-text-charcoal ml-[1px]" />
        </div>
      </div>
    ) : (
      <div className="flex justify-between items-start mb-3">
        <div className="bg-white/90 rounded-[18px] p-3 text-text-charcoal shadow-sm">
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 stroke-2" />
        </div>
        <div className="bg-white/60 rounded-full p-1.5">
          <Play className="w-3 h-3 sm:w-4 sm:h-4 text-text-charcoal/60 ml-[1px]" />
        </div>
      </div>
    )}
    <div className="flex-grow flex flex-col justify-end">
      <h4 className="text-[17px] sm:text-xl font-bold text-text-charcoal leading-tight mb-1">{title}</h4>
      <p className="text-text-charcoal/70 text-[12px] sm:text-sm leading-snug font-medium">{description}</p>
    </div>
  </Link>
);

export const PatientHome: React.FC = () => {
  const [profile, setProfile] = useState<Patient | null>(null);
  
  useEffect(() => {
    setProfile(PatientService.getProfile());
  }, []);

  const displayName = profile?.nickname || profile?.name || 'Friend';

  // Map games to pastel colors
  const getColor = (domain: string) => {
    switch (domain) {
      case 'memory': return 'bg-[#FFE8E8]'; // Soft pink
      case 'attention': return 'bg-[#E8F0FE]'; // Soft blue
      case 'pattern': return 'bg-[#FFF3E0]'; // Soft amber
      case 'spatial': return 'bg-[#E8F5E9]'; // Soft sage/green
      default: return 'bg-[#F3E5F5]'; // Soft lavender
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8 mt-2 md:mt-4">
      {/* Greeting Section with Regional Hero Illustration */}
      <section className="relative w-full rounded-[32px] overflow-hidden min-h-[180px] md:min-h-[220px] flex items-center shadow-sm">
        <img src={nerHero} alt="Regional landscape" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
        <div className="relative z-10 p-6 md:p-10 w-full md:w-2/3">
          <h2 className="text-3xl sm:text-4xl md:text-[3.5rem] font-bold text-primary-teal mb-2 leading-tight">Good morning,<br/>{displayName}</h2>
          <p className="text-[17px] sm:text-lg md:text-2xl text-text-charcoal/80 font-medium">Let's play and keep your mind active!</p>
        </div>
      </section>

      {/* Cognitive Activities Section */}
      <section className="bg-white rounded-[32px] p-5 sm:p-6 md:p-10 shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Subtle decorative border (Assamese inspired motif via CSS) */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500/20 via-red-600/30 to-red-500/20"></div>
        
        <div className="flex flex-col mb-5 md:mb-8 pl-3">
          <h3 className="text-[1.5rem] sm:text-[1.75rem] md:text-3xl font-bold text-text-charcoal flex items-center gap-3">
            <Brain className="w-7 h-7 md:w-8 md:h-8 text-primary-teal" />
            Cognitive Activity Zone
          </h3>
          <p className="text-[14px] sm:text-[15px] md:text-lg text-text-charcoal/60 font-medium mt-1">Play, learn and keep your mind active with new activities</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {GameRegistry.map(game => (
            <ActivityCard
              key={game.id}
              icon={getIconComponent(game.icon)}
              title={game.name}
              description={game.description}
              to={`/patient/game/${game.id}`}
              bgColor={getColor(game.domain)}
            />
          ))}
          <ActivityCard
            icon={MapPin}
            title="Route Recall"
            description="Practice memory using personal routes."
            to="/patient/routes"
            bgColor="bg-[#E0F7FA]" // Cyan
          />
          <ActivityCard
            icon={Activity}
            title="More Games"
            description="Explore our full library of activities."
            to="/patient/games"
            bgColor="bg-[#E8F5E9]" // Soft green
          />
        </div>
      </section>

      {/* Quick Info & Care */}
      <section className="bg-white rounded-[32px] p-5 sm:p-6 md:p-10 shadow-sm border border-gray-100">
        <div className="flex flex-col mb-5 md:mb-8 pl-1">
          <h3 className="text-[1.5rem] sm:text-[1.75rem] md:text-3xl font-bold text-text-charcoal flex items-center gap-3">
            <div className="bg-primary-teal text-white p-1.5 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 fill-current" />
            </div>
            Quick Info & Care
          </h3>
          <p className="text-[14px] sm:text-[15px] md:text-lg text-text-charcoal/60 font-medium mt-1">Useful tools for your daily life</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Ask Assistant */}
          <Link to="/patient/assistant" className="bg-[#E8F0FE] rounded-[24px] p-4 sm:p-5 flex flex-col items-start hover:shadow-md transition-shadow group relative min-h-[140px] sm:min-h-[160px]">
            <div className="bg-white rounded-[16px] p-3 text-ai-blue shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 stroke-2" />
            </div>
            <h4 className="text-[16px] sm:text-[1.25rem] font-bold text-text-charcoal leading-tight mb-1">Ask Assistant</h4>
            <p className="text-text-charcoal/70 text-[12px] sm:text-sm font-medium pr-4 sm:pr-6">Talk to Calm Intelligence</p>
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-text-charcoal/40 absolute bottom-4 right-4 group-hover:text-primary-teal transition-colors" />
          </Link>
          
          {/* Recent Activity */}
          <Link to="/patient/games" className="bg-[#FFF3E0] rounded-[24px] p-4 sm:p-5 flex flex-col items-start hover:shadow-md transition-shadow group relative min-h-[140px] sm:min-h-[160px]">
            <div className="bg-white rounded-[16px] p-3 text-attention-amber shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 stroke-2" />
            </div>
            <h4 className="text-[16px] sm:text-[1.25rem] font-bold text-text-charcoal leading-tight mb-1">Recent Activity</h4>
            <p className="text-text-charcoal/70 text-[12px] sm:text-sm font-medium pr-4 sm:pr-6">View your past sessions</p>
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-text-charcoal/40 absolute bottom-4 right-4 group-hover:text-primary-teal transition-colors" />
          </Link>
        </div>
      </section>

      {/* Motivational Banner */}
      <section className="relative w-full rounded-[28px] overflow-hidden min-h-[130px] sm:min-h-[160px] flex items-center justify-center shadow-sm mb-6 border border-white/50">
        <img src={nerBanner} alt="Regional support banner" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/15"></div>
        <div className="relative z-10 p-5 sm:p-6 text-center w-full">
          <h4 className="text-[20px] sm:text-2xl md:text-3xl font-serif italic text-white drop-shadow-lg tracking-wide leading-snug">
            "A healthier mind<br className="sm:hidden" /> leads to a brighter tomorrow"
          </h4>
          <div className="w-10 sm:w-12 h-1 bg-white/70 mx-auto mt-3 sm:mt-4 rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export const GamesList: React.FC = () => {
  const navigate = useNavigate();

  const personalGames = GameRegistry.filter(g => g.domain.startsWith('personal_'));
  const cognitiveGames = GameRegistry.filter(g => !g.domain.startsWith('personal_'));

  const renderGameCard = (game: typeof GameRegistry[0]) => {
    const Icon = getIconComponent(game.icon);
    return (
      <div key={game.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <div className="flex items-start mb-4">
          <div className="w-16 h-16 bg-blue-50 text-ai-blue rounded-2xl flex items-center justify-center mr-4 shrink-0">
            {game.icon === 'Users' ? <UserCircle className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-text-charcoal mb-1">{game.name}</h3>
            <div className="flex items-center text-text-charcoal/60 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span>{game.estimatedDuration}</span>
            </div>
          </div>
        </div>
        
        <p className="text-lg text-text-charcoal/80 flex-1 mb-6">
          {game.description}
        </p>

        <button 
          onClick={() => navigate(`/patient/game/${game.id}`)}
          className="w-full flex items-center justify-center bg-gray-50 hover:bg-primary-teal hover:text-white text-primary-teal py-4 rounded-xl text-xl font-semibold transition-colors group"
        >
          <Play className="w-5 h-5 mr-2 group-hover:text-white text-primary-teal" />
          Start Activity
        </button>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* SECTION 1: Personal Memories */}
      <div className="mb-6 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-primary-teal mb-2">Personal Memories</h2>
        <p className="text-lg text-text-charcoal/80 mb-6 font-medium">Activities built from familiar people, places and moments.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {personalGames.map(renderGameCard)}
        </div>
      </div>

      <div className="w-full max-w-4xl h-px bg-gray-200 my-8"></div>

      {/* SECTION 2: Cognitive Activities */}
      <div className="mb-6 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-primary-teal mb-2">Cognitive Activities</h2>
        <p className="text-lg text-text-charcoal/80 mb-6 font-medium">Standard exercises to keep your mind active.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {cognitiveGames.map(renderGameCard)}
        </div>
      </div>

    </div>
  );
};


import { AdaptiveEngine } from '../../services/ai';

export const SingleGame: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const game = GameRegistry.find(g => g.id === id);
  const [difficulty, setDifficulty] = useState<number | null>(null);

  useEffect(() => {
    const fetchDifficulty = async () => {
      if (!game) return;
      
      const patient = PatientService.getProfile();
      if (!patient) return;

      const recommendation = await AdaptiveEngine.getRecommendedDifficulty(patient.id, game.domain, game.id);
      setDifficulty(recommendation.recommendedDifficulty);
    };

    fetchDifficulty();
  }, [game]);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Activity Not Found</h2>
        <Link to="/patient/games" className="text-primary-teal underline text-xl">Return to Activities</Link>
      </div>
    );
  }

  if (difficulty === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-12 h-12 text-ai-blue animate-bounce" />
          </div>
          <div className="absolute inset-0 border-4 border-ai-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-3xl font-bold text-primary-teal mb-4">Personalizing Activity</h2>
        <p className="text-xl text-text-charcoal/70 max-w-sm">
          Calm Intelligence is analyzing your past performance to find the perfect difficulty level for you...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GameEngine game={game} difficulty={difficulty} />
    </div>
  );
};

import { Mic, Send, MicOff } from 'lucide-react';
import { AssistantService } from '../../services/ai';
import { LanguageService, SpeechRecognitionService, SpeechSynthesisService } from '../../services/accessibility';
import type { SpeechRecognitionState } from '../../services/accessibility';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'init',
    sender: 'assistant',
    text: LanguageService.getUIString('suggested_questions_title').replace(':', '') + ' Hello!' // We'll just start with a simple hello or keep it simple. Let's use a localized greeting.
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [micState, setMicState] = useState<SpeechRecognitionState>('IDLE');
  const patientId = PatientService.getProfile()?.id || 'demo-patient';

  useEffect(() => {
    // Initial message based on language
    const welcomeText = LanguageService.getCurrentLanguageCode() === 'hi' 
      ? "नमस्ते! मैं आपका सहायक हूँ। मैं आपकी क्या मदद कर सकता हूँ?" 
      : LanguageService.getCurrentLanguageCode() === 'as'
      ? "নমস্কাৰ! মই আপোনাৰ সহায়ক। মই আপোনাক কিদৰে সহায় কৰিব পাৰো?"
      : "Hello! I'm your memory assistant. What can I help you find today?";
    
    setMessages([{ id: 'init', sender: 'assistant', text: welcomeText }]);

    return () => {
      SpeechRecognitionService.stopListening();
      SpeechSynthesisService.stop();
    };
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Normalize for IntentService
    const canonicalQuery = LanguageService.normalizeQueryToEnglish(text);

    // Get assistant response (runs against English intent logic)
    const englishResponse = await AssistantService.generateResponse(patientId, canonicalQuery);
    
    // Localize response
    const localizedResponse = LanguageService.localizeResponse(englishResponse);

    // Add assistant message
    const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'assistant', text: localizedResponse };
    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);

    // Speech output
    SpeechSynthesisService.speak(localizedResponse);
  };

  const handleMicClick = async () => {
    if (micState === 'LISTENING') {
      SpeechRecognitionService.stopListening();
      setMicState('IDLE');
      return;
    }

    try {
      const transcript = await SpeechRecognitionService.startListening(setMicState);
      if (transcript) {
        handleSend(transcript);
      }
      setMicState('IDLE');
    } catch (err: any) {
      // Error is already handled by setMicState, but we can show a temporary toast or auto-reset
      setTimeout(() => setMicState('IDLE'), 3000);
    }
  };

  const suggestions = [
    LanguageService.getUIString('suggested_q1'),
    LanguageService.getUIString('suggested_q2'),
    LanguageService.getUIString('suggested_q3'),
    LanguageService.getUIString('suggested_q4')
  ];

  const getMicIcon = () => {
    if (micState === 'LISTENING') return <Mic className="w-8 h-8 text-white animate-pulse" />;
    if (micState === 'PROCESSING') return <Mic className="w-8 h-8 text-white" />;
    if (micState === 'ERROR' || micState === 'UNSUPPORTED') return <MicOff className="w-8 h-8 text-white" />;
    return <Mic className="w-8 h-8 text-white" />;
  };

  const getMicBgClass = () => {
    if (micState === 'LISTENING') return 'bg-ai-blue shadow-[0_0_15px_rgba(79,143,191,0.6)]';
    if (micState === 'PROCESSING') return 'bg-attention-amber';
    if (micState === 'ERROR' || micState === 'UNSUPPORTED') return 'bg-red-400';
    return 'bg-primary-teal hover:bg-teal-700';
  };

  const getMicStatusText = () => {
    if (micState === 'LISTENING') return LanguageService.getUIString('mic_listening');
    if (micState === 'PROCESSING') return LanguageService.getUIString('mic_processing');
    if (micState === 'ERROR') return LanguageService.getUIString('mic_error');
    if (micState === 'UNSUPPORTED') return LanguageService.getUIString('mic_unsupported');
    return LanguageService.getUIString('mic_idle');
  };

  const voiceEnabled = LanguageService.isVoiceModeEnabled();

  return (
    <div className="flex flex-col w-full h-[700px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background-warm">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-4 rounded-2xl text-2xl ${
                msg.sender === 'user' 
                  ? 'bg-secondary-sage text-white rounded-br-none' 
                  : 'bg-ai-blue/10 text-text-charcoal border border-ai-blue/20 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-2xl bg-ai-blue/10 text-text-charcoal border border-ai-blue/20 rounded-bl-none flex space-x-2">
              <div className="w-3 h-3 bg-ai-blue/40 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-ai-blue/40 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-ai-blue/40 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Chips */}
      <div className="px-6 py-4 bg-white border-t border-gray-100 flex flex-wrap gap-2">
        <div className="w-full text-sm text-gray-500 mb-2">{LanguageService.getUIString('suggested_questions_title')}</div>
        {suggestions.map((s, idx) => (
          <button 
            key={idx} 
            onClick={() => handleSend(s)}
            className="px-5 py-3 bg-gray-50 hover:bg-ai-blue/10 text-primary-teal border border-gray-200 rounded-full text-lg font-medium transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Area with Prominent Mic */}
      <div className="p-6 bg-white border-t border-gray-100 flex flex-col items-center">
        {voiceEnabled && (
          <div className="flex flex-col items-center w-full mb-6">
            <button 
              onClick={handleMicClick}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${getMicBgClass()}`}
              aria-label="Microphone"
            >
              {getMicIcon()}
            </button>
            <p className={`mt-4 text-lg font-medium transition-colors ${
              micState === 'LISTENING' ? 'text-ai-blue' :
              micState === 'ERROR' || micState === 'UNSUPPORTED' ? 'text-red-500' :
              'text-gray-500'
            }`}>
              {getMicStatusText()}
            </p>
          </div>
        )}

        <div className="flex w-full items-center gap-3">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder={LanguageService.getUIString('type_message_placeholder')}
            className="flex-1 p-5 bg-gray-50 border border-gray-200 rounded-2xl text-xl focus:ring-2 focus:ring-ai-blue focus:border-ai-blue focus:outline-none"
          />
          <button 
            onClick={() => handleSend(input)}
            className="p-5 bg-primary-teal text-white rounded-2xl hover:bg-teal-700 transition-colors"
          >
            <Send className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};
export const FamiliarRoutesList: React.FC = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<any[]>([]);
  const patientId = PatientService.getProfile()?.id || 'demo-patient';

  useEffect(() => {
    setRoutes(RouteService.getPatientRoutes(patientId));
  }, [patientId]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold text-primary-teal mb-4">Familiar Routes</h2>
        <p className="text-xl text-text-charcoal/80">Practice memory recall using your personal routes.</p>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {routes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
            <p className="text-xl text-gray-500">Your caregiver hasn't added any routes yet.</p>
          </div>
        ) : (
          routes.map(route => (
            <div key={route.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-50 text-ai-blue rounded-2xl flex items-center justify-center mr-6">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text-charcoal mb-1">{route.name}</h3>
                  <p className="text-gray-600 text-lg">{route.locations.length} locations to remember</p>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/patient/route/${route.id}`)}
                className="bg-primary-teal text-white px-8 py-4 rounded-xl text-xl font-semibold hover:bg-teal-700 transition-colors"
              >
                Start
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const SingleRouteGame: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<any | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const patientId = PatientService.getProfile()?.id || 'demo-patient';

  useEffect(() => {
    if (!id) return;
    const r = RouteService.getRoute(id);
    if (r) {
      setRoute(r);
      // Fetch dynamic difficulty using route_recall domain
      AdaptiveEngine.getRecommendedDifficulty(patientId, 'route_recall', r.id)
        .then(recommendation => setDifficulty(recommendation.recommendedDifficulty));
    }
  }, [id, patientId]);

  if (!route) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Route Not Found</h2>
        <Link to="/patient/routes" className="text-primary-teal underline text-xl">Return to Routes</Link>
      </div>
    );
  }

  if (difficulty === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-12 h-12 text-ai-blue animate-bounce" />
          </div>
          <div className="absolute inset-0 border-4 border-ai-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-3xl font-bold text-primary-teal mb-4">Personalizing Activity</h2>
        <p className="text-xl text-text-charcoal/70 max-w-sm">
          Adapting the route memory challenge just for you...
        </p>
      </div>
    );
  }

  // Create a synthetic GameDefinition for the GameEngine
  const gameDef = {
    id: route.id, 
    name: route.name,
    domain: 'route_recall' as any,
    description: route.description,
    baseDifficulty: 1,
    icon: 'Map',
    estimatedDuration: '5 mins',
    instructions: 'Remember the sequence of your familiar locations.'
  };

  return (
    <div className="w-full">
      <GameEngine game={gameDef} difficulty={difficulty} />
    </div>
  );
};

