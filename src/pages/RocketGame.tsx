import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Star, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useRocketQuestions, RocketQuestion } from "@/hooks/useGameQuestions";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useGameSRS } from "@/hooks/useGameSRS";
import { recordAnswer } from "@/lib/api/analytics";
import { Footer } from "@/components/layout/Footer";

// Fallback mock data for when API is unavailable
import { vocabularyData, getRandomSynonyms } from "@/data/vocabulary";

const TOTAL_QUESTIONS = 10;
const INITIAL_FUEL = 100;
const FUEL_LOSS = 25;
const FUEL_GAIN = 10;
const DESCENT_DURATION = 12;
const BOOST_AMOUNT = 50;

// =============================================================================
// Custom SVG Rocket Component
// =============================================================================
const RocketShip = ({
  isCorrect,
  isBoosting,
  fuel
}: {
  isCorrect: boolean | null;
  isBoosting: boolean;
  fuel: number;
}) => {
  const glowColor = isCorrect === true
    ? "hsl(150 100% 50%)"
    : isCorrect === false
      ? "hsl(0 84% 60%)"
      : "hsl(270 100% 65%)";

  return (
    <div className="relative scale-75 origin-center">
      {/* Rocket SVG */}
      <svg
        width="80"
        height="120"
        viewBox="0 0 80 120"
        className="drop-shadow-2xl"
        style={{
          filter: `drop-shadow(0 0 15px ${glowColor})`
        }}
      >
        {/* Rocket Body Gradient */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(270 100% 75%)" />
            <stop offset="50%" stopColor="hsl(270 100% 60%)" />
            <stop offset="100%" stopColor="hsl(280 100% 45%)" />
          </linearGradient>
          <linearGradient id="noseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(0 0% 95%)" />
            <stop offset="50%" stopColor="hsl(0 0% 80%)" />
            <stop offset="100%" stopColor="hsl(0 0% 65%)" />
          </linearGradient>
          <linearGradient id="finGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(320 100% 65%)" />
            <stop offset="100%" stopColor="hsl(320 100% 45%)" />
          </linearGradient>
          <radialGradient id="windowGradient" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="hsl(180 100% 80%)" />
            <stop offset="70%" stopColor="hsl(180 100% 50%)" />
            <stop offset="100%" stopColor="hsl(200 100% 40%)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left Fin */}
        <path
          d="M15 85 L25 70 L25 95 L15 105 Z"
          fill="url(#finGradient)"
          className="drop-shadow-lg"
        />

        {/* Right Fin */}
        <path
          d="M65 85 L55 70 L55 95 L65 105 Z"
          fill="url(#finGradient)"
          className="drop-shadow-lg"
        />

        {/* Main Body */}
        <ellipse
          cx="40"
          cy="65"
          rx="18"
          ry="35"
          fill="url(#bodyGradient)"
          stroke="hsl(270 50% 40%)"
          strokeWidth="1"
        />

        {/* Nose Cone */}
        <path
          d="M40 10 L55 45 L25 45 Z"
          fill="url(#noseGradient)"
          stroke="hsl(0 0% 60%)"
          strokeWidth="0.5"
        />

        {/* Window */}
        <circle
          cx="40"
          cy="55"
          r="8"
          fill="url(#windowGradient)"
          stroke="hsl(180 50% 30%)"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Window Shine */}
        <ellipse
          cx="37"
          cy="52"
          rx="3"
          ry="2"
          fill="hsla(0, 0%, 100%, 0.6)"
        />

        {/* Body Stripes */}
        <rect x="30" y="75" width="20" height="3" fill="hsl(270 50% 40%)" rx="1" />
        <rect x="30" y="82" width="20" height="3" fill="hsl(270 50% 40%)" rx="1" />

        {/* Thruster Base */}
        <ellipse
          cx="40"
          cy="98"
          rx="12"
          ry="4"
          fill="hsl(0 0% 40%)"
        />
      </svg>

      {/* Exhaust Flames */}
      {fuel > 0 && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
          {/* Core Flame */}
          <motion.div
            animate={{
              scaleY: isBoosting ? [1.5, 2.5, 1.5] : [0.8, 1.3, 0.8],
              opacity: isBoosting ? [0.9, 1, 0.9] : [0.7, 1, 0.7],
            }}
            transition={{
              duration: isBoosting ? 0.1 : 0.15,
              repeat: Infinity,
            }}
            className="origin-top"
          >
            <div
              className={cn(
                "rounded-full blur-[2px]",
                isBoosting
                  ? "w-8 h-20 bg-gradient-to-b from-white via-cyan-300 to-cyan-500"
                  : "w-6 h-14 bg-gradient-to-b from-yellow-200 via-orange-400 to-red-500"
              )}
            />
          </motion.div>

          {/* Outer Glow */}
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
            className={cn(
              "absolute top-0 rounded-full blur-lg",
              isBoosting
                ? "w-12 h-24 bg-cyan-400/50"
                : "w-8 h-16 bg-orange-400/40"
            )}
          />

          {/* Sparks when boosting */}
          {isBoosting && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-cyan-300"
                  initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                  animate={{
                    y: [0, 40 + Math.random() * 30],
                    x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60],
                    opacity: [1, 0],
                    scale: [1, 0.2],
                  }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.04,
                    repeat: Infinity,
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Space Background Component
// =============================================================================
const SpaceBackground = () => {
  const stars = useMemo(() =>
    [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: 1 + Math.random() * 2,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep Space Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/50 to-slate-950" />

      {/* Nebula Effects */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-pink-600/10 rounded-full blur-2xl" />

      {/* Distant Planet */}
      <div className="absolute top-8 right-8 w-16 h-16">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-300/30 via-orange-500/20 to-red-600/30 blur-[1px]" />
        {/* Planet Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-6 border border-orange-300/20 rounded-full -rotate-12" />
      </div>

      {/* Stars Layer */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Shooting Star (occasional) */}
      <motion.div
        className="absolute w-1 h-1 bg-white rounded-full"
        initial={{ top: "10%", left: "80%", opacity: 0 }}
        animate={{
          top: ["10%", "40%"],
          left: ["80%", "50%"],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 8,
        }}
      >
        <div className="absolute w-20 h-[2px] bg-gradient-to-r from-white to-transparent -left-20 top-0" />
      </motion.div>
    </div>
  );
};

// =============================================================================
// Circular Fuel Gauge Component
// =============================================================================
const FuelGauge = ({ fuel }: { fuel: number }) => {
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (fuel / 100) * circumference;

  const fuelColor = fuel > 50
    ? "hsl(150 100% 50%)"
    : fuel > 25
      ? "hsl(30 100% 55%)"
      : "hsl(0 84% 60%)";

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        {/* Background Circle */}
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="hsl(260 30% 20%)"
          strokeWidth="5"
        />
        {/* Fuel Level - with glow effect via stroke properties */}
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={fuelColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", damping: 15 }}
        />
        {/* Glow layer - slightly larger and blurred */}
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={fuelColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", damping: 15 }}
          opacity={0.3}
          style={{ filter: 'blur(3px)' }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-sm font-bold font-display"
          animate={{ color: fuelColor }}
        >
          {fuel}%
        </motion.span>
      </div>
    </div>
  );
};

// =============================================================================
// Main RocketGame Component
// =============================================================================
const RocketGame = () => {
  const navigate = useNavigate();
  const { setHideHeader } = useLayoutControl();

  // Game state
  const [gameState, setGameState] = useState<"ready" | "loading" | "playing" | "ended">("ready");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [fuel, setFuel] = useState(INITIAL_FUEL);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questions, setQuestions] = useState<RocketQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [rocketY, setRocketY] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // API state
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Refs
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Use shared progress tracking hook
  const { resetProgress } = useGameProgress({
    gameState,
    score,
    wordsLearned: currentQuestionIndex,
    xpMultiplier: 0.1, // score / 10 = XP
  });

  // TanStack Query hook for fetching questions
  const { refetch: fetchQuestions, isFetching: isLoadingQuestions } = useRocketQuestions(TOTAL_QUESTIONS);

  // Game-SRS integration
  const { missedWords, recordMissedWord, resetMissedWords } = useGameSRS();

  // Hide header/sidebar when playing
  useEffect(() => {
    setHideHeader(gameState === "playing");
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  // Load questions from API
  const loadQuestions = useCallback(async () => {
    setGameState("loading");
    setApiError(null);
    setUsingMockData(false);

    try {
      const result = await fetchQuestions();
      const apiQuestions = result.data;

      if (apiQuestions && apiQuestions.length > 0) {
        setQuestions(apiQuestions);
        return true;
      } else {
        // No questions in API, use fallback
        throw new Error("No questions available");
      }
    } catch (error) {
      console.warn("API unavailable, using mock data:", error);
      setUsingMockData(true);

      // Fallback to mock data
      const shuffled = [...vocabularyData].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, TOTAL_QUESTIONS);
      const mockQuestions: RocketQuestion[] = selected.map((word, index) => {
        const correctSynonym = word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
        return {
          id: index,
          word: word.word,
          meaning: word.meaning,
          correctSynonym,
          options: getRandomSynonyms(correctSynonym, word.synonyms, 4),
        };
      });
      setQuestions(mockQuestions);
      return true;
    }
  }, [fetchQuestions]);

  const initGame = useCallback(async () => {
    const loaded = await loadQuestions();
    if (loaded) {
      setCurrentQuestionIndex(0);
      setFuel(INITIAL_FUEL);
      setScore(0);
      setStreak(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setRocketY(0);
      setIsBoosting(false);
      resetProgress(); // Reset progress tracking for new game
      resetMissedWords(); // Reset missed words for new game
      setGameState("playing");
    }
  }, [loadQuestions, resetProgress, resetMissedWords]);

  // Continuous descent animation
  useEffect(() => {
    if (gameState !== "playing") return;

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (!isBoosting) {
        setRocketY((prev) => {
          const newY = prev + (100 / DESCENT_DURATION) * deltaTime;
          if (newY >= 100) {
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

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correct = answer === currentQuestion.correctSynonym;

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

      // Record missed word for SRS
      recordMissedWord(currentQuestion.word, currentQuestion.meaning);

      // Screen shake on wrong answer
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 300);
    }

    // Record answer for weakness analysis
    recordAnswer({
      word: currentQuestion.word,
      gameType: "rocket",
      isCorrect: correct,
      partOfSpeech: "noun", // Default, ideally from API
      questionType: "synonym",
      userAnswer: answer,
      correctAnswer: currentQuestion.correctSynonym,
    }).catch(console.error);

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

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      animate={screenShake ? { x: [0, -5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
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
        {/* Ready State */}
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
              <RocketShip isCorrect={null} isBoosting={false} fuel={100} />
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

        {/* Loading State */}
        {gameState === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-3xl p-8 text-center"
          >
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <h2 className="font-display text-xl font-bold mb-2">Loading Questions...</h2>
            <p className="text-muted-foreground">Preparing your mission</p>
          </motion.div>
        )}

        {/* Playing State */}
        {gameState === "playing" && currentQuestion && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Stats Bar */}
            <div className="flex items-center justify-between gap-4">
              <FuelGauge fuel={fuel} />

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
                </span>
                <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-neon-pink rounded-full"
                    animate={{ width: `${((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-primary/20 border border-primary/30">
                <Star className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-lg">{score}</span>
              </div>
            </div>

            {/* Mock data indicator */}
            {usingMockData && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>Using practice mode (API unavailable)</span>
              </div>
            )}

            {/* Rocket Animation Area */}
            <div className="relative h-48 rounded-2xl overflow-hidden border border-border/30">
              <SpaceBackground />

              {/* Flying Rocket */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2"
                animate={{
                  top: `${Math.min(rocketY, 80)}%`,
                  x: isBoosting ? [0, 0] : [0, 3, -3, 2, -2, 0],
                }}
                transition={{
                  top: { type: "spring", stiffness: 100, damping: 15 },
                  x: { duration: isBoosting ? 0 : 2, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <motion.div
                  animate={{
                    scale: isBoosting ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <RocketShip isCorrect={isCorrect} isBoosting={isBoosting} fuel={fuel} />
                </motion.div>
              </motion.div>

              {/* Ground indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-destructive/60 via-destructive/30 to-transparent" />

              {/* Altitude indicator */}
              <div className="absolute right-3 top-3 bottom-3 w-1.5 bg-border/30 rounded-full">
                <motion.div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-neon-cyan rounded-full"
                  animate={{ height: `${100 - rocketY}%` }}
                  style={{
                    boxShadow: "0 0 10px hsl(270 100% 65% / 0.5)"
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-4 text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">Find a synonym for:</p>
              <h2 className="font-display text-3xl font-bold neon-text mb-2">{currentQuestion.word}</h2>
              <p className="text-sm text-muted-foreground italic">"{currentQuestion.meaning}"</p>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.correctSynonym;
                const showResult = selectedAnswer !== null;

                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={!selectedAnswer ? { scale: 1.02, boxShadow: "0 0 20px hsl(270 100% 65% / 0.3)" } : {}}
                    whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer}
                    className={cn(
                      "p-3 rounded-xl font-medium text-left transition-all duration-300",
                      "border-2 backdrop-blur-sm",
                      !showResult && "bg-secondary/50 border-border/50 hover:border-primary/50 hover:bg-primary/10",
                      showResult && isCorrectOption && "bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_20px_hsl(150_100%_50%/0.3)]",
                      showResult && isSelected && !isCorrectOption && "bg-destructive/20 border-destructive text-destructive shadow-[0_0_20px_hsl(0_84%_60%/0.3)]"
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

        {/* Ended State */}
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

            {usingMockData && (
              <p className="text-sm text-muted-foreground mb-4">
                (Practice mode - questions from local data)
              </p>
            )}

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

            {/* Missed Words - Added to SRS */}
            {missedWords.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border/50 text-left">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="text-primary">📝</span>
                  Words added to SRS ({missedWords.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {missedWords.map((m) => (
                    <span
                      key={m.word}
                      className="px-3 py-1 text-sm rounded-lg bg-primary/20 border border-primary/30"
                    >
                      {m.word}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                className="bg-gradient-to-r from-primary to-neon-pink hover:opacity-90 rounded-xl font-display gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Play Again
              </Button>
              {missedWords.length > 0 && (
                <Button
                  onClick={() => navigate("/srs-review")}
                  variant="outline"
                  className="rounded-xl border-primary/50 text-primary hover:bg-primary/10"
                >
                  Review Now
                </Button>
              )}
            </div>

            {/* Buy me a coffee - show when score is good */}
            {score >= 500 && <Footer minimal className="mt-6" />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RocketGame;
