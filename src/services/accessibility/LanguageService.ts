import type { SupportedLanguage, SupportedLanguageCode } from '../../types';
import { PatientService } from '../api/PatientService';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechRecognitionSupported: true, // Will be checked at runtime
    speechSynthesisSupported: true
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechRecognitionSupported: true,
    speechSynthesisSupported: true
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    speechRecognitionSupported: true, // Optimistic, but browser fallback will handle if false
    speechSynthesisSupported: true
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechRecognitionSupported: true,
    speechSynthesisSupported: true
  }
];

export const UI_STRINGS = {
  en: {
    mic_idle: "Tap the microphone to speak",
    mic_listening: "Listening...",
    mic_processing: "Understanding...",
    mic_error: "I couldn't hear that. Please try again.",
    mic_unsupported: "Voice input is not supported on this device.",
    suggested_questions_title: "You can ask me:",
    type_message_placeholder: "Type a message...",
    suggested_q1: "Where are my glasses?",
    suggested_q2: "Who is Priya?",
    suggested_q3: "What is my morning routine?",
    suggested_q4: "Where is my doctor's clinic?"
  },
  hi: {
    mic_idle: "बोलने के लिए माइक्रोफ़ोन पर टैप करें",
    mic_listening: "सुन रहा हूँ...",
    mic_processing: "समझ रहा हूँ...",
    mic_error: "मैं सुन नहीं पाया। कृपया पुनः प्रयास करें।",
    mic_unsupported: "इस डिवाइस पर वॉयस इनपुट समर्थित नहीं है।",
    suggested_questions_title: "आप मुझसे पूछ सकते हैं:",
    type_message_placeholder: "एक संदेश टाइप करें...",
    suggested_q1: "मेरे चश्मे कहाँ हैं?",
    suggested_q2: "प्रिया कौन हैं?",
    suggested_q3: "मेरी सुबह की दिनचर्या क्या है?",
    suggested_q4: "मेरे डॉक्टर का क्लिनिक कहाँ है?"
  },
  as: {
    mic_idle: "কথা ক'বলৈ মাইক্ৰ'ফোনত টিপক",
    mic_listening: "শুনি আছো...",
    mic_processing: "বুজি আছো...",
    mic_error: "মই শুনিব নোৱাৰিলোঁ। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।",
    mic_unsupported: "এই সঁজুলিত ভইচ ইনপুট সমৰ্থিত নহয়।",
    suggested_questions_title: "আপুনি মোক সুধিব পাৰে:",
    type_message_placeholder: "এটা বাৰ্তা লিখক...",
    suggested_q1: "মোৰ চশমাযোৰ ক'ত আছে?",
    suggested_q2: "প্ৰিয়া কোন?",
    suggested_q3: "মোৰ ৰাতিপুৱাৰ ৰুটিন কি?",
    suggested_q4: "মোৰ ডাক্তৰৰ ক্লিনিক ক'ত আছে?"
  },
  mr: {
    mic_idle: "बोलण्यासाठी मायक्रोफोनवर टॅप करा",
    mic_listening: "ऐकत आहे...",
    mic_processing: "समजून घेत आहे...",
    mic_error: "मला ते ऐकू आले नाही. कृपया पुन्हा प्रयत्न करा.",
    mic_unsupported: "या डिव्हाइसवर व्हॉइस इनपुट समर्थित नाही.",
    suggested_questions_title: "तुम्ही मला विचारू शकता:",
    type_message_placeholder: "संदेश टाइप करा...",
    suggested_q1: "माझे चष्मे कुठे आहेत?",
    suggested_q2: "प्रिया कोण आहे?",
    suggested_q3: "माझी सकाळची दिनचर्या काय आहे?",
    suggested_q4: "माझ्या डॉक्टरांचे क्लिनिक कुठे आहे?"
  }
};

class LanguageServiceClass {
  public getSupportedLanguages(): SupportedLanguage[] {
    return SUPPORTED_LANGUAGES;
  }

  public getCurrentLanguageCode(): SupportedLanguageCode {
    const profile = PatientService.getProfile();
    return (profile?.language as SupportedLanguageCode) || 'en';
  }

  public getLanguageConfig(code: SupportedLanguageCode): SupportedLanguage | undefined {
    return SUPPORTED_LANGUAGES.find(l => l.code === code);
  }

  public isVoiceModeEnabled(): boolean {
    const profile = PatientService.getProfile();
    return !!profile?.voiceMode;
  }

  public setLanguage(code: SupportedLanguageCode) {
    const profile = PatientService.getProfile();
    if (profile) {
      PatientService.saveProfile({ ...profile, language: code });
    }
  }

  public setVoiceMode(enabled: boolean) {
    const profile = PatientService.getProfile();
    if (profile) {
      PatientService.saveProfile({ ...profile, voiceMode: enabled });
    }
  }

  public getUIString(key: keyof typeof UI_STRINGS['en']): string {
    const lang = this.getCurrentLanguageCode();
    // Fallback to English if translation is missing
    const strings = UI_STRINGS[lang] || UI_STRINGS['en'];
    return strings[key] || UI_STRINGS['en'][key];
  }

  /**
   * Prototype Normalization: Maps a foreign language query to English equivalent
   * so the existing IntentService can process it canonically.
   * This avoids creating a full NLP model per language for the prototype.
   */
  public normalizeQueryToEnglish(query: string): string {
    const lang = this.getCurrentLanguageCode();
    if (lang === 'en') return query;

    const lowerQuery = query.toLowerCase();

    // Hindi heuristics
    if (lang === 'hi') {
      if (lowerQuery.includes('चश्म') || lowerQuery.includes('चश्मा')) return 'Where are my glasses?';
      if (lowerQuery.includes('प्रिया कौन')) return 'Who is Priya?';
      if (lowerQuery.includes('सुबह') || lowerQuery.includes('दिनचर्या')) return 'What is my morning routine?';
      if (lowerQuery.includes('डॉक्टर') || lowerQuery.includes('क्लिनिक')) return 'Where is my doctor\'s clinic?';
      if (lowerQuery.includes('बेटा') || lowerQuery.includes('बेटी')) return 'Who is my son/daughter?';
    }

    // Assamese heuristics
    if (lang === 'as') {
      if (lowerQuery.includes('চশমা')) return 'Where are my glasses?';
      if (lowerQuery.includes('প্ৰিয়া')) return 'Who is Priya?';
      if (lowerQuery.includes('ৰাতিপুৱা') || lowerQuery.includes('ৰুটিন')) return 'What is my morning routine?';
      if (lowerQuery.includes('ডাক্তৰ') || lowerQuery.includes('ক্লিনিক')) return 'Where is my doctor\'s clinic?';
    }

    // Marathi heuristics
    if (lang === 'mr') {
      if (lowerQuery.includes('चष्मा')) return 'Where are my glasses?';
      if (lowerQuery.includes('प्रिया')) return 'Who is Priya?';
      if (lowerQuery.includes('सकाळ') || lowerQuery.includes('दिनचर्या')) return 'What is my morning routine?';
      if (lowerQuery.includes('डॉक्टर') || lowerQuery.includes('क्लिनिक')) return 'Where is my doctor\'s clinic?';
      if (lowerQuery.includes('मुलगा') || lowerQuery.includes('मुलगी')) return 'Who is my son/daughter?';
    }

    // If we can't map it heuristically, we pass it through.
    // In a real system, this is where a translation API or multilingual LLM sits.
    return query;
  }

  /**
   * Translates the final English response template to the native language.
   */
  public localizeResponse(englishResponse: string): string {
    const lang = this.getCurrentLanguageCode();
    if (lang === 'en') return englishResponse;

    // A lightweight prototype translation dictionary for common assistant responses
    const dict = lang === 'hi' ? {
      "Your glasses are on the bedside table.": "आपका चश्मा बेडसाइड टेबल पर रखा है।",
      "Priya is your daughter. She visits every Sunday.": "प्रिया आपकी बेटी हैं। वह हर रविवार को आती हैं।",
      "In the morning, you usually have tea, go for a short walk, and then read the newspaper.": "सुबह आप आमतौर पर चाय पीते हैं, थोड़ी सैर करते हैं, और फिर अखबार पढ़ते हैं।",
      "Your doctor's clinic is located at Park Street, near the main square.": "आपके डॉक्टर का क्लिनिक मुख्य चौराहे के पास, पार्क स्ट्रीट पर स्थित है।",
      "I'm sorry, I don't remember that right now. Could you ask your caregiver to add it to my memory?": "क्षमा करें, मुझे अभी वह याद नहीं है। क्या आप अपने देखभालकर्ता से इसे मेरी याददाश्त में जोड़ने के लिए कह सकते हैं?",
      "I don't know the answer to that. I only know about the memories your family has shared with me.": "मुझे इसका उत्तर नहीं पता। मैं केवल उन यादों के बारे में जानता हूँ जो आपके परिवार ने मेरे साथ साझा की हैं।"
    } : {
      "Your glasses are on the bedside table.": "আপোনাৰ চশমাযোৰ বিচনাৰ কাষৰ টেবুলখনত আছে।",
      "Priya is your daughter. She visits every Sunday.": "প্ৰিয়া আপোনাৰ জীয়াৰী। তাই প্ৰতি দেওবাৰে আহে।",
      "In the morning, you usually have tea, go for a short walk, and then read the newspaper.": "ৰাতিপুৱা আপুনি সাধাৰণতে চাহ খায়, অলপ খোজ কাঢ়ে, আৰু তাৰ পিছত বাতৰি কাকত পঢ়ে।",
      "Your doctor's clinic is located at Park Street, near the main square.": "আপোনাৰ ডাক্তৰৰ ক্লিনিক মূল চ'কৰ ওচৰৰ পাৰ্ক ষ্ট্ৰীটত অৱস্থিত।",
      "I'm sorry, I don't remember that right now. Could you ask your caregiver to add it to my memory?": "ক্ষমা কৰিব, মোৰ এতিয়া সেয়া মনত নাই। আপুনি আপোনাৰ যতন লওঁতাজনক ইয়াক মোৰ স্মৃতিত যোগ কৰিবলৈ ক'ব পাৰিবনে?",
      "I don't know the answer to that. I only know about the memories your family has shared with me.": "মই ইয়াৰ উত্তৰ নাজানো। আপোনাৰ পৰিয়ালে মোৰ সৈতে ভাগ-বতৰা কৰা স্মৃতিবোৰৰ বিষয়েহে মই জানো।"
    };

    // Attempt direct match (very naive for prototype)
    const exactMatch = (dict as Record<string, string>)[englishResponse];
    if (exactMatch) return exactMatch;

    // Fallback if not an exact templated match
    return englishResponse;
  }
}

export const LanguageService = new LanguageServiceClass();
