export interface ClaritySentence {
  id: string;
  sentence: string;
  wordyPart: {
    startIndex: number;
    endIndex: number;
    text: string;
  };
  options: string[];
  correctOption: string;
  reason: string;
}

export const clarityData: ClaritySentence[] = [
  {
    id: "1",
    sentence: "Due to the fact that the weather was bad, we canceled the picnic.",
    wordyPart: {
      startIndex: 0,
      endIndex: 23,
      text: "Due to the fact that",
    },
    options: ["Because", "Since", "As a result of the situation where"],
    correctOption: "Because",
    reason: "'Due to the fact that' is wordy. Simply use 'Because' for clarity and conciseness.",
  },
  {
    id: "2",
    sentence: "She is of the opinion that we should start earlier.",
    wordyPart: {
      startIndex: 7,
      endIndex: 24,
      text: "of the opinion that",
    },
    options: ["believes", "thinks", "holds the viewpoint that"],
    correctOption: "believes",
    reason: "'Is of the opinion that' can be replaced with the simpler 'believes' or 'thinks'.",
  },
  {
    id: "3",
    sentence: "At this point in time, we cannot make a decision.",
    wordyPart: {
      startIndex: 0,
      endIndex: 21,
      text: "At this point in time",
    },
    options: ["Currently", "Now", "At the present moment in time"],
    correctOption: "Now",
    reason: "'At this point in time' is unnecessarily wordy. Use 'Now' or 'Currently' instead.",
  },
  {
    id: "4",
    sentence: "The reason why he left is because he was tired.",
    wordyPart: {
      startIndex: 0,
      endIndex: 18,
      text: "The reason why",
    },
    options: ["Why", "The cause for which", "The explanation for why"],
    correctOption: "Why",
    reason: "'The reason why' is redundant. Simply use 'Why' or restructure: 'He left because he was tired.'",
  },
  {
    id: "5",
    sentence: "In spite of the fact that it was raining, they played outside.",
    wordyPart: {
      startIndex: 0,
      endIndex: 26,
      text: "In spite of the fact that",
    },
    options: ["Although", "Despite", "Notwithstanding the circumstance that"],
    correctOption: "Although",
    reason: "'In spite of the fact that' is wordy. Use 'Although' or 'Despite' for conciseness.",
  },
  {
    id: "6",
    sentence: "He made the decision to accept the job offer.",
    wordyPart: {
      startIndex: 3,
      endIndex: 20,
      text: "made the decision",
    },
    options: ["decided", "chose", "came to the determination"],
    correctOption: "decided",
    reason: "'Made the decision' can be simplified to just 'decided'.",
  },
  {
    id: "7",
    sentence: "It is necessary that all employees attend the meeting.",
    wordyPart: {
      startIndex: 0,
      endIndex: 18,
      text: "It is necessary that",
    },
    options: ["All employees must", "All employees should", "There is a requirement for all employees to"],
    correctOption: "All employees must",
    reason: "'It is necessary that' is indirect. Restructure to 'All employees must' for directness.",
  },
  {
    id: "8",
    sentence: "She has the ability to solve complex problems quickly.",
    wordyPart: {
      startIndex: 4,
      endIndex: 22,
      text: "has the ability to",
    },
    options: ["can", "is capable of", "possesses the capability to"],
    correctOption: "can",
    reason: "'Has the ability to' is wordy. Simply use 'can' for clarity.",
  },
  {
    id: "9",
    sentence: "In order to succeed, you must work hard.",
    wordyPart: {
      startIndex: 0,
      endIndex: 11,
      text: "In order to",
    },
    options: ["To", "For the purpose of", "With the aim of"],
    correctOption: "To",
    reason: "'In order to' can almost always be shortened to just 'To'.",
  },
  {
    id: "10",
    sentence: "There are many students who prefer online learning.",
    wordyPart: {
      startIndex: 0,
      endIndex: 9,
      text: "There are",
    },
    options: ["Many students", "A number of students exist who", "It is the case that many students"],
    correctOption: "Many students",
    reason: "'There are...who' is an expletive construction. Start directly with the subject: 'Many students prefer...'",
  },
  {
    id: "11",
    sentence: "He gave an explanation of the procedure to the team.",
    wordyPart: {
      startIndex: 3,
      endIndex: 23,
      text: "gave an explanation of",
    },
    options: ["explained", "provided a description of", "offered an elucidation regarding"],
    correctOption: "explained",
    reason: "'Gave an explanation of' is wordy. Use the verb 'explained' directly.",
  },
  {
    id: "12",
    sentence: "The project was completed in a timely manner.",
    wordyPart: {
      startIndex: 26,
      endIndex: 44,
      text: "in a timely manner",
    },
    options: ["on time", "promptly", "within the bounds of timeliness"],
    correctOption: "on time",
    reason: "'In a timely manner' is bureaucratic jargon. Use 'on time' or 'promptly'.",
  },
];

export const getRandomClaritySentences = (count: number, exclude: string[] = []): ClaritySentence[] => {
  const available = clarityData.filter(s => !exclude.includes(s.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
