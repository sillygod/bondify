export interface ContextQuestion {
  id: string;
  sentence: string; // Use _____ for the blank
  correctWord: string;
  options: string[];
  explanation: string;
}

export const contextQuestions: ContextQuestion[] = [
  {
    id: "1",
    sentence: "The new coffee shop became _____ in our neighborhood; you could find one on almost every corner.",
    correctWord: "ubiquitous",
    options: ["ubiquitous", "ephemeral", "meticulous", "benevolent"],
    explanation: "Ubiquitous means 'present everywhere,' which fits the context of finding coffee shops on every corner.",
  },
  {
    id: "2",
    sentence: "The beauty of the sunset was _____; within minutes, the colors had faded completely.",
    correctWord: "ephemeral",
    options: ["resilient", "ephemeral", "tenacious", "lucid"],
    explanation: "Ephemeral means 'lasting for a very short time,' which describes how quickly the sunset faded.",
  },
  {
    id: "3",
    sentence: "The lawyer's _____ argument convinced the jury to change their verdict.",
    correctWord: "eloquent",
    options: ["ambiguous", "diligent", "eloquent", "voracious"],
    explanation: "Eloquent means 'fluent or persuasive in speaking,' which fits the context of a convincing argument.",
  },
  {
    id: "4",
    sentence: "Despite losing her job and facing financial difficulties, she remained _____ and quickly found new opportunities.",
    correctWord: "resilient",
    options: ["gregarious", "resilient", "pragmatic", "meticulous"],
    explanation: "Resilient means 'able to recover quickly from difficulties,' which describes her ability to bounce back.",
  },
  {
    id: "5",
    sentence: "The _____ scientist double-checked every calculation before publishing the research.",
    correctWord: "meticulous",
    options: ["meticulous", "voracious", "benevolent", "lucid"],
    explanation: "Meticulous means 'showing great attention to detail,' which fits the context of double-checking calculations.",
  },
  {
    id: "6",
    sentence: "We need a _____ approach to this problem; let's focus on what will actually work, not idealistic solutions.",
    correctWord: "pragmatic",
    options: ["eloquent", "pragmatic", "ephemeral", "gregarious"],
    explanation: "Pragmatic means 'dealing with things sensibly and realistically,' which matches the focus on practical solutions.",
  },
  {
    id: "7",
    sentence: "The instructions were _____, leaving the workers confused about what to do next.",
    correctWord: "ambiguous",
    options: ["lucid", "tenacious", "ambiguous", "diligent"],
    explanation: "Ambiguous means 'open to more than one interpretation; unclear,' which explains the workers' confusion.",
  },
  {
    id: "8",
    sentence: "Even when the project seemed impossible, she continued to _____ and eventually succeeded.",
    correctWord: "persevere",
    options: ["scrutinize", "persevere", "ubiquitous", "resilient"],
    explanation: "Persevere means 'continue in a course of action despite difficulty,' which describes her determination.",
  },
  {
    id: "9",
    sentence: "The _____ billionaire donated half his fortune to build schools in rural areas.",
    correctWord: "benevolent",
    options: ["tenacious", "voracious", "benevolent", "meticulous"],
    explanation: "Benevolent means 'well meaning and kindly,' which fits the context of generous charitable donations.",
  },
  {
    id: "10",
    sentence: "The editor will _____ every sentence of the manuscript before it goes to print.",
    correctWord: "scrutinize",
    options: ["persevere", "scrutinize", "eloquent", "pragmatic"],
    explanation: "Scrutinize means 'examine or inspect closely and thoroughly,' which describes careful editing.",
  },
  {
    id: "11",
    sentence: "Her _____ personality made her popular at parties; she loved meeting new people.",
    correctWord: "gregarious",
    options: ["gregarious", "ambiguous", "ephemeral", "diligent"],
    explanation: "Gregarious means 'fond of company; sociable,' which fits the context of being popular and social.",
  },
  {
    id: "12",
    sentence: "The _____ detective refused to give up on the cold case, even after twenty years.",
    correctWord: "tenacious",
    options: ["lucid", "benevolent", "tenacious", "ubiquitous"],
    explanation: "Tenacious means 'holding firmly to something; persistent,' which describes the detective's determination.",
  },
  {
    id: "13",
    sentence: "The professor's _____ explanation helped even the most confused students understand the concept.",
    correctWord: "lucid",
    options: ["ambiguous", "lucid", "resilient", "voracious"],
    explanation: "Lucid means 'expressed clearly; easy to understand,' which fits the context of a helpful explanation.",
  },
  {
    id: "14",
    sentence: "He was a _____ reader, finishing three or four books every week.",
    correctWord: "voracious",
    options: ["meticulous", "pragmatic", "voracious", "eloquent"],
    explanation: "Voracious means 'wanting or devouring great quantities,' which describes his extensive reading habits.",
  },
  {
    id: "15",
    sentence: "The _____ student always submitted assignments early and never missed a deadline.",
    correctWord: "diligent",
    options: ["gregarious", "ephemeral", "diligent", "scrutinize"],
    explanation: "Diligent means 'having or showing care and effort in work,' which describes the reliable student.",
  },
];
