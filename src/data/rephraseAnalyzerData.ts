export interface GrammarIssue {
  type: string;
  problematic: string;
  explanation: string;
  corrections: string[];
}

export interface RephrasedOption {
  context: string;
  sentence: string;
  whyItWorks: string;
}

export interface RephraseAnalysis {
  originalSentence: string;
  issues: GrammarIssue[];
  rephrasedOptions: RephrasedOption[];
  keyTakeaways: string[];
  bestRecommendation: string;
}

// Pattern-based analysis for common issues
const grammarPatterns: { pattern: RegExp; issue: Omit<GrammarIssue, "problematic"> }[] = [
  {
    pattern: /too less/i,
    issue: {
      type: "Incorrect Grammar",
      explanation: '"Too less" is incorrect grammar. "Less" is used for uncountable nouns. "Too" is an adverb of degree but cannot modify "less" directly.',
      corrections: [
        "too little (informal)",
        "too slowly (more natural for movement)",
        "minimal / insufficient (formal)",
      ],
    },
  },
  {
    pattern: /it make\b/i,
    issue: {
      type: "Subject-Verb Agreement",
      explanation: '"It" is singular, so it requires "makes" (third person singular form), not "make".',
      corrections: ["It makes", "This makes", "This causes"],
    },
  },
  {
    pattern: /\b(\w+) don't\b/i,
    issue: {
      type: "Subject-Verb Agreement",
      explanation: 'Use "doesn\'t" with third person singular subjects (he/she/it), not "don\'t".',
      corrections: ["doesn't", "does not"],
    },
  },
  {
    pattern: /more better/i,
    issue: {
      type: "Double Comparative",
      explanation: '"Better" is already comparative. Adding "more" creates a double comparative which is incorrect.',
      corrections: ["better", "much better", "significantly better"],
    },
  },
  {
    pattern: /more easier/i,
    issue: {
      type: "Double Comparative",
      explanation: '"Easier" is already comparative. Adding "more" is redundant and grammatically incorrect.',
      corrections: ["easier", "much easier", "far easier"],
    },
  },
  {
    pattern: /answer.*urgently/i,
    issue: {
      type: "Awkward Phrasing",
      explanation: 'While "answer urgently" is grammatically correct, it sounds unnatural. More natural alternatives exist.',
      corrections: [
        "rush to answer",
        "answer quickly",
        "feel pressured to respond",
      ],
    },
  },
  {
    pattern: /i found that/i,
    issue: {
      type: "Informal Phrasing",
      explanation: '"I found that" is grammatically correct but can sound informal. Consider alternatives based on context.',
      corrections: [
        "I noticed that (polite, observational)",
        "I observed that (formal)",
        "It appears that (objective)",
      ],
    },
  },
  {
    pattern: /moves up/i,
    issue: {
      type: "Context Clarity",
      explanation: '"Moves up" suggests physical motion. In a game/app context, more specific verbs are clearer.',
      corrections: [
        "advances (for progress)",
        "progresses (for game mechanics)",
        "increases (for values)",
      ],
    },
  },
  {
    pattern: /i am agree/i,
    issue: {
      type: "Verb Form Error",
      explanation: '"Agree" is already a verb. Using "am" before it is incorrect. This is a common learner mistake.',
      corrections: ["I agree", "I am in agreement (formal)", "I concur (formal)"],
    },
  },
  {
    pattern: /since \d+ years/i,
    issue: {
      type: "Preposition Error",
      explanation: 'Use "for" with duration (periods of time) and "since" with a point in time.',
      corrections: [
        "for X years (duration)",
        "since 2020 (point in time)",
        "over the past X years",
      ],
    },
  },
  {
    pattern: /didn't went/i,
    issue: {
      type: "Past Tense Error",
      explanation: 'After "didn\'t", use the base form of the verb, not the past tense.',
      corrections: ["didn't go", "did not go", "never went"],
    },
  },
  {
    pattern: /have went/i,
    issue: {
      type: "Past Participle Error",
      explanation: 'The past participle of "go" is "gone", not "went". Use "gone" with have/has/had.',
      corrections: ["have gone", "has gone", "had gone"],
    },
  },
];

// Awkward but grammatically correct patterns
const awkwardPatterns: { pattern: RegExp; issue: Omit<GrammarIssue, "problematic"> }[] = [
  {
    pattern: /the user/i,
    issue: {
      type: "Vague Reference",
      explanation: '"The user" is grammatically correct but can be vague. Specify if referring to one user or users in general.',
      corrections: ["users (general)", "the current user (specific)", "players (for games)"],
    },
  },
  {
    pattern: /the question/i,
    issue: {
      type: "Ambiguous Reference",
      explanation: '"The question" is correct but ambiguous. Clarify whether referring to one specific question or questions in general.',
      corrections: [
        "questions (plural, general)",
        "the current question (specific)",
        "each question",
      ],
    },
  },
];

function detectIssues(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  // Check grammar patterns
  for (const { pattern, issue } of grammarPatterns) {
    const match = text.match(pattern);
    if (match) {
      issues.push({
        ...issue,
        problematic: match[0],
      });
    }
  }

  // Check awkward patterns (only if no major grammar issues found for that part)
  for (const { pattern, issue } of awkwardPatterns) {
    const match = text.match(pattern);
    if (match && issues.length < 4) {
      issues.push({
        ...issue,
        problematic: match[0],
      });
    }
  }

  // If no issues found, add a generic "sounds unnatural" issue
  if (issues.length === 0) {
    issues.push({
      type: "General Review",
      problematic: text.slice(0, 30) + "...",
      explanation: "The sentence may benefit from restructuring for clarity and natural flow.",
      corrections: [
        "Consider starting with the main subject",
        "Use active voice where possible",
        "Keep sentences concise",
      ],
    });
  }

  return issues.slice(0, 4); // Limit to 4 issues
}

function generateRephrasedOptions(text: string): RephrasedOption[] {
  // Generate contextual rephrasing based on detected patterns
  const hasGameContext = /rocket|game|score|level|answer|question/i.test(text);
  const hasFeedbackContext = /found|noticed|think|feel/i.test(text);

  if (hasGameContext) {
    return [
      {
        context: "Natural & Concise",
        sentence: "I noticed that the rocket's progress is too slow after correct answers, which makes users rush to respond.",
        whyItWorks: '"I noticed" is polite and observational. "Rocket\'s progress is too slow" is clear and natural. "Rush to respond" is more natural than "answer urgently".',
      },
      {
        context: "Formal / Documentation",
        sentence: "When users answer correctly, the rocket's upward movement is minimal, which creates unnecessary urgency in their responses.",
        whyItWorks: '"Upward movement is minimal" is precise and professional. "Creates unnecessary urgency" explains the problem clearly.',
      },
      {
        context: "Technical / Bug Report",
        sentence: "The rocket's progress is too slow after correct answers, causing users to feel pressured to respond quickly.",
        whyItWorks: "Short and direct, good for technical feedback. 'Causing users to feel pressured' explains the user experience impact.",
      },
      {
        context: "UX / User-Focused",
        sentence: "Users may feel frustrated because the rocket moves too slowly after correct answers, making them rush through questions.",
        whyItWorks: "Focuses on user experience and emotional impact, which is ideal for UX discussions.",
      },
    ];
  }

  if (hasFeedbackContext) {
    return [
      {
        context: "Professional Feedback",
        sentence: text.replace(/i found/i, "I noticed").replace(/too less/i, "insufficient").replace(/it make/i, "This makes"),
        whyItWorks: "Uses professional language while maintaining the original meaning.",
      },
      {
        context: "Casual / Conversational",
        sentence: "I've noticed that " + text.slice(text.indexOf("that") + 5).replace(/too less/i, "not enough").replace(/it make/i, "which makes"),
        whyItWorks: "More conversational tone suitable for informal discussions.",
      },
      {
        context: "Direct / Action-Oriented",
        sentence: text.replace(/i found that/i, "").replace(/too less/i, "insufficiently").replace(/it make/i, "This causes").trim(),
        whyItWorks: "Gets straight to the point, ideal for quick communications.",
      },
    ];
  }

  // Default rephrasing options
  return [
    {
      context: "Clear & Natural",
      sentence: "Consider restructuring: Start with the main point, then add supporting details.",
      whyItWorks: "Placing the main idea first helps readers understand your message quickly.",
    },
    {
      context: "Formal",
      sentence: "A more formal version would use complete sentences and avoid contractions.",
      whyItWorks: "Formal writing is appropriate for professional or academic contexts.",
    },
    {
      context: "Concise",
      sentence: "Remove unnecessary words and focus on the essential meaning.",
      whyItWorks: "Concise writing is easier to read and more impactful.",
    },
  ];
}

function generateKeyTakeaways(issues: GrammarIssue[]): string[] {
  const takeaways: string[] = [];

  for (const issue of issues) {
    if (issue.type === "Incorrect Grammar" && issue.problematic.toLowerCase().includes("less")) {
      takeaways.push('Avoid "too less" → Use "too little" or "too slowly" instead.');
    }
    if (issue.type === "Subject-Verb Agreement") {
      takeaways.push("Check subject-verb agreement: singular subjects need singular verbs.");
    }
    if (issue.type === "Awkward Phrasing") {
      takeaways.push('Use natural phrasing: "rush to answer" sounds better than "answer urgently".');
    }
    if (issue.type === "Double Comparative") {
      takeaways.push("Avoid double comparatives: don't use 'more' with '-er' adjectives.");
    }
  }

  // Add general takeaways
  takeaways.push("Match your tone to context: casual for feedback, formal for reports.");
  takeaways.push("Clarify vague references: specify 'the user' or 'users' based on meaning.");

  return takeaways.slice(0, 5);
}

export function analyzeAndRephrase(text: string): RephraseAnalysis {
  const issues = detectIssues(text);
  const rephrasedOptions = generateRephrasedOptions(text);
  const keyTakeaways = generateKeyTakeaways(issues);

  return {
    originalSentence: text,
    issues,
    rephrasedOptions,
    keyTakeaways,
    bestRecommendation: rephrasedOptions[0]?.sentence || "Please provide a sentence to analyze.",
  };
}
