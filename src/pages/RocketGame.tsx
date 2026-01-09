import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Rocket, Star, ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vocabularyData, getRandomSynonyms, Word } from "@/data/vocabulary";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLayoutControl } from "@/hooks/useLayoutControl";

const TOTAL_QUESTIONS = 10;
const INITIAL_FUEL = 100;
const FUEL_LOSS = 25;
const FUEL_GAIN = 10;
const DESCENT_DURATION = 12; // seconds to fall (slower descent)
const BOOST_AMOUNT = 50; // how much the rocket boosts up (percentage of container)

const RocketGame = () => {
  const navigate = useNavigate();
  const { setHideHeader } = useLayoutControl();
  const [gameState, setGameState] = useState<"ready" | "playing" | "ended">("ready");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [fuel, setFuel] = useState(INITIAL_FUEL);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questions, setQuestions] = useState<Word[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [rocketY, setRocketY] = useState(0); // 0 = top, 100 = bottom
  const [isBoosting, setIsBoosting] = useState(false);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Hide header/sidebar when playing
  useEffect(() => {
    setHideHeader(gameState === "playing");
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  const initGame = useCallback(() => {
    const shuffled = [...vocabularyData].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, TOTAL_QUESTIONS);
    setQuestions(selected);
    setCurrentQuestionIndex(0);
    setFuel(INITIAL_FUEL);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setRocketY(0);
    setIsBoosting(false);
    setGameState("playing");
  }, []);

  // Continuous descent animation
  useEffect(() => {
    if (gameState !== "playing") return;

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      
      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // in seconds
      lastTimeRef.current = currentTime;

      if (!isBoosting) {
        setRocketY((prev) => {
          const newY = prev + (100 / DESCENT_DURATION) * deltaTime;
          if (newY >= 100) {
            // Rocket crashed
            setFuel(0);
            setGameState("ended");
            return 100;
          }
          return newY;
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [gameState, isBoosting]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentWord = questions[currentQuestionIndex];
      const correctSynonym = currentWord.synonyms[Math.floor(Math.random() * currentWord.synonyms.length)];
      const newOptions = getRandomSynonyms(correctSynonym, currentWord.synonyms, 4);
      setOptions(newOptions);
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    const currentWord = questions[currentQuestionIndex];
    const correct = currentWord.synonyms.includes(answer);
    
    setSelectedAnswer(answer);
    setIsCorrect(correct);

    if (correct) {
      setFuel((prev) => Math.min(prev + FUEL_GAIN, 100));
      setScore((prev) => prev + 100 + streak * 10);
      setStreak((prev) => prev + 1);
      
      // Boost rocket up
      setIsBoosting(true);
      setRocketY((prev) => Math.max(prev - BOOST_AMOUNT, 0));
      
      setTimeout(() => {
        setIsBoosting(false);
      }, 500);
    } else {
      setFuel((prev) => prev - FUEL_LOSS);
      setStreak(0);
    }

    setTimeout(() => {
      if (fuel - (correct ? 0 : FUEL_LOSS) <= 0) {
        setGameState("ended");
      } else if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
        setGameState("ended");
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    }, 1200);
  };

  const currentWord = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display font-bold text-2xl neon-text">Rocket Vocabulary</h1>
          <p className="text-sm text-muted-foreground">Keep the rocket flying!</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card rounded-3xl p-8 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-primary to-neon-pink mb-6 neon-glow"
            >
              <Rocket className="w-16 h-16 text-primary-foreground -rotate-45" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold mb-4">Ready for Launch?</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Choose the correct synonym to keep your rocket flying! Wrong answers will drain your fuel.
            </p>
            <Button
              onClick={initGame}
              className="bg-gradient-to-r from-primary to-neon-pink hover:opacity-90 text-primary-foreground font-display font-semibold px-8 py-6 rounded-xl text-lg neon-glow"
            >
              Launch Rocket
            </Button>
          </motion.div>
        )}

        {gameState === "playing" && currentWord && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Stats Bar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Fuel</span>
                  <span className="text-sm font-medium">{fuel}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      fuel > 50 ? "bg-neon-green" : fuel > 25 ? "bg-neon-orange" : "bg-destructive"
                    )}
                    animate={{ width: `${fuel}%` }}
                    transition={{ type: "spring", damping: 15 }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                <Star className="w-4 h-4 text-primary" />
                <span className="font-display font-bold">{score}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
              </span>
              <Progress value={((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100} className="flex-1 h-2" />
            </div>

            {/* Rocket Animation Area */}
            <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-b from-background/50 via-primary/5 to-background/80 border border-border/30">
              {/* Stars background */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/60 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 1 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Flying Rocket */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2"
                animate={{
                  top: `${rocketY}%`,
                  x: isBoosting ? [0, 0] : [0, 3, -3, 2, -2, 0],
                }}
                transition={{
                  top: { type: "spring", stiffness: 100, damping: 15 },
                  x: { duration: isBoosting ? 0 : 2, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <motion.div
                  className={cn(
                    "relative p-4 rounded-2xl transition-all duration-300",
                    isCorrect === true && "shadow-[0_0_60px_hsl(150_100%_50%/0.6)]",
                    isCorrect === false && "shadow-[0_0_60px_hsl(0_84%_60%/0.6)]",
                    isBoosting && "shadow-[0_0_80px_hsl(270_100%_65%/0.8)]"
                  )}
                  animate={{
                    scale: isBoosting ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Rocket Body */}
                  <div className="relative">
                    <Rocket
                      className={cn(
                        "w-16 h-16 transition-colors duration-300",
                        isCorrect === true && "text-neon-green",
                        isCorrect === false && "text-destructive",
                        isCorrect === null && "text-primary"
                      )}
                    />
                    
                    {/* Exhaust Flames - more dramatic */}
                    {fuel > 0 && (
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                        <motion.div
                          animate={{
                            scaleY: isBoosting ? [1.5, 2, 1.5] : [0.8, 1.2, 0.8],
                            opacity: isBoosting ? [0.9, 1, 0.9] : [0.6, 0.9, 0.6],
                          }}
                          transition={{
                            duration: isBoosting ? 0.15 : 0.2,
                            repeat: Infinity,
                          }}
                          className="flex flex-col items-center origin-top"
                        >
                          <div className={cn(
                            "w-6 rounded-full blur-sm",
                            isBoosting ? "h-16 bg-gradient-to-b from-neon-cyan via-primary to-neon-pink" : "h-10 bg-gradient-to-b from-neon-orange via-neon-pink to-transparent"
                          )} />
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.1, repeat: Infinity }}
                            className={cn(
                              "w-4 rounded-full blur-md -mt-4",
                              isBoosting ? "h-12 bg-neon-cyan/60" : "h-6 bg-neon-orange/50"
                            )}
                          />
                        </motion.div>
                        
                        {/* Particle effects when boosting */}
                        {isBoosting && (
                          <>
                            {[...Array(6)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-neon-cyan"
                                initial={{ y: 0, x: 0, opacity: 1 }}
                                animate={{
                                  y: [0, 30 + Math.random() * 20],
                                  x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50],
                                  opacity: [1, 0],
                                  scale: [1, 0.3],
                                }}
                                transition={{
                                  duration: 0.5,
                                  delay: i * 0.05,
                                  repeat: Infinity,
                                }}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Ground indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-destructive/50 to-transparent" />
              
              {/* Altitude indicator */}
              <div className="absolute right-2 top-2 bottom-2 w-1 bg-border/30 rounded-full">
                <motion.div
                  className="absolute top-0 w-full bg-primary rounded-full"
                  style={{ height: `${100 - rocketY}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">Find a synonym for:</p>
              <h2 className="font-display text-3xl font-bold neon-text mb-2">{currentWord.word}</h2>
              <p className="text-sm text-muted-foreground italic">"{currentWord.meaning}"</p>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {options.map((option, i) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = currentWord.synonyms.includes(option);
                const showResult = selectedAnswer !== null;

                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
                    whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer}
                    className={cn(
                      "p-4 rounded-xl font-medium text-left transition-all duration-300",
                      "border backdrop-blur-sm",
                      !showResult && "bg-secondary/50 border-border/50 hover:border-primary/50 hover:bg-primary/10",
                      showResult && isCorrectOption && "bg-neon-green/20 border-neon-green/50 text-neon-green",
                      showResult && isSelected && !isCorrectOption && "bg-destructive/20 border-destructive/50 text-destructive"
                    )}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {/* Streak indicator */}
            {streak > 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-orange/20 border border-neon-orange/30 text-neon-orange font-display font-semibold">
                  🔥 {streak} Streak!
                </span>
              </motion.div>
            )}
          </motion.div>
        )}

        {gameState === "ended" && (
          <motion.div
            key="ended"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card rounded-3xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2 }}
              className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-neon-orange to-neon-pink mb-6"
            >
              <Trophy className="w-16 h-16 text-primary-foreground" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold mb-2">
              {fuel > 0 ? "Mission Complete!" : "Out of Fuel!"}
            </h2>
            <p className="text-muted-foreground mb-6">
              You scored {score} points and answered {currentQuestionIndex + (fuel > 0 ? 1 : 0)} questions
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="px-6 py-4 rounded-xl bg-primary/20 border border-primary/30">
                <p className="text-2xl font-display font-bold text-primary">{score}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="px-6 py-4 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30">
                <p className="text-2xl font-display font-bold text-neon-cyan">
                  {Math.round((currentQuestionIndex / TOTAL_QUESTIONS) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Progress</p>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="rounded-xl"
              >
                Back Home
              </Button>
              <Button
                onClick={initGame}
                className="bg-gradient-to-r from-primary to-neon-pink hover:opacity-90 rounded-xl font-display"
              >
                Play Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RocketGame;
