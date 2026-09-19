import re

file_path = 'src/services/accessibility/translations.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_keys = {
    'en': '''
    "game.playing_song": "Playing a song...",
    "game.listening_answer": "Listening to your answer...",
    "game.speak_now": "Speak now",
    "game.thinking": "Thinking...",
    "game.voice_unavailable": "Voice input unavailable. Please tap an answer below.",
    "game.ready_play": "Ready to play?",
    "game.listen_guess": "Listen to the song and guess who sang it or which movie it is from.",
    "game.question_x": "Question",
    "game.of_y": "of"''',
    'hi': '''
    "game.playing_song": "गाना बज रहा है...",
    "game.listening_answer": "आपका उत्तर सुन रहा हूँ...",
    "game.speak_now": "अब बोलें",
    "game.thinking": "सोच रहा हूँ...",
    "game.voice_unavailable": "वॉयस इनपुट उपलब्ध नहीं है। कृपया नीचे एक उत्तर पर टैप करें।",
    "game.ready_play": "खेलने के लिए तैयार हैं?",
    "game.listen_guess": "गाना सुनें और पहचानें कि इसे किसने गाया है या यह किस फिल्म का है।",
    "game.question_x": "प्रश्न",
    "game.of_y": "में से"''',
    'as': '''
    "game.playing_song": "এটা গান বাজি আছে...",
    "game.listening_answer": "আপোনাৰ উত্তৰ শুনি আছো...",
    "game.speak_now": "এতিয়া কওক",
    "game.thinking": "ভাবি আছো...",
    "game.voice_unavailable": "ভইচ ইনপুট উপলব্ধ নহয়। অনুগ্ৰহ কৰি তলৰ উত্তৰ এটাত টিপক।",
    "game.ready_play": "খেলিবলৈ সাজুনে?",
    "game.listen_guess": "গানটো শুনক আৰু কোনে গাইছে বা কোনখন ছৱিৰ পৰা লোৱা হৈছে অনুমান কৰক।",
    "game.question_x": "প্ৰশ্ন",
    "game.of_y": "ৰ ভিতৰত"''',
    'mr': '''
    "game.playing_song": "गाणे वाजत आहे...",
    "game.listening_answer": "तुमचे उत्तर ऐकत आहे...",
    "game.speak_now": "आता बोला",
    "game.thinking": "विचार करत आहे...",
    "game.voice_unavailable": "आवाज इनपुट उपलब्ध नाही. कृपया खालील उत्तरावर टॅप करा.",
    "game.ready_play": "खेळण्यासाठी तयार आहात?",
    "game.listen_guess": "गाणे ऐका आणि ते कोणी गायले आहे किंवा ते कोणत्या चित्रपटातील आहे ते ओळखा.",
    "game.question_x": "प्रश्न",
    "game.of_y": "पैकी"'''
}

def inject_keys(lang_code, content):
    pattern = rf'([ \t]*){lang_code}: \{{'
    match = re.search(pattern, content)
    if not match: return content
    
    # insert right after the language brace
    insert_pos = match.end()
    keys_to_insert = new_keys[lang_code] + ',\n'
    return content[:insert_pos] + '\n' + keys_to_insert + content[insert_pos:]

for lang in ['en', 'hi', 'as', 'mr']:
    content = inject_keys(lang, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
