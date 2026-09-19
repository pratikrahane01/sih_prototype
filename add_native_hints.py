import json
import re

hints_map = {
    "The singer is Arun Date and it is a classic Bhavgeet.": "गायक अरुण दाते आहेत आणि हे एक क्लासिक भावगीत आहे.",
    "This song is sung by Lata Mangeshkar from the movie Sadhi Manasa.": "हे गाणे साधी माणसं या चित्रपटातील असून लता मंगेशकर यांनी गायले आहे.",
    "It is a classic Marathi Bhavgeet sung by Lata Mangeshkar.": "हे लता मंगेशकर यांनी गायलेले एक क्लासिक मराठी भावगीत आहे.",
    "It is a famous Koli song sung by Hemant Kumar and Lata Mangeshkar.": "हे हेमंत कुमार आणि लता मंगेशकर यांनी गायलेले एक प्रसिद्ध कोळी गीत आहे.",
    "It is a classic Hindi song from the movie Woh Kaun Thi, sung by Lata Mangeshkar.": "यह फिल्म 'वो कौन थी' का एक क्लासिक हिंदी गीत है, जिसे लता मंगेशकर ने गाया है।",
    "It is a famous Assamese song sung by Dr. Bhupen Hazarika.": "এইটো ডঃ ভূপেন হাজৰিকাই গোৱা এটা বিখ্যাত অসমীয়া গান।",
    "It is a soulful Marathi Bhavgeet by Arun Date.": "हे अरुण दाते यांचे एक भावपूर्ण मराठी भावगीत आहे.",
    "This is a golden era Hindi song by Mukesh from the movie Kabhi Kabhie.": "यह फिल्म 'कभी कभी' से मुकेश का एक सुनहरे युग का हिंदी गीत है।",
    "A classic Bollywood track by Mukesh from the movie Awaara.": "फिल्म 'आवारा' से मुकेश का एक क्लासिक बॉलीवुड ट्रैक।",
    "A legendary romantic duet from the movie Shree 420.": "फिल्म 'श्री 420' का एक महान रोमांटिक युगल गीत।",
    "An evergreen track by Mukesh from the movie Madhumati.": "फिल्म 'मधुमती' से मुकेश का एक सदाबहार ट्रैक।",
    "A powerful humanist anthem in Assamese by Dr. Bhupen Hazarika.": "ডঃ ভূপেন হাজৰিকাৰ দ্বাৰা অসমীয়াত এক শক্তিশালী মানৱতাবাদী গীত।",
    "A famous vagabond song in Assamese by Bhupen Hazarika.": "ভূপেন হাজৰিকাৰ এটা বিখ্যাত অসমীয়া গান।",
    "A deep emotional Assamese song by Bhupen Hazarika.": "ভূপেন হাজৰিকাৰ এটা গভীৰ আৱেগিক অসমীয়া গান।",
    "A classic Assamese folk song by Khagen Mahanta.": "খগেন মহন্তৰ এটা ক্লাছিক অসমীয়া লোকগীত।"
}

file_path = 'src/services/demo/DemoMemoryData.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We look for: JSON.stringify({... hint: '...', ...})
pattern = r"(content:\s*JSON\.stringify\(\{.*?hint:\s*')([^']+)(',.*?\})\)"
def replacer(match):
    prefix = match.group(1)
    hint = match.group(2)
    suffix = match.group(3)
    if hint in hints_map:
        native_hint = hints_map[hint]
        # insert nativeHint into the JSON string
        # suffix looks like: ', language: 'mr' })'
        new_suffix = f"', nativeHint: '{native_hint}'" + suffix[1:]
        return prefix + hint + new_suffix
    return match.group(0)

new_content = re.sub(pattern, replacer, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
