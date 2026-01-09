export interface WordDefinition {
  word: string;
  partOfSpeech: string;
  definition: string;
  pronunciation: {
    ipa: string;
    phoneticBreakdown: string;
    oxfordRespelling: string;
  };
  wordStructure: {
    prefix: string | null;
    prefixMeaning: string | null;
    root: string;
    rootMeaning: string;
    suffix: string | null;
    suffixMeaning: string | null;
  };
  etymology: string;
  meanings: {
    context: string;
    meaning: string;
    example: string;
  }[];
  collocations: string[];
  synonyms: {
    word: string;
    meaning: string;
    context: string;
    interchangeable: "yes" | "sometimes" | "no";
  }[];
  learningTip: string;
  visualTrick: string;
  memoryPhrase: string;
  commonMistakes?: {
    incorrect: string;
    issue: string;
    correct: string;
  }[];
}

const mockDatabase: Record<string, WordDefinition> = {
  abase: {
    word: "abase",
    partOfSpeech: "verb",
    definition: "to lower someone in rank, position, reputation, or self-respect; to degrade or humble",
    pronunciation: {
      ipa: "/əˈbeɪs/",
      phoneticBreakdown: "uh-BAYS",
      oxfordRespelling: "/ə-BAYS/"
    },
    wordStructure: {
      prefix: "a-",
      prefixMeaning: "from Latin, meaning 'to' or 'toward'",
      root: "base",
      rootMeaning: "from Latin basis, meaning 'foundation' or 'low part'",
      suffix: null,
      suffixMeaning: null
    },
    etymology: "Abase literally means 'to bring toward the base (bottom)' — hence, to lower someone in status or dignity.",
    meanings: [
      {
        context: "Social/Honor Context",
        meaning: "To humiliate or belittle someone publicly or emotionally.",
        example: "The general refused to abase himself before the enemy commander."
      },
      {
        context: "Moral/Ethical Context",
        meaning: "To lower one's own dignity, often voluntarily or out of shame.",
        example: "She would never abase herself by begging for his forgiveness."
      },
      {
        context: "Religious or Literary Context",
        meaning: "To humble oneself before a higher power or authority.",
        example: "He chose to abase himself before God in prayer and repentance."
      }
    ],
    collocations: ["abase oneself", "be abased", "utterly abased", "refuse to abase", "feel abased"],
    synonyms: [
      { word: "Degrade", meaning: "Lower in dignity, rank, or moral character", context: "Formal, broad usage", interchangeable: "yes" },
      { word: "Humiliate", meaning: "Cause someone to feel ashamed", context: "Emotional/social contexts", interchangeable: "sometimes" },
      { word: "Belittle", meaning: "Dismiss someone as unimportant", context: "Psychological, not formal ranking", interchangeable: "no" },
      { word: "Demean", meaning: "Treat as lacking in worth or dignity", context: "Emotional/social", interchangeable: "yes" },
      { word: "Mortify", meaning: "Cause extreme embarrassment or shame", context: "Strong emotional reaction", interchangeable: "no" },
      { word: "Lower", meaning: "Make less in amount or status", context: "Generic", interchangeable: "sometimes" }
    ],
    learningTip: "To abase is to bring someone down to the base level — socially, emotionally, or morally.",
    visualTrick: "Think of the word 'base' as the bottom floor, and 'abasing' someone is pushing them down to that floor.",
    memoryPhrase: "I will not abase myself — I won't lower myself just to please others.",
    commonMistakes: [
      {
        incorrect: "He abased her with his insult.",
        issue: "Wrong usage ('abase' implies lowering status/dignity, not just insulting).",
        correct: "He abased her by making her apologize publicly."
      },
      {
        incorrect: "The manager abased down the employee.",
        issue: "Redundant ('abase' already means to lower).",
        correct: "The manager abased the employee."
      },
      {
        incorrect: "I felt abased after the exam.",
        issue: "Misuse ('abase' is about dignity/status, not disappointment).",
        correct: "I felt abased after being publicly criticized for my mistake."
      }
    ]
  },
  eloquent: {
    word: "eloquent",
    partOfSpeech: "adjective",
    definition: "fluent or persuasive in speaking or writing; clearly expressing or indicating something",
    pronunciation: {
      ipa: "/ˈeləkwənt/",
      phoneticBreakdown: "EL-uh-kwuhnt",
      oxfordRespelling: "/EL-ə-kwənt/"
    },
    wordStructure: {
      prefix: "e-",
      prefixMeaning: "from Latin 'ex', meaning 'out'",
      root: "loqu",
      rootMeaning: "from Latin 'loqui', meaning 'to speak'",
      suffix: "-ent",
      suffixMeaning: "adjective-forming suffix meaning 'having the quality of'"
    },
    etymology: "Eloquent literally means 'speaking out' — expressing ideas fluently and powerfully.",
    meanings: [
      {
        context: "Public Speaking",
        meaning: "Having the ability to speak clearly, persuasively, and movingly.",
        example: "The politician gave an eloquent speech that moved the audience to tears."
      },
      {
        context: "Written Expression",
        meaning: "Writing in a fluent, expressive, and persuasive manner.",
        example: "Her eloquent prose captivated readers around the world."
      },
      {
        context: "Non-verbal Communication",
        meaning: "Vividly or movingly expressive without words.",
        example: "His silence was more eloquent than any words could be."
      }
    ],
    collocations: ["eloquent speaker", "eloquent testimony", "eloquent silence", "most eloquent", "eloquent expression"],
    synonyms: [
      { word: "Articulate", meaning: "Expressing oneself clearly and effectively", context: "General communication", interchangeable: "yes" },
      { word: "Fluent", meaning: "Able to speak smoothly and easily", context: "Language ability", interchangeable: "sometimes" },
      { word: "Persuasive", meaning: "Good at convincing others", context: "Argument/debate", interchangeable: "sometimes" },
      { word: "Expressive", meaning: "Effectively conveying thought or feeling", context: "Emotional communication", interchangeable: "yes" },
      { word: "Silver-tongued", meaning: "Eloquent and persuasive in speaking", context: "Informal, often implies charm", interchangeable: "sometimes" }
    ],
    learningTip: "Eloquent is about speaking OUT your ideas with power and beauty — the 'e-' (out) + 'loqu' (speak) combine to mean speaking outwardly with impact.",
    visualTrick: "Picture words flowing out like a beautiful river from someone's mouth — smooth, powerful, and captivating.",
    memoryPhrase: "An eloquent speaker speaks OUT with grace and power.",
    commonMistakes: [
      {
        incorrect: "He is very eloquent in math.",
        issue: "Misuse ('eloquent' refers to speech/writing, not general skills).",
        correct: "He is very eloquent when explaining complex ideas."
      },
      {
        incorrect: "She spoke eloquently loud.",
        issue: "Wrong word form (use 'eloquently and loudly' or restructure).",
        correct: "She spoke eloquently and with great passion."
      },
      {
        incorrect: "The report was eloquent but confusing.",
        issue: "Contradiction ('eloquent' implies clarity and persuasion).",
        correct: "The report was elaborate but confusing."
      }
    ]
  },
  ubiquitous: {
    word: "ubiquitous",
    partOfSpeech: "adjective",
    definition: "present, appearing, or found everywhere; seeming to be everywhere at once",
    pronunciation: {
      ipa: "/juːˈbɪkwɪtəs/",
      phoneticBreakdown: "yoo-BIK-wi-tuhs",
      oxfordRespelling: "/yoo-BIK-wi-təs/"
    },
    wordStructure: {
      prefix: null,
      prefixMeaning: null,
      root: "ubique",
      rootMeaning: "from Latin 'ubique', meaning 'everywhere'",
      suffix: "-ous",
      suffixMeaning: "adjective suffix meaning 'full of' or 'having the quality of'"
    },
    etymology: "Ubiquitous comes from the Latin 'ubique' (everywhere), describing something that seems to exist in all places simultaneously.",
    meanings: [
      {
        context: "Technology",
        meaning: "Describing technology that is found everywhere in daily life.",
        example: "Smartphones have become ubiquitous in modern society."
      },
      {
        context: "Cultural Phenomenon",
        meaning: "Describing trends, ideas, or objects that appear everywhere.",
        example: "Coffee shops are now ubiquitous in major cities worldwide."
      },
      {
        context: "Nature/Environment",
        meaning: "Describing things widely distributed in nature.",
        example: "Plastic pollution has become ubiquitous in our oceans."
      }
    ],
    collocations: ["ubiquitous presence", "become ubiquitous", "ubiquitous technology", "ubiquitous in", "almost ubiquitous"],
    synonyms: [
      { word: "Omnipresent", meaning: "Present everywhere at the same time", context: "More formal, often spiritual", interchangeable: "yes" },
      { word: "Pervasive", meaning: "Spreading widely throughout", context: "Often negative connotation", interchangeable: "sometimes" },
      { word: "Universal", meaning: "Applying to all cases", context: "Broader meaning", interchangeable: "sometimes" },
      { word: "Widespread", meaning: "Found or distributed over a large area", context: "More neutral", interchangeable: "yes" },
      { word: "Prevalent", meaning: "Widespread in a particular area or time", context: "Statistical sense", interchangeable: "sometimes" }
    ],
    learningTip: "Think of 'ubiquitous' as 'you-be-quit-us' — wherever YOU BE, IT quits being absent — it's everywhere!",
    visualTrick: "Imagine something appearing in every corner of your vision, no matter where you look — that's ubiquitous.",
    memoryPhrase: "Wi-Fi is ubiquitous — you can find it everywhere you go.",
    commonMistakes: [
      {
        incorrect: "The bird is ubiquitous in my garden.",
        issue: "Wrong scope ('ubiquitous' means everywhere broadly, not in one place).",
        correct: "Sparrows are ubiquitous across North America."
      },
      {
        incorrect: "His influence was very ubiquitous.",
        issue: "Redundant ('ubiquitous' already implies maximum presence).",
        correct: "His influence was ubiquitous."
      },
      {
        incorrect: "The app became ubiquitous overnight.",
        issue: "Unlikely claim (becoming truly everywhere takes time).",
        correct: "The app became ubiquitous within a few years."
      }
    ]
  }
};

// Simulates an AI API call with delay
export async function lookupWord(word: string): Promise<WordDefinition | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  
  const normalizedWord = word.toLowerCase().trim();
  
  if (mockDatabase[normalizedWord]) {
    return mockDatabase[normalizedWord];
  }
  
  // Generate a basic mock response for unknown words
  return generateMockDefinition(normalizedWord);
}

function generateMockDefinition(word: string): WordDefinition {
  return {
    word: word,
    partOfSpeech: "noun",
    definition: `A word that represents the concept of "${word}" in the English language.`,
    pronunciation: {
      ipa: `/${word}/`,
      phoneticBreakdown: word.toUpperCase(),
      oxfordRespelling: `/${word}/`
    },
    wordStructure: {
      prefix: null,
      prefixMeaning: null,
      root: word,
      rootMeaning: `The base form of "${word}"`,
      suffix: null,
      suffixMeaning: null
    },
    etymology: `The word "${word}" has origins that would be analyzed by a complete AI system.`,
    meanings: [
      {
        context: "General Usage",
        meaning: `The primary meaning of "${word}" in everyday context.`,
        example: `This is an example sentence using the word "${word}".`
      }
    ],
    collocations: [`${word} is`, `the ${word}`, `a ${word}`],
    synonyms: [
      { word: "Similar term", meaning: "A word with similar meaning", context: "General", interchangeable: "sometimes" }
    ],
    learningTip: `To learn "${word}", consider its usage in various contexts and practice using it in sentences.`,
    visualTrick: `Create a mental image that connects to the meaning of "${word}".`,
    memoryPhrase: `Remember "${word}" by associating it with something familiar.`,
    commonMistakes: [
      {
        incorrect: `Using "${word}" without proper context.`,
        issue: "Ensure you understand the nuances before using this word.",
        correct: `Use "${word}" in sentences where its meaning fits naturally.`
      }
    ]
  };
}
