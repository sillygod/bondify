export type ChallengeType = "conjunction" | "reorder" | "rephrase" | "combine";

export interface RephraseQuestion {
  id: string;
  type: ChallengeType;
  level: 1 | 2 | 3; // 1 = easy, 2 = medium, 3 = hard
  context: string; // The paragraph with issue highlighted
  targetSentence: string; // The sentence/part to fix
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const rephraseData: RephraseQuestion[] = [
  // Level 1 - Easy (Single sentence, simple conjunctions)
  {
    id: "r1",
    type: "conjunction",
    level: 1,
    context: "I wanted to go to the park. [___] it was raining heavily.",
    targetSentence: "I wanted to go to the park. And it was raining heavily.",
    options: [
      "However, it was raining heavily.",
      "And it was raining heavily.",
      "Also, it was raining heavily.",
      "Therefore, it was raining heavily."
    ],
    correctAnswer: "However, it was raining heavily.",
    explanation: "'However' shows contrast between wanting to go and the rain preventing it."
  },
  {
    id: "r2",
    type: "conjunction",
    level: 1,
    context: "She studied hard for the exam. [___] she passed with flying colors.",
    targetSentence: "She studied hard for the exam. And she passed with flying colors.",
    options: [
      "But she passed with flying colors.",
      "Consequently, she passed with flying colors.",
      "However, she passed with flying colors.",
      "Although she passed with flying colors."
    ],
    correctAnswer: "Consequently, she passed with flying colors.",
    explanation: "'Consequently' shows the result/effect of studying hard."
  },
  {
    id: "r3",
    type: "rephrase",
    level: 1,
    context: "The movie was very, very good. I liked it a lot.",
    targetSentence: "The movie was very, very good.",
    options: [
      "The movie was exceptional.",
      "The movie was good good.",
      "The movie was not bad.",
      "The movie was okay."
    ],
    correctAnswer: "The movie was exceptional.",
    explanation: "'Exceptional' is more concise and expressive than 'very, very good'."
  },
  {
    id: "r4",
    type: "conjunction",
    level: 1,
    context: "He is talented. [___] he is also hardworking.",
    targetSentence: "He is talented. And he is also hardworking.",
    options: [
      "Moreover, he is hardworking.",
      "But he is hardworking.",
      "However, he is hardworking.",
      "Although he is hardworking."
    ],
    correctAnswer: "Moreover, he is hardworking.",
    explanation: "'Moreover' adds emphasis to the additional positive quality."
  },
  
  // Level 2 - Medium (Multiple sentences, paragraph flow)
  {
    id: "r5",
    type: "reorder",
    level: 2,
    context: "First, I need to buy ingredients. Then I will start cooking. Before that, I should check the recipe.",
    targetSentence: "The sentences are in wrong order.",
    options: [
      "First, I should check the recipe. Then I need to buy ingredients. Finally, I will start cooking.",
      "First, I will start cooking. Then I should check the recipe. Finally, I need to buy ingredients.",
      "First, I need to buy ingredients. Then I should check the recipe. Finally, I will start cooking.",
      "Keep the original order."
    ],
    correctAnswer: "First, I should check the recipe. Then I need to buy ingredients. Finally, I will start cooking.",
    explanation: "Logical order: check recipe → buy ingredients → cook."
  },
  {
    id: "r6",
    type: "combine",
    level: 2,
    context: "The dog was hungry. The dog was tired. The dog had been running all day.",
    targetSentence: "Combine these three sentences effectively.",
    options: [
      "The dog was hungry and tired because it had been running all day.",
      "The dog was hungry. And tired. And had been running all day.",
      "Running all day, the dog was hungry, the dog was tired.",
      "The dog, hungry and tired, the dog had been running all day."
    ],
    correctAnswer: "The dog was hungry and tired because it had been running all day.",
    explanation: "This combines all information clearly with a cause-effect relationship."
  },
  {
    id: "r7",
    type: "rephrase",
    level: 2,
    context: "In my opinion, I think that the decision was wrong. It seems to me that they should reconsider.",
    targetSentence: "In my opinion, I think that the decision was wrong.",
    options: [
      "The decision was clearly wrong.",
      "I think in my opinion the decision was wrong.",
      "In my opinion, I believe I think it was wrong.",
      "Maybe perhaps the decision was wrong."
    ],
    correctAnswer: "The decision was clearly wrong.",
    explanation: "Removes redundancy ('in my opinion' and 'I think' mean the same thing)."
  },
  {
    id: "r8",
    type: "conjunction",
    level: 2,
    context: "The company faced many challenges. [___] They managed to increase profits by 20%.",
    targetSentence: "The company faced many challenges. But they managed to increase profits.",
    options: [
      "Nevertheless, they managed to increase profits by 20%.",
      "Therefore, they managed to increase profits by 20%.",
      "Similarly, they managed to increase profits by 20%.",
      "In addition, they managed to increase profits by 20%."
    ],
    correctAnswer: "Nevertheless, they managed to increase profits by 20%.",
    explanation: "'Nevertheless' shows contrast and emphasizes the achievement despite challenges."
  },
  
  // Level 3 - Hard (Complex paragraphs, multiple issues)
  {
    id: "r9",
    type: "rephrase",
    level: 3,
    context: "The research findings were significant. The research findings showed that the new treatment was effective. The research findings could change medical practice.",
    targetSentence: "Fix the repetitive structure.",
    options: [
      "The significant research findings demonstrated the new treatment's effectiveness, potentially revolutionizing medical practice.",
      "The research findings were significant and showed effectiveness and could change practice.",
      "Significant, effective, and practice-changing were the research findings.",
      "The findings of the research were significant in the research about treatment."
    ],
    correctAnswer: "The significant research findings demonstrated the new treatment's effectiveness, potentially revolutionizing medical practice.",
    explanation: "Combines all ideas into one flowing sentence without repetition."
  },
  {
    id: "r10",
    type: "combine",
    level: 3,
    context: "Climate change is a pressing issue. Governments must act now. Individual actions also matter. We cannot delay any longer.",
    targetSentence: "Combine into a compelling paragraph.",
    options: [
      "Climate change is a pressing issue that demands immediate action from both governments and individuals—we cannot delay any longer.",
      "Climate change is pressing. Governments must act. Individuals must act. No delay.",
      "Climate change, governments, individuals, and delay are all issues.",
      "We cannot delay because climate change is an issue for governments and individuals to act on now."
    ],
    correctAnswer: "Climate change is a pressing issue that demands immediate action from both governments and individuals—we cannot delay any longer.",
    explanation: "Creates a cohesive statement that flows naturally and maintains urgency."
  },
  {
    id: "r11",
    type: "reorder",
    level: 3,
    context: "In conclusion, renewable energy is essential. Solar and wind power are growing rapidly. However, challenges remain in storage technology. The transition from fossil fuels has begun. Many countries have set ambitious targets.",
    targetSentence: "Reorder for logical flow.",
    options: [
      "The transition from fossil fuels has begun. Many countries have set ambitious targets. Solar and wind power are growing rapidly. However, challenges remain in storage technology. In conclusion, renewable energy is essential.",
      "In conclusion, renewable energy is essential. The transition from fossil fuels has begun. However, challenges remain. Solar and wind power are growing. Many countries have set targets.",
      "Solar and wind power are growing rapidly. In conclusion, renewable energy is essential. The transition has begun. Challenges remain. Countries have targets.",
      "Keep the original order."
    ],
    correctAnswer: "The transition from fossil fuels has begun. Many countries have set ambitious targets. Solar and wind power are growing rapidly. However, challenges remain in storage technology. In conclusion, renewable energy is essential.",
    explanation: "Follows logical structure: introduction → evidence → challenges → conclusion."
  },
  {
    id: "r12",
    type: "rephrase",
    level: 3,
    context: "Due to the fact that the weather was bad, we made the decision to postpone the event to a later date in the future.",
    targetSentence: "Make this more concise.",
    options: [
      "Because of bad weather, we postponed the event.",
      "Due to the fact of weather being bad, we decided to postpone.",
      "The bad weather caused us to make a postponement decision.",
      "We postponed due to the fact that weather was not good."
    ],
    correctAnswer: "Because of bad weather, we postponed the event.",
    explanation: "Removes wordy phrases: 'due to the fact that' → 'because of', 'made the decision to' → 'decided', 'to a later date in the future' is redundant."
  }
];

export const challengeTypeLabels: Record<ChallengeType, string> = {
  conjunction: "Conjunctions",
  reorder: "Sentence Order",
  rephrase: "Rephrase",
  combine: "Combine Sentences"
};

export const challengeTypeColors: Record<ChallengeType, string> = {
  conjunction: "neon-cyan",
  reorder: "neon-purple",
  rephrase: "neon-pink",
  combine: "neon-green"
};

export const levelLabels: Record<1 | 2 | 3, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard"
};

export const getQuestionsByLevel = (level: 1 | 2 | 3): RephraseQuestion[] => {
  return rephraseData.filter(q => q.level === level);
};

export const getProgressiveQuestions = (count: number = 10): RephraseQuestion[] => {
  const level1 = rephraseData.filter(q => q.level === 1);
  const level2 = rephraseData.filter(q => q.level === 2);
  const level3 = rephraseData.filter(q => q.level === 3);
  
  // Progressive: 3 easy, 4 medium, 3 hard
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  return [
    ...shuffleArray(level1).slice(0, 3),
    ...shuffleArray(level2).slice(0, 4),
    ...shuffleArray(level3).slice(0, 3)
  ];
};
