export interface Word {
  id: string;
  word: string;
  meaning: string;
  synonyms: string[];
  partOfSpeech: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prefix?: string;
  root?: string;
  suffix?: string;
  exampleSentence: string;
  lastReviewed?: Date;
  nextReview?: Date;
  repetitions: number;
  easeFactor: number;
}

export const vocabularyData: Word[] = [
  {
    id: "1",
    word: "ubiquitous",
    meaning: "present, appearing, or found everywhere",
    synonyms: ["omnipresent", "pervasive", "universal", "widespread"],
    partOfSpeech: "adjective",
    difficulty: 4,
    prefix: "ubi-",
    root: "que",
    suffix: "-ous",
    exampleSentence: "Smartphones have become ubiquitous in modern society.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "2",
    word: "ephemeral",
    meaning: "lasting for a very short time",
    synonyms: ["fleeting", "transient", "momentary", "brief"],
    partOfSpeech: "adjective",
    difficulty: 4,
    exampleSentence: "The ephemeral beauty of cherry blossoms attracts millions of visitors.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "3",
    word: "eloquent",
    meaning: "fluent or persuasive in speaking or writing",
    synonyms: ["articulate", "fluent", "expressive", "persuasive"],
    partOfSpeech: "adjective",
    difficulty: 3,
    prefix: "e-",
    root: "loqu",
    suffix: "-ent",
    exampleSentence: "Her eloquent speech moved the entire audience to tears.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "4",
    word: "resilient",
    meaning: "able to recover quickly from difficulties",
    synonyms: ["tough", "adaptable", "flexible", "hardy"],
    partOfSpeech: "adjective",
    difficulty: 3,
    prefix: "re-",
    root: "sili",
    suffix: "-ent",
    exampleSentence: "Children are often more resilient than adults give them credit for.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "5",
    word: "meticulous",
    meaning: "showing great attention to detail; very careful and precise",
    synonyms: ["thorough", "careful", "precise", "scrupulous"],
    partOfSpeech: "adjective",
    difficulty: 3,
    exampleSentence: "The meticulous artist spent hours on each brushstroke.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "6",
    word: "pragmatic",
    meaning: "dealing with things sensibly and realistically",
    synonyms: ["practical", "realistic", "sensible", "rational"],
    partOfSpeech: "adjective",
    difficulty: 3,
    root: "pragma",
    suffix: "-tic",
    exampleSentence: "We need a pragmatic approach to solve this complex problem.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "7",
    word: "ambiguous",
    meaning: "open to more than one interpretation; unclear",
    synonyms: ["vague", "unclear", "equivocal", "cryptic"],
    partOfSpeech: "adjective",
    difficulty: 3,
    prefix: "ambi-",
    root: "gu",
    suffix: "-ous",
    exampleSentence: "The contract's ambiguous wording led to a legal dispute.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "8",
    word: "persevere",
    meaning: "continue in a course of action despite difficulty",
    synonyms: ["persist", "endure", "continue", "carry on"],
    partOfSpeech: "verb",
    difficulty: 2,
    prefix: "per-",
    root: "sever",
    exampleSentence: "Despite many setbacks, she persevered and achieved her goal.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "9",
    word: "benevolent",
    meaning: "well meaning and kindly",
    synonyms: ["kind", "generous", "charitable", "compassionate"],
    partOfSpeech: "adjective",
    difficulty: 3,
    prefix: "bene-",
    root: "vol",
    suffix: "-ent",
    exampleSentence: "The benevolent donor gave millions to charity.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "10",
    word: "scrutinize",
    meaning: "examine or inspect closely and thoroughly",
    synonyms: ["examine", "inspect", "analyze", "investigate"],
    partOfSpeech: "verb",
    difficulty: 3,
    root: "scrut",
    suffix: "-ize",
    exampleSentence: "The detective scrutinized every piece of evidence.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "11",
    word: "gregarious",
    meaning: "fond of company; sociable",
    synonyms: ["sociable", "outgoing", "friendly", "extroverted"],
    partOfSpeech: "adjective",
    difficulty: 4,
    root: "greg",
    suffix: "-arious",
    exampleSentence: "Her gregarious nature made her the life of every party.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "12",
    word: "tenacious",
    meaning: "holding firmly to something; persistent",
    synonyms: ["persistent", "determined", "resolute", "stubborn"],
    partOfSpeech: "adjective",
    difficulty: 3,
    root: "ten",
    suffix: "-acious",
    exampleSentence: "The tenacious reporter wouldn't give up on the story.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "13",
    word: "lucid",
    meaning: "expressed clearly; easy to understand",
    synonyms: ["clear", "coherent", "intelligible", "understandable"],
    partOfSpeech: "adjective",
    difficulty: 3,
    root: "luc",
    suffix: "-id",
    exampleSentence: "The professor gave a lucid explanation of quantum physics.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "14",
    word: "voracious",
    meaning: "wanting or devouring great quantities",
    synonyms: ["insatiable", "greedy", "ravenous", "hungry"],
    partOfSpeech: "adjective",
    difficulty: 4,
    root: "vor",
    suffix: "-acious",
    exampleSentence: "She was a voracious reader, finishing several books a week.",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "15",
    word: "diligent",
    meaning: "having or showing care and effort in work",
    synonyms: ["hardworking", "industrious", "conscientious", "assiduous"],
    partOfSpeech: "adjective",
    difficulty: 2,
    root: "dilig",
    suffix: "-ent",
    exampleSentence: "The diligent student always completed assignments on time.",
    repetitions: 0,
    easeFactor: 2.5,
  },
];

export const getRandomWords = (count: number, exclude: string[] = []): Word[] => {
  const available = vocabularyData.filter((w) => !exclude.includes(w.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getRandomSynonyms = (correctSynonym: string, allSynonyms: string[], count: number): string[] => {
  const otherWords = vocabularyData.flatMap((w) => w.synonyms).filter((s) => !allSynonyms.includes(s));
  const shuffled = [...new Set(otherWords)].sort(() => Math.random() - 0.5);
  const wrongAnswers = shuffled.slice(0, count - 1);
  const options = [...wrongAnswers, correctSynonym].sort(() => Math.random() - 0.5);
  return options;
};
