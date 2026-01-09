export interface DictionQuestion {
  id: string;
  sentence: string;
  highlightedPart: {
    startIndex: number;
    text: string;
  };
  isCorrect: boolean;
  correctVersion?: string;
  category: "vocabulary" | "grammar" | "idiom" | "preposition" | "word-choice";
  explanation: string;
}

export const dictionData: DictionQuestion[] = [
  // Vocabulary Errors
  {
    id: "1",
    sentence: "I could care less about what he thinks.",
    highlightedPart: {
      startIndex: 2,
      text: "could care less",
    },
    isCorrect: false,
    correctVersion: "couldn't care less",
    category: "idiom",
    explanation: "The correct phrase is 'couldn't care less,' meaning you care so little that it's impossible to care any less. 'Could care less' implies you still have room to care less.",
  },
  {
    id: "2",
    sentence: "For all intents and purposes, the project is complete.",
    highlightedPart: {
      startIndex: 0,
      text: "For all intents and purposes",
    },
    isCorrect: true,
    category: "idiom",
    explanation: "This is correct! Many people mistakenly say 'for all intensive purposes,' but the correct phrase is 'for all intents and purposes.'",
  },
  {
    id: "3",
    sentence: "The affect of the medicine was immediate.",
    highlightedPart: {
      startIndex: 4,
      text: "affect",
    },
    isCorrect: false,
    correctVersion: "effect",
    category: "vocabulary",
    explanation: "'Effect' is a noun meaning result or outcome. 'Affect' is a verb meaning to influence. Here, we need the noun 'effect.'",
  },
  {
    id: "4",
    sentence: "She literally died laughing at the joke.",
    highlightedPart: {
      startIndex: 4,
      text: "literally",
    },
    isCorrect: false,
    correctVersion: "figuratively (or remove it)",
    category: "word-choice",
    explanation: "'Literally' means actually or exactly. If she literally died, she would be dead. Use 'figuratively' or simply remove the word.",
  },
  {
    id: "5",
    sentence: "I need to lie down for a moment.",
    highlightedPart: {
      startIndex: 10,
      text: "lie down",
    },
    isCorrect: true,
    category: "grammar",
    explanation: "This is correct! 'Lie' means to recline. 'Lay' requires a direct object (you lay something down). 'I need to lie down' is proper grammar.",
  },
  {
    id: "6",
    sentence: "Between you and I, this plan won't work.",
    highlightedPart: {
      startIndex: 8,
      text: "you and I",
    },
    isCorrect: false,
    correctVersion: "you and me",
    category: "grammar",
    explanation: "After prepositions like 'between,' use object pronouns (me, him, her, us). 'Between you and me' is correct.",
  },
  {
    id: "7",
    sentence: "She was disinterested in the political debate.",
    highlightedPart: {
      startIndex: 8,
      text: "disinterested",
    },
    isCorrect: false,
    correctVersion: "uninterested",
    category: "vocabulary",
    explanation: "'Disinterested' means impartial or unbiased. 'Uninterested' means not interested. If she didn't care about the debate, she was 'uninterested.'",
  },
  {
    id: "8",
    sentence: "The data suggests that sales are increasing.",
    highlightedPart: {
      startIndex: 9,
      text: "suggests",
    },
    isCorrect: true,
    category: "grammar",
    explanation: "While 'data' is technically plural, modern usage accepts 'data suggests' in most contexts. Both 'data suggest' and 'data suggests' are acceptable.",
  },
  {
    id: "9",
    sentence: "I could of done better on the test.",
    highlightedPart: {
      startIndex: 8,
      text: "of",
    },
    isCorrect: false,
    correctVersion: "have",
    category: "grammar",
    explanation: "'Could of' is a common error from mishearing 'could've' (could have). The correct form is 'could have done.'",
  },
  {
    id: "10",
    sentence: "She's nauseous from the roller coaster ride.",
    highlightedPart: {
      startIndex: 6,
      text: "nauseous",
    },
    isCorrect: true,
    category: "vocabulary",
    explanation: "While traditionally 'nauseous' meant 'causing nausea,' modern usage accepts it to mean 'feeling nausea.' Both usages are now standard.",
  },
  {
    id: "11",
    sentence: "Irregardless of the cost, we need this equipment.",
    highlightedPart: {
      startIndex: 0,
      text: "Irregardless",
    },
    isCorrect: false,
    correctVersion: "Regardless",
    category: "vocabulary",
    explanation: "'Irregardless' is a double negative (ir- and -less both negate). Use 'regardless' instead.",
  },
  {
    id: "12",
    sentence: "He gave me good advice about investing.",
    highlightedPart: {
      startIndex: 13,
      text: "advice",
    },
    isCorrect: true,
    category: "vocabulary",
    explanation: "Correct! 'Advice' is a noun (the guidance given). 'Advise' is a verb (to give guidance). Here, 'advice' is used correctly as a noun.",
  },
  {
    id: "13",
    sentence: "I need to flush out the details of the plan.",
    highlightedPart: {
      startIndex: 10,
      text: "flush out",
    },
    isCorrect: false,
    correctVersion: "flesh out",
    category: "idiom",
    explanation: "'Flesh out' means to add details or substance. 'Flush out' means to drive out of hiding. For adding details, use 'flesh out.'",
  },
  {
    id: "14",
    sentence: "The team comprises five members.",
    highlightedPart: {
      startIndex: 9,
      text: "comprises",
    },
    isCorrect: true,
    category: "vocabulary",
    explanation: "Correct! 'Comprises' means 'is made up of.' The whole comprises the parts. Never say 'is comprised of.'",
  },
  {
    id: "15",
    sentence: "I'm doing good, thanks for asking!",
    highlightedPart: {
      startIndex: 4,
      text: "doing good",
    },
    isCorrect: false,
    correctVersion: "doing well",
    category: "grammar",
    explanation: "'Well' is an adverb describing how you're doing. 'Good' is an adjective. While common in casual speech, 'doing well' is grammatically correct.",
  },
  {
    id: "16",
    sentence: "The suspect eluded capture for three days.",
    highlightedPart: {
      startIndex: 12,
      text: "eluded",
    },
    isCorrect: true,
    category: "vocabulary",
    explanation: "Correct! 'Elude' means to escape or avoid. 'Allude' means to hint at. Here, the suspect escaped capture.",
  },
  {
    id: "17",
    sentence: "I would like to take this opportunity to apologize.",
    highlightedPart: {
      startIndex: 2,
      text: "would like to take this opportunity",
    },
    isCorrect: false,
    correctVersion: "want",
    category: "word-choice",
    explanation: "This phrase is unnecessarily wordy. Simply say 'I want to apologize' or 'I apologize.' Clear, direct language is better in conversations.",
  },
  {
    id: "18",
    sentence: "I'm waiting on the bus to arrive.",
    highlightedPart: {
      startIndex: 4,
      text: "waiting on",
    },
    isCorrect: false,
    correctVersion: "waiting for",
    category: "preposition",
    explanation: "'Wait for' means to await something. 'Wait on' means to serve (like a waiter). Use 'waiting for the bus.'",
  },
  {
    id: "19",
    sentence: "Each of the students has their own locker.",
    highlightedPart: {
      startIndex: 25,
      text: "their",
    },
    isCorrect: true,
    category: "grammar",
    explanation: "Modern English accepts singular 'they/their' for gender-neutral reference. This usage is now widely accepted, though traditional grammar prefers 'his or her.'",
  },
  {
    id: "20",
    sentence: "I made less mistakes this time.",
    highlightedPart: {
      startIndex: 7,
      text: "less",
    },
    isCorrect: false,
    correctVersion: "fewer",
    category: "grammar",
    explanation: "'Fewer' is for countable items (mistakes, people, things). 'Less' is for uncountable quantities (water, time, money). Use 'fewer mistakes.'",
  },
];

export const getRandomDictionQuestions = (count: number, exclude: string[] = []): DictionQuestion[] => {
  const available = dictionData.filter(q => !exclude.includes(q.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
