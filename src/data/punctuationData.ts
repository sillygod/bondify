export interface BlankOption {
  options: string[];
  correctIndex: number;
}

export interface PunctuationQuestion {
  id: string;
  sentence: string;
  blanks: BlankOption[]; // Each blank has its own options
  punctuationType: "apostrophe" | "comma" | "hyphen" | "semicolon" | "colon";
  explanation: string;
}

export const punctuationData: PunctuationQuestion[] = [
  // Apostrophe questions
  {
    id: "apos-1",
    sentence: "The dog wagged ___ tail happily.",
    blanks: [{ options: ["its", "it's", "its'"], correctIndex: 0 }],
    punctuationType: "apostrophe",
    explanation: "'Its' is possessive. 'It's' means 'it is' or 'it has'.",
  },
  {
    id: "apos-2",
    sentence: "___ going to rain tomorrow.",
    blanks: [{ options: ["Its", "It's", "Its'"], correctIndex: 1 }],
    punctuationType: "apostrophe",
    explanation: "'It's' is a contraction of 'it is'. Here we need 'It is going to rain.'",
  },
  {
    id: "apos-3",
    sentence: "The ___ toys were scattered everywhere.",
    blanks: [{ options: ["childrens", "children's", "childrens'"], correctIndex: 1 }],
    punctuationType: "apostrophe",
    explanation: "'Children' is already plural, so add 's to make it possessive: children's.",
  },
  {
    id: "apos-4",
    sentence: "All the ___ cars were parked outside.",
    blanks: [{ options: ["teacher's", "teachers'", "teachers"], correctIndex: 1 }],
    punctuationType: "apostrophe",
    explanation: "Multiple teachers own the cars, so the apostrophe goes after the s: teachers'.",
  },
  {
    id: "apos-5",
    sentence: "___ been waiting for an hour.",
    blanks: [{ options: ["Weve", "We've", "We'v"], correctIndex: 1 }],
    punctuationType: "apostrophe",
    explanation: "'We've' is a contraction of 'we have'.",
  },

  // Comma questions
  {
    id: "comma-1",
    sentence: "After finishing her homework___ she went to bed.",
    blanks: [{ options: [" ,", ",", " —"], correctIndex: 1 }],
    punctuationType: "comma",
    explanation: "Use a comma after an introductory clause.",
  },
  {
    id: "comma-2",
    sentence: "I bought apples___ oranges___ and bananas.",
    blanks: [
      { options: [",", " ", ";"], correctIndex: 0 },
      { options: [",", " ", ";"], correctIndex: 0 },
    ],
    punctuationType: "comma",
    explanation: "Use commas to separate items in a list of three or more.",
  },
  {
    id: "comma-3",
    sentence: "My sister___ who lives in Paris___ is visiting next week.",
    blanks: [
      { options: [",", " ", "—"], correctIndex: 0 },
      { options: [",", " ", "—"], correctIndex: 0 },
    ],
    punctuationType: "comma",
    explanation: "Use commas around non-essential clauses that add extra information.",
  },
  {
    id: "comma-4",
    sentence: "The movie was long___ but entertaining.",
    blanks: [{ options: [",", " ", ";"], correctIndex: 0 }],
    punctuationType: "comma",
    explanation: "Use a comma before coordinating conjunctions (but, and, or) joining independent clauses.",
  },
  {
    id: "comma-5",
    sentence: "However___ the results were not what we expected.",
    blanks: [{ options: [",", " ", ";"], correctIndex: 0 }],
    punctuationType: "comma",
    explanation: "Use a comma after introductory words like 'However', 'Therefore', 'Moreover'.",
  },

  // Hyphen questions
  {
    id: "hyphen-1",
    sentence: "She is a well___ known author.",
    blanks: [{ options: ["-", " ", "—"], correctIndex: 0 }],
    punctuationType: "hyphen",
    explanation: "Use a hyphen in compound adjectives before a noun: 'well-known author'.",
  },
  {
    id: "hyphen-2",
    sentence: "The project requires a long___ term commitment.",
    blanks: [{ options: ["-", " ", "—"], correctIndex: 0 }],
    punctuationType: "hyphen",
    explanation: "Compound adjectives before nouns need hyphens: 'long-term commitment'.",
  },
  {
    id: "hyphen-3",
    sentence: "Twenty___ three students attended the lecture.",
    blanks: [{ options: ["-", " ", "—"], correctIndex: 0 }],
    punctuationType: "hyphen",
    explanation: "Compound numbers from twenty-one to ninety-nine are hyphenated.",
  },
  {
    id: "hyphen-4",
    sentence: "The author is well___ known.",
    blanks: [{ options: [" (no hyphen)", "-", "—"], correctIndex: 0 }],
    punctuationType: "hyphen",
    explanation: "When the compound adjective comes after the noun, no hyphen is needed.",
  },
  {
    id: "hyphen-5",
    sentence: "She showed her self___ confidence during the interview.",
    blanks: [{ options: ["-", " ", "—"], correctIndex: 0 }],
    punctuationType: "hyphen",
    explanation: "Words with 'self-' as a prefix are hyphenated: 'self-confidence'.",
  },

  // Semicolon questions
  {
    id: "semi-1",
    sentence: "I love coffee___ my sister prefers tea.",
    blanks: [{ options: [";", ",", ":"], correctIndex: 0 }],
    punctuationType: "semicolon",
    explanation: "Use a semicolon to connect two related independent clauses.",
  },
  {
    id: "semi-2",
    sentence: "The weather was terrible___ however, we still went hiking.",
    blanks: [{ options: [";", ",", ":"], correctIndex: 0 }],
    punctuationType: "semicolon",
    explanation: "Use a semicolon before conjunctive adverbs (however, therefore) connecting clauses.",
  },
  {
    id: "semi-3",
    sentence: "We visited Paris, France___ London, England___ and Rome, Italy.",
    blanks: [
      { options: [";", ",", ":"], correctIndex: 0 },
      { options: [";", ",", ":"], correctIndex: 0 },
    ],
    punctuationType: "semicolon",
    explanation: "Use semicolons to separate items in a list when items contain commas.",
  },

  // Colon questions
  {
    id: "colon-1",
    sentence: "She had one goal___ to win the championship.",
    blanks: [{ options: [":", ",", ";"], correctIndex: 0 }],
    punctuationType: "colon",
    explanation: "Use a colon to introduce an explanation or elaboration.",
  },
  {
    id: "colon-2",
    sentence: "Please bring the following items___ a notebook, pen, and calculator.",
    blanks: [{ options: [":", ",", ";"], correctIndex: 0 }],
    punctuationType: "colon",
    explanation: "Use a colon to introduce a list after a complete sentence.",
  },
  {
    id: "colon-3",
    sentence: "The sign read___ 'No Entry'.",
    blanks: [{ options: [":", ",", ";"], correctIndex: 0 }],
    punctuationType: "colon",
    explanation: "Use a colon to introduce a quotation when preceded by a complete sentence.",
  },
];

export const getRandomPunctuationQuestions = (
  count: number,
  excludeIds: string[] = [],
  type?: PunctuationQuestion["punctuationType"]
): PunctuationQuestion[] => {
  let available = punctuationData.filter((q) => !excludeIds.includes(q.id));
  
  if (type) {
    available = available.filter((q) => q.punctuationType === type);
  }
  
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const punctuationTypes = [
  { id: "apostrophe", label: "Apostrophes", icon: "'" },
  { id: "comma", label: "Commas", icon: "," },
  { id: "hyphen", label: "Hyphens", icon: "-" },
  { id: "semicolon", label: "Semicolons", icon: ";" },
  { id: "colon", label: "Colons", icon: ":" },
] as const;
