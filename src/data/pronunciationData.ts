export interface PronunciationWord {
  id: string;
  word: string;
  definition: string;
  correctPronunciation: string; // Oxford respelling
  incorrectPronunciations: string[]; // Common mispronunciations in Oxford respelling
  ipaCorrect: string; // IPA for reference
  explanation: string;
}

export const pronunciationData: PronunciationWord[] = [
  {
    id: "1",
    word: "epitome",
    definition: "A perfect example of a particular quality or type",
    correctPronunciation: "ih-PIT-uh-mee",
    incorrectPronunciations: ["EP-ih-tohm", "ep-ih-TOHM"],
    ipaCorrect: "/ɪˈpɪtəmi/",
    explanation: "Many people pronounce it like 'epi-tome' but it has four syllables with stress on the second.",
  },
  {
    id: "2",
    word: "mischievous",
    definition: "Causing or showing a fondness for causing trouble in a playful way",
    correctPronunciation: "MIS-chuh-vuhs",
    incorrectPronunciations: ["mis-CHEE-vee-uhs", "mis-CHEEV-ee-uhs"],
    ipaCorrect: "/ˈmɪstʃɪvəs/",
    explanation: "It has three syllables, not four. There's no 'ee' sound before the final syllable.",
  },
  {
    id: "3",
    word: "pronunciation",
    definition: "The way in which a word is spoken",
    correctPronunciation: "pruh-NUN-see-AY-shun",
    incorrectPronunciations: ["pro-NOUN-see-AY-shun", "pro-NOUN-shee-AY-shun"],
    ipaCorrect: "/prəˌnʌnsiˈeɪʃən/",
    explanation: "It's 'pro-NUN-ciation' not 'pro-NOUN-ciation.' The root is 'nunci' not 'nounci.'",
  },
  {
    id: "4",
    word: "hyperbole",
    definition: "Exaggerated statements not meant to be taken literally",
    correctPronunciation: "hy-PER-buh-lee",
    incorrectPronunciations: ["HY-per-bowl", "hy-per-BOHL"],
    ipaCorrect: "/haɪˈpɜːrbəli/",
    explanation: "It has four syllables and ends with 'lee,' not 'bowl.'",
  },
  {
    id: "5",
    word: "niche",
    definition: "A specialized segment of the market or a comfortable position",
    correctPronunciation: "neesh",
    incorrectPronunciations: ["nich", "nitch"],
    ipaCorrect: "/niːʃ/",
    explanation: "The French origin gives it a 'sh' sound at the end, not a 'ch' sound.",
  },
  {
    id: "6",
    word: "espresso",
    definition: "Strong black coffee made by forcing steam through ground coffee beans",
    correctPronunciation: "eh-SPRES-oh",
    incorrectPronunciations: ["ex-PRES-oh", "ek-SPRES-oh"],
    ipaCorrect: "/eˈspresəʊ/",
    explanation: "There's no 'x' sound—it's 'es' not 'ex.' From Italian 'esprimere.'",
  },
  {
    id: "7",
    word: "nuclear",
    definition: "Relating to the nucleus of an atom or cell",
    correctPronunciation: "NOO-klee-er",
    incorrectPronunciations: ["NOO-kyuh-ler", "NOO-kyoo-ler"],
    ipaCorrect: "/ˈnjuːkliər/",
    explanation: "It's 'noo-klee-er' with three syllables, not 'noo-kyuh-ler.'",
  },
  {
    id: "8",
    word: "quinoa",
    definition: "A grain-like crop grown primarily for its edible seeds",
    correctPronunciation: "KEEN-wah",
    incorrectPronunciations: ["kwin-OH-ah", "KEE-noh-ah"],
    ipaCorrect: "/ˈkiːnwɑː/",
    explanation: "From Spanish, it has two syllables: 'keen-wah.'",
  },
  {
    id: "9",
    word: "cache",
    definition: "A hidden storage space or a collection of items stored",
    correctPronunciation: "kash",
    incorrectPronunciations: ["kash-AY", "CATCH"],
    ipaCorrect: "/kæʃ/",
    explanation: "It rhymes with 'cash,' not 'catch' or 'ka-shay' (which is 'cachet').",
  },
  {
    id: "10",
    word: "often",
    definition: "Frequently or many times",
    correctPronunciation: "OFF-en",
    incorrectPronunciations: ["OFF-ten", "AWF-ten"],
    ipaCorrect: "/ˈɔːfən/",
    explanation: "The 't' is silent in standard pronunciation, though some dialects include it.",
  },
  {
    id: "11",
    word: "February",
    definition: "The second month of the year",
    correctPronunciation: "FEB-roo-air-ee",
    incorrectPronunciations: ["FEB-yoo-air-ee", "FEB-oo-air-ee"],
    ipaCorrect: "/ˈfebrueri/",
    explanation: "Don't skip the first 'r'—it's 'Feb-RU-ary.'",
  },
  {
    id: "12",
    word: "Arctic",
    definition: "Relating to the region around the North Pole",
    correctPronunciation: "ARK-tik",
    incorrectPronunciations: ["AR-tik", "AR-dik"],
    ipaCorrect: "/ˈɑːrktɪk/",
    explanation: "The first 'c' should be pronounced—it's 'ark-tik' not 'ar-tik.'",
  },
  {
    id: "13",
    word: "jewelry",
    definition: "Personal ornaments such as rings, necklaces, and earrings",
    correctPronunciation: "JOO-el-ree",
    incorrectPronunciations: ["JOO-luh-ree", "JOO-el-er-ee"],
    ipaCorrect: "/ˈdʒuːəlri/",
    explanation: "It has three syllables in American English, not 'joo-luh-ree.'",
  },
  {
    id: "14",
    word: "sherbet",
    definition: "A frozen dessert made with fruit juice, sugar, and water",
    correctPronunciation: "SHER-bit",
    incorrectPronunciations: ["SHER-bert", "sher-BAY"],
    ipaCorrect: "/ˈʃɜːrbɪt/",
    explanation: "There's only one 'r'—it's 'sher-bit' not 'sher-bert.'",
  },
  {
    id: "15",
    word: "supposedly",
    definition: "According to what is generally assumed or believed",
    correctPronunciation: "suh-POH-zid-lee",
    incorrectPronunciations: ["suh-POZ-ab-lee", "suh-POSE-lee"],
    ipaCorrect: "/səˈpəʊzɪdli/",
    explanation: "The middle is '-posed-' not '-posab-.' It ends in '-edly.'",
  },
];

export const getRandomPronunciationWords = (count: number, exclude: string[] = []): PronunciationWord[] => {
  const available = pronunciationData.filter(w => !exclude.includes(w.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
