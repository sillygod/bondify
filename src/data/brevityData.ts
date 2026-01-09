export interface BrevitySentence {
  id: string;
  sentence: string;
  redundantPart: {
    text: string;
    startIndex: number;
  };
  reason: string;
}

export const brevityData: BrevitySentence[] = [
  {
    id: "1",
    sentence: "The project was a complete and total failure.",
    redundantPart: { text: "and total", startIndex: 24 },
    reason: "'Complete' and 'total' mean the same thing. Use just 'complete' or 'total'.",
  },
  {
    id: "2",
    sentence: "She gave me a free gift for my birthday.",
    redundantPart: { text: "free", startIndex: 14 },
    reason: "All gifts are free by definition. Simply say 'gift'.",
  },
  {
    id: "3",
    sentence: "We need to plan ahead for the upcoming event.",
    redundantPart: { text: "ahead", startIndex: 16 },
    reason: "Planning inherently involves the future. 'Plan' alone is sufficient.",
  },
  {
    id: "4",
    sentence: "The true facts of the case were revealed.",
    redundantPart: { text: "true", startIndex: 4 },
    reason: "Facts are inherently true. Simply say 'facts'.",
  },
  {
    id: "5",
    sentence: "Let me repeat that again for clarity.",
    redundantPart: { text: "again", startIndex: 19 },
    reason: "'Repeat' already means to do something again. Just use 'repeat'.",
  },
  {
    id: "6",
    sentence: "The building was completely destroyed in the fire.",
    redundantPart: { text: "completely", startIndex: 17 },
    reason: "'Destroyed' is absolute; something cannot be partially destroyed.",
  },
  {
    id: "7",
    sentence: "She made a new innovation in the field.",
    redundantPart: { text: "new", startIndex: 12 },
    reason: "Innovations are inherently new. Simply say 'innovation'.",
  },
  {
    id: "8",
    sentence: "The end result was better than expected.",
    redundantPart: { text: "end", startIndex: 4 },
    reason: "A result is already the end. Just use 'result'.",
  },
  {
    id: "9",
    sentence: "They gathered together to discuss the issue.",
    redundantPart: { text: "together", startIndex: 16 },
    reason: "'Gather' already implies coming together. Just use 'gathered'.",
  },
  {
    id: "10",
    sentence: "The reason why he left is still unknown.",
    redundantPart: { text: "why", startIndex: 11 },
    reason: "'Reason' already implies 'why'. Simply say 'The reason he left'.",
  },
  {
    id: "11",
    sentence: "We need to merge together these two departments.",
    redundantPart: { text: "together", startIndex: 16 },
    reason: "'Merge' inherently means bringing things together.",
  },
  {
    id: "12",
    sentence: "She gave her personal opinion on the matter.",
    redundantPart: { text: "personal", startIndex: 14 },
    reason: "Opinions are inherently personal. Just say 'opinion'.",
  },
  {
    id: "13",
    sentence: "The meeting is scheduled for 3 PM in the afternoon.",
    redundantPart: { text: "in the afternoon", startIndex: 34 },
    reason: "'PM' already indicates afternoon. Remove 'in the afternoon'.",
  },
  {
    id: "14",
    sentence: "This is a very unique opportunity for you.",
    redundantPart: { text: "very", startIndex: 10 },
    reason: "'Unique' is absolute and cannot be modified. Something is either unique or not.",
  },
  {
    id: "15",
    sentence: "We should collaborate together on this project.",
    redundantPart: { text: "together", startIndex: 22 },
    reason: "'Collaborate' already means working together.",
  },
  {
    id: "16",
    sentence: "The basic fundamentals of the subject are simple.",
    redundantPart: { text: "basic", startIndex: 4 },
    reason: "Fundamentals are basic by definition.",
  },
  {
    id: "17",
    sentence: "He made an unexpected surprise announcement.",
    redundantPart: { text: "unexpected", startIndex: 11 },
    reason: "Surprises are inherently unexpected.",
  },
  {
    id: "18",
    sentence: "The two twins look exactly alike.",
    redundantPart: { text: "two", startIndex: 4 },
    reason: "Twins are always two. Simply say 'twins'.",
  },
  {
    id: "19",
    sentence: "He returned back to his hometown.",
    redundantPart: { text: "back", startIndex: 12 },
    reason: "'Return' already means to go back.",
  },
  {
    id: "20",
    sentence: "She nodded her head in agreement.",
    redundantPart: { text: "her head", startIndex: 11 },
    reason: "Nodding can only be done with the head.",
  },
  {
    id: "21",
    sentence: "The ATM machine was out of order.",
    redundantPart: { text: "machine", startIndex: 8 },
    reason: "ATM stands for 'Automated Teller Machine'. Saying 'machine' is redundant.",
  },
  {
    id: "22",
    sentence: "Please RSVP as soon as possible.",
    redundantPart: { text: "as soon as possible", startIndex: 12 },
    reason: "RSVP already means 'respond please'. Adding urgency is redundant here since RSVP implies a response is needed.",
  },
  {
    id: "23",
    sentence: "Each and every student passed the exam.",
    redundantPart: { text: "and every", startIndex: 5 },
    reason: "'Each' and 'every' mean the same thing. Use one or the other.",
  },
  {
    id: "24",
    sentence: "The consensus of opinion was unanimous.",
    redundantPart: { text: "of opinion", startIndex: 14 },
    reason: "Consensus already refers to a general agreement of opinions.",
  },
  {
    id: "25",
    sentence: "It was his first and foremost priority.",
    redundantPart: { text: "and foremost", startIndex: 16 },
    reason: "'First' and 'foremost' mean the same thing in this context.",
  },
  {
    id: "26",
    sentence: "The PIN number was incorrect.",
    redundantPart: { text: "number", startIndex: 8 },
    reason: "PIN stands for 'Personal Identification Number'. Adding 'number' is redundant.",
  },
  {
    id: "27",
    sentence: "She made a brief summary of the report.",
    redundantPart: { text: "brief", startIndex: 12 },
    reason: "A summary is inherently brief.",
  },
  {
    id: "28",
    sentence: "The future plans include expansion.",
    redundantPart: { text: "future", startIndex: 4 },
    reason: "Plans are inherently about the future.",
  },
  {
    id: "29",
    sentence: "We need to reduce down our expenses.",
    redundantPart: { text: "down", startIndex: 18 },
    reason: "'Reduce' already implies a decrease.",
  },
  {
    id: "30",
    sentence: "The final outcome was positive.",
    redundantPart: { text: "final", startIndex: 4 },
    reason: "An outcome is already the final result.",
  },
];

export const getRandomBrevitySentences = (
  count: number,
  exclude: string[] = []
): BrevitySentence[] => {
  const available = brevityData.filter((s) => !exclude.includes(s.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
