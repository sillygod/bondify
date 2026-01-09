export interface TransitionQuestion {
  id: number;
  context: string; // The scenario or two ideas to connect
  blank: string; // Where the transition goes
  correctAnswer: string;
  options: string[];
  category: "contrast" | "cause-effect" | "sequence" | "emphasis" | "example" | "summary" | "addition";
}

export const transitionsData: TransitionQuestion[] = [
  // Contrast transitions
  {
    id: 1,
    context: "The project was behind schedule.",
    blank: "___, the team managed to deliver on time.",
    correctAnswer: "Nevertheless",
    options: ["Nevertheless", "Therefore", "Furthermore", "For instance"],
    category: "contrast"
  },
  {
    id: 2,
    context: "Many experts predicted failure.",
    blank: "___, the startup became a billion-dollar company.",
    correctAnswer: "On the contrary",
    options: ["On the contrary", "As a result", "In addition", "Specifically"],
    category: "contrast"
  },
  {
    id: 3,
    context: "The first approach was simple and fast.",
    blank: "___, the second method was complex but more accurate.",
    correctAnswer: "In contrast",
    options: ["In contrast", "Subsequently", "Moreover", "To illustrate"],
    category: "contrast"
  },
  {
    id: 4,
    context: "Traditional methods have proven effective.",
    blank: "___, new technologies offer unprecedented opportunities.",
    correctAnswer: "Notwithstanding",
    options: ["Notwithstanding", "Consequently", "Additionally", "Namely"],
    category: "contrast"
  },

  // Cause-effect transitions
  {
    id: 5,
    context: "The company invested heavily in R&D.",
    blank: "___, they developed groundbreaking products.",
    correctAnswer: "As a result",
    options: ["As a result", "However", "Meanwhile", "For example"],
    category: "cause-effect"
  },
  {
    id: 6,
    context: "Remote work became the norm.",
    blank: "___, companies had to rethink their collaboration tools.",
    correctAnswer: "Consequently",
    options: ["Consequently", "Conversely", "Similarly", "Specifically"],
    category: "cause-effect"
  },
  {
    id: 7,
    context: "The study revealed alarming trends.",
    blank: "___, policy makers took immediate action.",
    correctAnswer: "Hence",
    options: ["Hence", "Nevertheless", "Likewise", "In particular"],
    category: "cause-effect"
  },
  {
    id: 8,
    context: "Customer feedback was overwhelmingly negative.",
    blank: "___, the product was pulled from the market.",
    correctAnswer: "For this reason",
    options: ["For this reason", "On the other hand", "Furthermore", "To clarify"],
    category: "cause-effect"
  },

  // Sequence transitions
  {
    id: 9,
    context: "We need to analyze the data.",
    blank: "___, we'll present our findings to stakeholders.",
    correctAnswer: "Subsequently",
    options: ["Subsequently", "However", "Moreover", "In other words"],
    category: "sequence"
  },
  {
    id: 10,
    context: "First, define your objectives.",
    blank: "___, develop a strategic plan.",
    correctAnswer: "Next",
    options: ["Next", "Conversely", "Additionally", "Namely"],
    category: "sequence"
  },
  {
    id: 11,
    context: "The team completed the research phase.",
    blank: "___, they moved into product development.",
    correctAnswer: "Thereafter",
    options: ["Thereafter", "Nevertheless", "Likewise", "For instance"],
    category: "sequence"
  },
  {
    id: 12,
    context: "We've covered the basics.",
    blank: "___, let's dive into advanced techniques.",
    correctAnswer: "Now",
    options: ["Now", "However", "Furthermore", "To illustrate"],
    category: "sequence"
  },

  // Emphasis transitions
  {
    id: 13,
    context: "This approach saves time.",
    blank: "___, it significantly reduces costs.",
    correctAnswer: "More importantly",
    options: ["More importantly", "In contrast", "Subsequently", "For example"],
    category: "emphasis"
  },
  {
    id: 14,
    context: "The technology is innovative.",
    blank: "___, it's the most sustainable option available.",
    correctAnswer: "Above all",
    options: ["Above all", "However", "Then", "Specifically"],
    category: "emphasis"
  },
  {
    id: 15,
    context: "User experience must be prioritized.",
    blank: "___, accessibility cannot be overlooked.",
    correctAnswer: "Equally important",
    options: ["Equally important", "Conversely", "Meanwhile", "In particular"],
    category: "emphasis"
  },
  {
    id: 16,
    context: "The solution is elegant.",
    blank: "___, it addresses the root cause of the problem.",
    correctAnswer: "What's more",
    options: ["What's more", "On the contrary", "Finally", "To clarify"],
    category: "emphasis"
  },

  // Example transitions
  {
    id: 17,
    context: "Many companies have embraced remote work.",
    blank: "___, tech giants like Google offer hybrid options.",
    correctAnswer: "For instance",
    options: ["For instance", "Therefore", "However", "Subsequently"],
    category: "example"
  },
  {
    id: 18,
    context: "Soft skills are essential for leadership.",
    blank: "___, empathy helps build stronger team relationships.",
    correctAnswer: "To illustrate",
    options: ["To illustrate", "Consequently", "In contrast", "Furthermore"],
    category: "example"
  },
  {
    id: 19,
    context: "There are several ways to improve productivity.",
    blank: "___, time-blocking has proven highly effective.",
    correctAnswer: "Specifically",
    options: ["Specifically", "Nevertheless", "Moreover", "Then"],
    category: "example"
  },
  {
    id: 20,
    context: "Emotional intelligence matters in negotiations.",
    blank: "___, reading body language can reveal hidden concerns.",
    correctAnswer: "In particular",
    options: ["In particular", "As a result", "Conversely", "Additionally"],
    category: "example"
  },

  // Summary transitions
  {
    id: 21,
    context: "We've explored multiple strategies.",
    blank: "___, consistency is the key to success.",
    correctAnswer: "In conclusion",
    options: ["In conclusion", "However", "For example", "Subsequently"],
    category: "summary"
  },
  {
    id: 22,
    context: "The data supports our hypothesis.",
    blank: "___, further research is warranted.",
    correctAnswer: "In summary",
    options: ["In summary", "Conversely", "Specifically", "Moreover"],
    category: "summary"
  },
  {
    id: 23,
    context: "We've discussed the pros and cons.",
    blank: "___, the benefits outweigh the risks.",
    correctAnswer: "To sum up",
    options: ["To sum up", "Nevertheless", "For instance", "Furthermore"],
    category: "summary"
  },
  {
    id: 24,
    context: "All factors have been considered.",
    blank: "___, the evidence clearly supports action.",
    correctAnswer: "Ultimately",
    options: ["Ultimately", "In contrast", "To illustrate", "Next"],
    category: "summary"
  },

  // Addition transitions
  {
    id: 25,
    context: "The solution improves efficiency.",
    blank: "___, it enhances team collaboration.",
    correctAnswer: "Furthermore",
    options: ["Furthermore", "However", "As a result", "For example"],
    category: "addition"
  },
  {
    id: 26,
    context: "Regular exercise boosts physical health.",
    blank: "___, it improves mental well-being.",
    correctAnswer: "Moreover",
    options: ["Moreover", "In contrast", "Subsequently", "To clarify"],
    category: "addition"
  },
  {
    id: 27,
    context: "The platform offers powerful analytics.",
    blank: "___, it integrates with popular tools.",
    correctAnswer: "Additionally",
    options: ["Additionally", "Nevertheless", "Hence", "Specifically"],
    category: "addition"
  },
  {
    id: 28,
    context: "Learning a new skill takes dedication.",
    blank: "___, it requires consistent practice.",
    correctAnswer: "Likewise",
    options: ["Likewise", "On the contrary", "For instance", "Finally"],
    category: "addition"
  }
];

export const categoryLabels: Record<TransitionQuestion["category"], string> = {
  "contrast": "Contrast",
  "cause-effect": "Cause & Effect",
  "sequence": "Sequence",
  "emphasis": "Emphasis",
  "example": "Example",
  "summary": "Summary",
  "addition": "Addition"
};

export const categoryColors: Record<TransitionQuestion["category"], string> = {
  "contrast": "from-orange-500/20 to-red-500/20",
  "cause-effect": "from-blue-500/20 to-cyan-500/20",
  "sequence": "from-purple-500/20 to-pink-500/20",
  "emphasis": "from-yellow-500/20 to-amber-500/20",
  "example": "from-green-500/20 to-emerald-500/20",
  "summary": "from-indigo-500/20 to-violet-500/20",
  "addition": "from-teal-500/20 to-cyan-500/20"
};
