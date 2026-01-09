export interface ListeningQuestion {
  id: string;
  category: "casual" | "professional";
  conversation: {
    speaker: string;
    text: string;
  }[];
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const listeningQuestions: ListeningQuestion[] = [
  // Casual conversations
  {
    id: "casual-1",
    category: "casual",
    conversation: [
      { speaker: "Person A", text: "Hey, do you want to grab some coffee later?" },
      { speaker: "Person B", text: "I'd love to, but I have a dentist appointment at 3." },
    ],
    question: "What is the best response from Person A?",
    options: [
      "No problem! How about tomorrow instead?",
      "You should cancel your appointment.",
      "I don't like dentists either.",
    ],
    correctAnswer: 0,
    explanation: "The best response acknowledges the schedule conflict and offers an alternative time, showing flexibility and consideration.",
  },
  {
    id: "casual-2",
    category: "casual",
    conversation: [
      { speaker: "Person A", text: "I just got back from my vacation in Italy!" },
      { speaker: "Person B", text: "Oh wow, that sounds amazing!" },
    ],
    question: "What is the best follow-up from Person B?",
    options: [
      "I went there last year too.",
      "What was your favorite part of the trip?",
      "Italy is very far away.",
    ],
    correctAnswer: 1,
    explanation: "Asking about their favorite part shows genuine interest and encourages them to share more about their experience.",
  },
  {
    id: "casual-3",
    category: "casual",
    conversation: [
      { speaker: "Person A", text: "I'm thinking about getting a dog." },
      { speaker: "Person B", text: "That's a big responsibility!" },
    ],
    question: "What is the best response from Person A?",
    options: [
      "Never mind then, I won't get one.",
      "You're right. I've been researching breeds that fit my lifestyle.",
      "Dogs are better than cats.",
    ],
    correctAnswer: 1,
    explanation: "This response shows that Person A has considered the responsibility and is taking a thoughtful approach to the decision.",
  },
  {
    id: "casual-4",
    category: "casual",
    conversation: [
      { speaker: "Person A", text: "I failed my driving test again." },
      { speaker: "Person B", text: "Oh no, I'm sorry to hear that." },
    ],
    question: "What is the best follow-up from Person B?",
    options: [
      "Maybe driving isn't for you.",
      "What part did you struggle with? Maybe I can help you practice.",
      "I passed on my first try.",
    ],
    correctAnswer: 1,
    explanation: "Offering to help shows empathy and support, rather than discouraging them or being insensitive.",
  },
  // Professional conversations
  {
    id: "prof-1",
    category: "professional",
    conversation: [
      { speaker: "Manager", text: "The client wants to move the deadline up by two weeks." },
      { speaker: "Employee", text: "That's going to be challenging with our current resources." },
    ],
    question: "What is the best response from the Manager?",
    options: [
      "Just make it happen somehow.",
      "What would you need to make this timeline work?",
      "I'll tell them we can't do it.",
    ],
    correctAnswer: 1,
    explanation: "Asking what resources are needed shows collaborative problem-solving and respects the employee's assessment.",
  },
  {
    id: "prof-2",
    category: "professional",
    conversation: [
      { speaker: "Colleague A", text: "I noticed some errors in the report you submitted." },
      { speaker: "Colleague B", text: "Oh, really? I thought I double-checked everything." },
    ],
    question: "What is the best response from Colleague A?",
    options: [
      "Well, you clearly didn't check well enough.",
      "Let me show you what I found so we can fix it together.",
      "You need to be more careful next time.",
    ],
    correctAnswer: 1,
    explanation: "Offering to work together on fixing the issues is constructive and maintains a positive working relationship.",
  },
  {
    id: "prof-3",
    category: "professional",
    conversation: [
      { speaker: "Client", text: "We're not happy with the latest design proposal." },
      { speaker: "Designer", text: "I'm sorry to hear that." },
    ],
    question: "What is the best follow-up from the Designer?",
    options: [
      "Could you tell me specifically what aspects aren't working for you?",
      "But I worked really hard on it.",
      "Other clients usually love my work.",
    ],
    correctAnswer: 0,
    explanation: "Asking for specific feedback shows professionalism and a willingness to understand and address the client's concerns.",
  },
  {
    id: "prof-4",
    category: "professional",
    conversation: [
      { speaker: "Team Lead", text: "We need someone to present at next week's conference." },
      { speaker: "Team Member", text: "I'm interested, but I've never presented at a conference before." },
    ],
    question: "What is the best response from the Team Lead?",
    options: [
      "Then maybe someone more experienced should do it.",
      "That's okay! I can help you prepare, and it's a great opportunity to develop your skills.",
      "Just don't mess it up.",
    ],
    correctAnswer: 1,
    explanation: "Encouraging growth while offering support helps develop team members and shows good leadership.",
  },
  {
    id: "casual-5",
    category: "casual",
    conversation: [
      { speaker: "Person A", text: "I've been learning to cook lately." },
      { speaker: "Person B", text: "That's great! What have you made so far?" },
      { speaker: "Person A", text: "Mostly simple things like pasta and stir-fry." },
    ],
    question: "What is the best response from Person B?",
    options: [
      "Those are too easy. Try something harder.",
      "Everyone starts somewhere! Those are perfect dishes to build your skills.",
      "I already know how to cook those.",
    ],
    correctAnswer: 1,
    explanation: "Encouraging their progress while acknowledging that everyone starts with basics is supportive and positive.",
  },
  {
    id: "prof-5",
    category: "professional",
    conversation: [
      { speaker: "Interviewer", text: "Tell me about a time you faced a challenge at work." },
      { speaker: "Candidate", text: "Last year, our team had to deliver a project with half the usual timeline." },
    ],
    question: "What should the Candidate say next?",
    options: [
      "It was really stressful and I didn't like it.",
      "I organized daily standups and prioritized the most critical features, and we delivered on time.",
      "My manager made us work overtime every day.",
    ],
    correctAnswer: 1,
    explanation: "Explaining the specific actions taken and the positive outcome demonstrates problem-solving skills and leadership.",
  },
];

export function getRandomQuestions(count: number = 5): ListeningQuestion[] {
  const shuffled = [...listeningQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
