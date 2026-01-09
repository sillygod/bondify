export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  correction?: {
    original: string;
    corrected: string;
    explanation: string;
  };
}

interface ConversationResponse {
  reply: string;
  followUp: string;
  correction?: {
    original: string;
    corrected: string;
    explanation: string;
  };
}

// Simple pattern matching for common mistakes
const commonMistakes: { pattern: RegExp; correction: string; explanation: string }[] = [
  { pattern: /\bi go to\b.*\byesterday\b/i, correction: "I went to", explanation: "Use past tense 'went' for past actions" },
  { pattern: /\bi am agree\b/i, correction: "I agree", explanation: "'Agree' is already a verb, no need for 'am'" },
  { pattern: /\bhe don't\b/i, correction: "he doesn't", explanation: "Use 'doesn't' with he/she/it" },
  { pattern: /\bshe don't\b/i, correction: "she doesn't", explanation: "Use 'doesn't' with he/she/it" },
  { pattern: /\bi didn't went\b/i, correction: "I didn't go", explanation: "Use base form after 'didn't'" },
  { pattern: /\bmore better\b/i, correction: "better", explanation: "'Better' is already comparative, no need for 'more'" },
  { pattern: /\bmore easier\b/i, correction: "easier", explanation: "'Easier' is already comparative" },
  { pattern: /\bi have went\b/i, correction: "I have gone", explanation: "Use 'gone' as past participle" },
  { pattern: /\bsince \d+ years\b/i, correction: "for X years", explanation: "Use 'for' with duration, 'since' with a point in time" },
];

// Conversation starters and responses based on topics
const conversationFlows: Record<string, ConversationResponse[]> = {
  greeting: [
    { reply: "Hey! Nice to chat with you.", followUp: "So, what's something interesting that happened to you this week?" },
    { reply: "Great to meet you!", followUp: "What do you usually do on weekends?" },
  ],
  hobbies: [
    { reply: "That sounds really fun!", followUp: "How long have you been doing that?" },
    { reply: "Oh, I love that too!", followUp: "What got you interested in it in the first place?" },
    { reply: "That's a cool hobby.", followUp: "Do you do it alone or with friends?" },
  ],
  work: [
    { reply: "That sounds like an interesting job.", followUp: "What's the best part about it?" },
    { reply: "I see, that must keep you busy!", followUp: "How do you usually unwind after work?" },
  ],
  travel: [
    { reply: "Wow, that sounds amazing!", followUp: "What was your favorite thing about that place?" },
    { reply: "I'd love to visit there someday.", followUp: "Any tips for someone who wants to go there?" },
  ],
  food: [
    { reply: "Mmm, that sounds delicious!", followUp: "Do you cook it yourself or eat out?" },
    { reply: "I haven't tried that before.", followUp: "What makes it so special?" },
  ],
  general: [
    { reply: "That's really interesting!", followUp: "Can you tell me more about that?" },
    { reply: "Oh, I see what you mean.", followUp: "How did that make you feel?" },
    { reply: "That makes sense.", followUp: "What do you think you'll do next?" },
    { reply: "I totally get that.", followUp: "Has that happened to you before?" },
  ],
};

// Keywords to detect topics
const topicKeywords: Record<string, string[]> = {
  hobbies: ["hobby", "hobbies", "play", "game", "sport", "music", "read", "watch", "movie", "book"],
  work: ["work", "job", "office", "company", "boss", "colleague", "meeting", "project"],
  travel: ["travel", "trip", "vacation", "visit", "country", "city", "flight", "hotel"],
  food: ["food", "eat", "cook", "restaurant", "dish", "meal", "breakfast", "lunch", "dinner", "delicious"],
};

function detectTopic(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return topic;
    }
  }
  
  return "general";
}

function detectMistake(message: string): { original: string; corrected: string; explanation: string } | null {
  for (const mistake of commonMistakes) {
    const match = message.match(mistake.pattern);
    if (match) {
      return {
        original: match[0],
        corrected: mistake.correction,
        explanation: mistake.explanation,
      };
    }
  }
  return null;
}

function getRandomResponse(responses: ConversationResponse[]): ConversationResponse {
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function sendMessage(message: string, messageCount: number): Promise<ConversationResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
  
  const topic = detectTopic(message);
  const responses = conversationFlows[topic] || conversationFlows.general;
  const response = getRandomResponse(responses);
  const correction = detectMistake(message);
  
  return {
    ...response,
    correction: correction || undefined,
  };
}

export function getOpeningMessage(): ConversationMessage {
  const openings = [
    "Hi there! I'm excited to practice English with you today. So, what did you do this morning?",
    "Hey! Great to meet you. Let's have a nice chat. What's your favorite way to spend a free afternoon?",
    "Hello! I'm here to help you practice English. Tell me, what's something you're looking forward to this week?",
  ];
  
  return {
    id: "opening",
    role: "assistant",
    content: openings[Math.floor(Math.random() * openings.length)],
  };
}

export function generateFeedback(messages: ConversationMessage[]): string {
  const userMessages = messages.filter(m => m.role === "user");
  const corrections = messages.filter(m => m.correction).map(m => m.correction!);
  
  let feedback = "## Conversation Summary\n\n";
  feedback += `Great job! You exchanged ${userMessages.length} messages in this conversation.\n\n`;
  
  if (corrections.length > 0) {
    feedback += "### Areas for Improvement\n\n";
    corrections.forEach((c, i) => {
      feedback += `${i + 1}. **"${c.original}"** → **"${c.corrected}"**\n`;
      feedback += `   _${c.explanation}_\n\n`;
    });
  } else {
    feedback += "### Great News!\n\nNo major grammar mistakes detected. Keep up the good work!\n\n";
  }
  
  feedback += "### Tips for More Natural Speaking\n\n";
  feedback += "- Use contractions like \"I'm\", \"don't\", \"can't\" for casual conversation\n";
  feedback += "- Add filler words like \"well\", \"actually\", \"you know\" to sound more natural\n";
  feedback += "- Ask questions back to keep conversations flowing\n";
  
  return feedback;
}
