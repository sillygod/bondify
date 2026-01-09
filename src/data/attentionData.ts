export interface RelatedBubble {
  id: string;
  text: string;
  parentId: string; // ID of the main bubble it belongs to
}

export interface MainBubble {
  id: string;
  text: string;
  color: "purple" | "cyan" | "orange";
}

export interface AttentionArticle {
  id: string;
  title: string;
  audioText: string; // Text to be read aloud (simulated with speech synthesis)
  mainBubbles: MainBubble[];
  relatedBubbles: RelatedBubble[];
}

export const attentionArticles: AttentionArticle[] = [
  {
    id: "1",
    title: "The Solar System",
    audioText:
      "Our solar system is a fascinating place with many celestial objects. The Sun is at the center, providing heat and light to all planets. Earth is the third planet from the Sun and has liquid water on its surface. Mars is known as the Red Planet due to its iron oxide surface. Jupiter is the largest planet with a Great Red Spot storm. Saturn has beautiful rings made of ice and rock. Neptune is the farthest planet and has the strongest winds. Asteroids orbit mainly between Mars and Jupiter in the asteroid belt.",
    mainBubbles: [
      { id: "inner", text: "Inner Planets", color: "cyan" },
      { id: "outer", text: "Outer Planets", color: "purple" },
      { id: "other", text: "Other Objects", color: "orange" },
    ],
    relatedBubbles: [
      { id: "earth", text: "Earth", parentId: "inner" },
      { id: "mars", text: "Mars", parentId: "inner" },
      { id: "jupiter", text: "Jupiter", parentId: "outer" },
      { id: "saturn", text: "Saturn", parentId: "outer" },
      { id: "neptune", text: "Neptune", parentId: "outer" },
      { id: "sun", text: "The Sun", parentId: "other" },
      { id: "asteroids", text: "Asteroids", parentId: "other" },
    ],
  },
  {
    id: "2",
    title: "Healthy Eating",
    audioText:
      "A balanced diet is essential for good health. Proteins like chicken, fish, and beans help build muscles. Carbohydrates from bread, rice, and pasta provide energy. Vitamins from fruits and vegetables boost immunity. Calcium from milk and cheese strengthens bones. Fiber from whole grains aids digestion. Healthy fats from nuts and olive oil support brain function. Water is crucial for hydration and all body functions.",
    mainBubbles: [
      { id: "building", text: "Body Building", color: "purple" },
      { id: "energy", text: "Energy Sources", color: "cyan" },
      { id: "health", text: "Health Boosters", color: "orange" },
    ],
    relatedBubbles: [
      { id: "proteins", text: "Proteins", parentId: "building" },
      { id: "calcium", text: "Calcium", parentId: "building" },
      { id: "carbs", text: "Carbohydrates", parentId: "energy" },
      { id: "fats", text: "Healthy Fats", parentId: "energy" },
      { id: "vitamins", text: "Vitamins", parentId: "health" },
      { id: "fiber", text: "Fiber", parentId: "health" },
      { id: "water", text: "Water", parentId: "health" },
    ],
  },
  {
    id: "3",
    title: "Types of Transportation",
    audioText:
      "Transportation has evolved significantly over time. Cars and motorcycles are common land vehicles for personal use. Buses and trains transport many passengers at once on roads and rails. Bicycles are eco-friendly and good for short distances. Airplanes fly through the sky for long-distance travel. Helicopters can hover and land in small spaces. Ships carry cargo across oceans. Submarines navigate underwater for exploration and military purposes.",
    mainBubbles: [
      { id: "land", text: "Land Transport", color: "cyan" },
      { id: "air", text: "Air Transport", color: "purple" },
      { id: "water", text: "Water Transport", color: "orange" },
    ],
    relatedBubbles: [
      { id: "cars", text: "Cars", parentId: "land" },
      { id: "trains", text: "Trains", parentId: "land" },
      { id: "bicycles", text: "Bicycles", parentId: "land" },
      { id: "airplanes", text: "Airplanes", parentId: "air" },
      { id: "helicopters", text: "Helicopters", parentId: "air" },
      { id: "ships", text: "Ships", parentId: "water" },
      { id: "submarines", text: "Submarines", parentId: "water" },
    ],
  },
  {
    id: "4",
    title: "World Geography",
    audioText:
      "Our world is divided into different geographical regions. North America includes countries like the United States and Canada. Europe is home to France, Germany, and the United Kingdom. Asia contains China, Japan, and India, making it the most populous continent. The Sahara Desert is located in Africa. The Amazon Rainforest spans across South America. Australia is both a country and a continent. Antarctica is the coldest continent with no permanent residents.",
    mainBubbles: [
      { id: "americas", text: "Americas", color: "purple" },
      { id: "eurasia", text: "Europe & Asia", color: "cyan" },
      { id: "others", text: "Other Regions", color: "orange" },
    ],
    relatedBubbles: [
      { id: "usa", text: "United States", parentId: "americas" },
      { id: "amazon", text: "Amazon Rainforest", parentId: "americas" },
      { id: "france", text: "France", parentId: "eurasia" },
      { id: "china", text: "China", parentId: "eurasia" },
      { id: "japan", text: "Japan", parentId: "eurasia" },
      { id: "sahara", text: "Sahara Desert", parentId: "others" },
      { id: "australia", text: "Australia", parentId: "others" },
      { id: "antarctica", text: "Antarctica", parentId: "others" },
    ],
  },
];

export const getRandomArticle = (): AttentionArticle => {
  const randomIndex = Math.floor(Math.random() * attentionArticles.length);
  return attentionArticles[randomIndex];
};

// Shuffle array utility
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
