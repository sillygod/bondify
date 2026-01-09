export interface Article {
  id: string;
  title: string;
  paragraphs: {
    text: string;
    question: {
      text: string;
      options: string[];
      correctIndex: number;
    };
  }[];
}

export const speedReadingArticles: Article[] = [
  {
    id: "1",
    title: "The Power of Sleep",
    paragraphs: [
      {
        text: "Sleep is one of the most important factors in maintaining good health, yet millions of people around the world do not get enough of it. During sleep, the body repairs tissues, consolidates memories, and releases hormones that regulate growth and appetite. Scientists have discovered that adults who consistently sleep fewer than seven hours per night face increased risks of heart disease, obesity, and depression. The brain uses sleep to clear out toxins that accumulate during waking hours, a process essential for cognitive function.",
        question: {
          text: "According to the passage, what happens to the brain during sleep?",
          options: [
            "It stops all activity to conserve energy",
            "It clears out toxins that accumulate during waking hours",
            "It creates new neurons for memory storage",
            "It increases hormone production for muscle growth"
          ],
          correctIndex: 1
        }
      },
      {
        text: "The quality of sleep matters as much as the quantity. Deep sleep, also known as slow-wave sleep, is particularly important for physical restoration. During this stage, blood pressure drops, breathing becomes slower, and blood flow increases to the muscles. REM sleep, which typically occurs about ninety minutes after falling asleep, is crucial for emotional regulation and learning. Dreams occur primarily during REM sleep, and disruption of this stage can lead to mood disturbances and difficulty concentrating.",
        question: {
          text: "What is a key characteristic of deep sleep mentioned in the passage?",
          options: [
            "Dreams occur most frequently during this stage",
            "It happens ninety minutes after falling asleep",
            "Blood flow increases to the muscles",
            "It is primarily important for emotional regulation"
          ],
          correctIndex: 2
        }
      },
      {
        text: "Improving sleep hygiene can dramatically enhance sleep quality. Experts recommend maintaining a consistent sleep schedule, even on weekends, to regulate the body's internal clock. The bedroom should be kept cool, dark, and quiet. Electronic devices should be avoided for at least an hour before bedtime because the blue light they emit suppresses melatonin production. Regular exercise promotes better sleep, but intense workouts should be avoided close to bedtime as they can be stimulating.",
        question: {
          text: "Why should electronic devices be avoided before bedtime?",
          options: [
            "They make the room too warm for quality sleep",
            "Their noise disrupts the sleep cycle",
            "Blue light suppresses melatonin production",
            "They cause intense mental stimulation"
          ],
          correctIndex: 2
        }
      }
    ]
  },
  {
    id: "2",
    title: "The Rise of Artificial Intelligence",
    paragraphs: [
      {
        text: "Artificial intelligence has transformed from a science fiction concept into an integral part of daily life. Machine learning algorithms now power everything from recommendation systems on streaming platforms to voice assistants on smartphones. These systems learn from vast amounts of data, identifying patterns that would be impossible for humans to detect. The technology continues to advance rapidly, with AI systems now capable of generating realistic images, writing coherent text, and even composing music.",
        question: {
          text: "How do machine learning algorithms work according to the passage?",
          options: [
            "They follow pre-programmed rules created by engineers",
            "They learn from vast amounts of data and identify patterns",
            "They copy human brain structures exactly",
            "They use quantum computing to process information"
          ],
          correctIndex: 1
        }
      },
      {
        text: "The impact of AI on the job market has sparked intense debate among economists and policymakers. While automation has historically created more jobs than it has eliminated, the speed and scope of AI adoption may differ from previous technological revolutions. Some experts predict that roles requiring repetitive tasks or simple decision-making will be most vulnerable. However, jobs requiring creativity, emotional intelligence, and complex problem-solving are likely to remain predominantly human domains for the foreseeable future.",
        question: {
          text: "Which types of jobs does the passage suggest are less vulnerable to AI automation?",
          options: [
            "Jobs requiring repetitive tasks",
            "Jobs involving simple decision-making",
            "Jobs requiring creativity and emotional intelligence",
            "Jobs in the technology sector"
          ],
          correctIndex: 2
        }
      },
      {
        text: "Ethical concerns surrounding AI development have become increasingly prominent. Issues of bias in training data can lead to discriminatory outcomes in areas like hiring, lending, and criminal justice. Privacy concerns arise as AI systems require massive amounts of personal data to function effectively. Questions about accountability when AI systems make mistakes remain largely unresolved. Many researchers advocate for the development of explainable AI, systems that can clearly articulate the reasoning behind their decisions, to address these transparency concerns.",
        question: {
          text: "What solution does the passage mention for addressing AI transparency concerns?",
          options: [
            "Using less personal data in training",
            "Developing explainable AI systems",
            "Implementing stricter government regulations",
            "Returning to traditional decision-making methods"
          ],
          correctIndex: 1
        }
      }
    ]
  },
  {
    id: "3",
    title: "Ocean Conservation",
    paragraphs: [
      {
        text: "The world's oceans face unprecedented threats from human activity. Overfishing has depleted fish populations to dangerous levels, with some species reduced by more than ninety percent from historical numbers. Plastic pollution has created massive garbage patches in every major ocean, with microplastics now found in the deepest ocean trenches and inside marine animals of all sizes. Rising ocean temperatures due to climate change are causing coral bleaching events that devastate reef ecosystems, home to a quarter of all marine species.",
        question: {
          text: "According to the passage, where have microplastics been found?",
          options: [
            "Only in coastal waters near cities",
            "Primarily in garbage patches",
            "In the deepest ocean trenches and inside marine animals",
            "Exclusively in warm tropical waters"
          ],
          correctIndex: 2
        }
      },
      {
        text: "Marine protected areas have emerged as a key strategy for ocean conservation. These designated zones restrict human activities such as fishing and drilling to allow ecosystems to recover. Studies have shown that well-managed marine reserves can increase fish populations not only within their boundaries but also in surrounding waters as marine life spreads outward. Currently, less than eight percent of the ocean is protected, far below the thirty percent target recommended by scientists for maintaining healthy ocean ecosystems.",
        question: {
          text: "What percentage of the ocean do scientists recommend protecting?",
          options: [
            "Less than eight percent",
            "Fifteen percent",
            "Thirty percent",
            "Fifty percent"
          ],
          correctIndex: 2
        }
      },
      {
        text: "Individual actions can contribute meaningfully to ocean health. Reducing single-use plastic consumption prevents waste from entering waterways. Choosing sustainably sourced seafood supports responsible fishing practices. Supporting organizations dedicated to ocean cleanup and advocacy amplifies conservation efforts. Perhaps most importantly, reducing carbon emissions through transportation choices, energy consumption, and diet helps address the fundamental threat of climate change that affects every aspect of ocean health.",
        question: {
          text: "What does the passage identify as the fundamental threat to ocean health?",
          options: [
            "Single-use plastic consumption",
            "Overfishing practices",
            "Climate change from carbon emissions",
            "Lack of marine protected areas"
          ],
          correctIndex: 2
        }
      }
    ]
  }
];

export const getRandomArticle = (): Article => {
  const index = Math.floor(Math.random() * speedReadingArticles.length);
  return speedReadingArticles[index];
};
