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
    suggested_q4: "Where is my doctor's clinic?",
    // New Strings
    daily_routine: "Daily Routine",
    todays_routine: "Today's Routine",
    completed: "Completed",
    upcoming: "Upcoming",
    diet_preference: "Diet Preference",
    food_preferences: "Food Preferences",
    preferred_foods: "Preferred Foods",
    foods_to_avoid: "Foods to Avoid",
    your_insights: "Your Insights",
    activities_completed: "Activities Completed",
    average_accuracy: "Average Accuracy",
    response_time: "Response Time",
    activity_performance: "Activity Performance",
    recent_activity: "Recent Activity",
    not_enough_data: "Not Enough Data"
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
    suggested_q4: "मेरे डॉक्टर का क्लिनिक कहाँ है?",
    daily_routine: "दैनिक दिनचर्या",
    todays_routine: "आज की दिनचर्या",
    completed: "पूरा हुआ",
    upcoming: "आगामी",
    diet_preference: "आहार प्राथमिकता",
    food_preferences: "भोजन प्राथमिकताएं",
    preferred_foods: "पसंदीदा भोजन",
    foods_to_avoid: "परहेज करने वाले भोजन",
    your_insights: "आपकी अंतर्दृष्टि",
    activities_completed: "गतिविधियां पूरी हुईं",
    average_accuracy: "औसत सटीकता",
    response_time: "प्रतिक्रिया समय",
    activity_performance: "गतिविधि प्रदर्शन",
    recent_activity: "हाल की गतिविधि",
    not_enough_data: "पर्याप्त डेटा नहीं"
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
    suggested_q4: "মোৰ ডাক্তৰৰ ক্লিনিক ক'ত আছে?",
    daily_routine: "দৈনন্দিন ৰুটিন",
    todays_routine: "আজিৰ ৰুটিন",
    completed: "সম্পন্ন",
    upcoming: "আগন্তুক",
    diet_preference: "আহাৰৰ পছন্দ",
    food_preferences: "খাদ্যৰ পছন্দ",
    preferred_foods: "পছন্দৰ খাদ্য",
    foods_to_avoid: "পৰিহাৰ কৰিবলগীয়া খাদ্য",
    your_insights: "আপোনাৰ অন্তৰ্দৃষ্টি",
    activities_completed: "কাৰ্যকলাপ সম্পন্ন হ'ল",
    average_accuracy: "গড় সঠিকতা",
    response_time: "প্ৰতিক্ৰিয়াৰ সময়",
    activity_performance: "কাৰ্যকলাপৰ প্ৰদৰ্শন",
    recent_activity: "শেহতীয়া কাৰ্যকলাপ",
    not_enough_data: "পৰ্যাপ্ত তথ্য নাই"
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
    suggested_q4: "माझ्या डॉक्टरांचे क्लिनिक कुठे आहे?",
    daily_routine: "दैनिक दिनचर्या",
    todays_routine: "आजची दिनचर्या",
    completed: "पूर्ण झाले",
    upcoming: "आगामी",
    diet_preference: "आहार प्राधान्य",
    food_preferences: "अन्नाची प्राधान्ये",
    preferred_foods: "आवडते अन्न",
    foods_to_avoid: "टाळावयाचे अन्न",
    your_insights: "तुमची अंतर्दृष्टी",
    activities_completed: "उपक्रम पूर्ण झाले",
    average_accuracy: "सरासरी अचूकता",
    response_time: "प्रतिसाद वेळ",
    activity_performance: "उपक्रम कामगिरी",
    recent_activity: "अलीकडील क्रियाकलाप",
    not_enough_data: "पुरेसा डेटा नाही"
  }
};

class LanguageServiceClass {
  public getSupportedLanguages(): SupportedLanguage[] {
    return SUPPORTED_LANGUAGES;
  }

  public getCurrentLanguageCode(): SupportedLanguageCode {
    const profile = PatientService.getProfile();
    return (profile?.language as SupportedLanguageCode) || 'as';
  }

  public getLanguageConfig(code: SupportedLanguageCode): SupportedLanguage | undefined {
    return SUPPORTED_LANGUAGES.find(l => l.code === code);
  }

  public isVoiceModeEnabled(): boolean {
    return true;
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
   * Translates common names for the prototype UI.
   */
  public getLocalName(englishName: string): string {
    const lang = this.getCurrentLanguageCode();
    if (lang === 'en') return englishName;
    
    const nameMap: Record<string, Record<string, string>> = {
      'Arun': { 'hi': 'अरुण', 'mr': 'अरुण', 'as': 'অৰুণ' },
      'Riya': { 'hi': 'रिया', 'mr': 'रिया', 'as': 'ৰিয়া' },
      'Meena': { 'hi': 'मीना', 'mr': 'मीना', 'as': 'মীনা' },
      'Suresh': { 'hi': 'सुरेश', 'mr': 'सुरेश', 'as': 'সুৰেশ' },
      'Priya': { 'hi': 'प्रिया', 'mr': 'प्रिया', 'as': 'প্ৰিয়া' },
      'Kavita': { 'hi': 'कविता', 'mr': 'कविता', 'as': 'কবিতা' },
      'Rajesh': { 'hi': 'राजेश', 'mr': 'राजेश', 'as': 'ৰাজেশ' },
      'Anand': { 'hi': 'आनंद', 'mr': 'आनंद', 'as': 'আনন্দ' },
      'Sita': { 'hi': 'सीता', 'mr': 'सीता', 'as': 'সীতা' },
      'Mohan': { 'hi': 'मोहन', 'mr': 'मोहन', 'as': 'মোহন' }
    };

    const entry = nameMap[englishName];
    if (entry && entry[lang]) {
      return entry[lang];
    }
    return englishName;
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

    if (lang === 'mr') {
      Object.assign(dict, {
        "Your glasses are on the bedside table.": "तुमचा चष्मा बेडसाइड टेबलवर आहे.",
        "Priya is your daughter. She visits every Sunday.": "प्रिया तुमची मुलगी आहे. ती दर रविवारी येते.",
        "In the morning, you usually have tea, go for a short walk, and then read the newspaper.": "सकाळी तुम्ही साधारणपणे चहा घेता, थोड्या चालायला जाता आणि मग वर्तमानपत्र वाचता.",
        "Your doctor's clinic is located at Park Street, near the main square.": "तुमच्या डॉक्टरांचे क्लिनिक मुख्य चौकाजवळ, पार्क स्ट्रीट येथे आहे.",
        "I'm sorry, I don't remember that right now. Could you ask your caregiver to add it to my memory?": "क्षमस्व, मला आता ते आठवत नाही. तुम्ही तुमच्या काळजीवाहूला ते माझ्या मेमरीमध्ये जोडण्यास सांगू शकता का?",
        "I don't know the answer to that. I only know about the memories your family has shared with me.": "मला याचे उत्तर माहीत नाही. मला फक्त तुमच्या कुटुंबाने माझ्यासोबत शेअर केलेल्या आठवणींबद्दल माहिती आहे."
      });
    }

    // Attempt direct match (very naive for prototype)
    const exactMatch = (dict as Record<string, string>)[englishResponse];
    if (exactMatch) return exactMatch;

    // Handle dynamic fallbacks from AssistantService
    if (englishResponse.startsWith("I don't have a saved location for your")) {
       const obj = englishResponse.replace("I don't have a saved location for your ", "").replace(" yet.", "");
       const localObj = this.getLocalName(obj);
       if (lang === 'hi') return `मेरे पास अभी आपके ${localObj} का स्थान सुरक्षित नहीं है।`;
       if (lang === 'mr') return `माझ्याकडे अजून तुमच्या ${localObj} चे स्थान जतन केलेले नाही.`;
       if (lang === 'as') return `মোৰ ওচৰত এতিয়াও আপোনাৰ ${localObj}ৰ স্থান সংৰক্ষিত নাই।`;
    }
    
    if (englishResponse.startsWith("I don't have information saved about someone named")) {
       const person = englishResponse.replace("I don't have information saved about someone named ", "").replace(".", "");
       const localPerson = this.getLocalName(person);
       if (lang === 'hi') return `मेरे पास ${localPerson} नाम के व्यक्ति के बारे में जानकारी सुरक्षित नहीं है।`;
       if (lang === 'mr') return `माझ्याकडे ${localPerson} नावाच्या व्यक्तीबद्दल माहिती जतन केलेली नाही.`;
       if (lang === 'as') return `মোৰ ওচৰত ${localPerson} নামৰ ব্যক্তিজনৰ বিষয়ে তথ্য সংৰক্ষিত নাই।`;
    }

    if (englishResponse === "I don't see any routines saved for you right now.") {
       if (lang === 'hi') return "मुझे अभी आपके लिए कोई दिनचर्या सुरक्षित नहीं दिख रही है।";
       if (lang === 'mr') return "मला सध्या तुमच्यासाठी कोणतीही दिनचर्या जतन केलेली दिसत नाही.";
       if (lang === 'as') return "মই এতিয়া আপোনাৰ বাবে কোনো ৰুটিন সংৰক্ষিত দেখা নাই।";
    }

    if (englishResponse === "I don't have that information saved yet. You can ask your caregiver to add it.") {
       if (lang === 'hi') return "मेरे पास वह जानकारी अभी सुरक्षित नहीं है। आप अपने देखभालकर्ता से इसे जोड़ने के लिए कह सकते हैं।";
       if (lang === 'mr') return "माझ्याकडे ती माहिती अजून जतन केलेली नाही. तुम्ही तुमच्या काळजीवाहूला ती जोडण्यास सांगू शकता.";
       if (lang === 'as') return "মোৰ ওচৰত সেই তথ্য এতিয়াও সংৰক্ষিত নাই। আপুনি আপোনাৰ যতন লওঁতাজনক ইয়াক যোগ কৰিবলৈ ক'ব পাৰে।";
    }

    // Fallback if not an exact templated match
    return englishResponse;
  }
}

export const LanguageService = new LanguageServiceClass();
