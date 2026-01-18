import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowLeft,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  BookOpen,
  Timer,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getRandomArticle, Article } from "@/data/speedReadingData";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useSpeedReadingArticle, SpeedReadingArticle } from "@/hooks/useGameQuestions";

type GameState = "ready" | "countdown" | "playing" | "paused" | "question" | "result" | "ended";

const SpeedReading = () => {
  const navigate = useNavigate();
  const { setHideHeader } = useLayoutControl();
  const [gameState, setGameState] = useState<GameState>("ready");
  const [wpm, setWpm] = useState(400);
  const [article, setArticle] = useState<Article | SpeedReadingArticle | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const msPerWord = Math.round(60000 / wpm);

  // Hide header/sidebar when playing (countdown, playing, paused, question, result)
  useEffect(() => {
    const isPlaying = gameState !== "ready" && gameState !== "ended";
    setHideHeader(isPlaying);
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  const { resetProgress } = useGameProgress({
    gameState,
    score,
    wordsLearned: correctAnswers,
  });

  // Countdown effect
  useEffect(() => {
    if (gameState !== "countdown") {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setGameState("playing");
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [gameState]);

  const { refetch: fetchApiArticle } = useSpeedReadingArticle();

  const startGame = useCallback(async () => {
    // Try API first, fallback to mock data
    let newArticle: Article | SpeedReadingArticle | null = null;

    try {
      const result = await fetchApiArticle();
      if (result.data) {
        newArticle = result.data;
      }
    } catch {
      // API failed, will use mock
    }

    // Fallback to mock data
    if (!newArticle) {
      newArticle = getRandomArticle();
    }

    setArticle(newArticle);
    setCurrentRound(0);
    setScore(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    resetProgress();

    // Split first paragraph into words
    const paragraphWords = newArticle.paragraphs[0].text.split(/\s+/);
    setWords(paragraphWords);
    setCurrentWordIndex(0);
    setGameState("countdown");
  }, [resetProgress, fetchApiArticle]);

  const startRound = useCallback((roundIndex: number) => {
    if (!article) return;

    const paragraphWords = article.paragraphs[roundIndex].text.split(/\s+/);
    setWords(paragraphWords);
    setCurrentWordIndex(0);
    setSelectedAnswer(null);
    setGameState("countdown");
  }, [article]);

  // Word animation effect
  useEffect(() => {
    if (gameState !== "playing") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentWordIndex((prev) => {
        if (prev >= words.length - 1) {
          // Paragraph finished, show question
          setGameState("question");
          return prev;
        }
        return prev + 1;
      });
    }, msPerWord);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState, msPerWord, words.length]);

  const handlePause = () => {
    setGameState("paused");
  };

  const handleResume = () => {
    setGameState("playing");
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setGameState("countdown");
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !article) return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === article.paragraphs[currentRound].question.correctIndex;

    if (isCorrect) {
      setScore((prev) => prev + 100);
      setCorrectAnswers((prev) => prev + 1);
    }

    setGameState("result");
  };

  const handleNextRound = () => {
    if (!article) return;

    if (currentRound + 1 >= article.paragraphs.length) {
      setGameState("ended");
    } else {
      setCurrentRound((prev) => prev + 1);
      startRound(currentRound + 1);
    }
  };

  const currentWord = words[currentWordIndex] || "";
  const progress = words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0;

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
          <h1 className="font-display font-bold text-2xl neon-text">Speed Reading</h1>
          <p className="text-sm text-muted-foreground">Enhance your reading speed</p>
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
              className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-neon-cyan to-primary mb-6 neon-glow"
            >
              <Zap className="w-16 h-16 text-primary-foreground" />
            </motion.div>

            <h2 className="font-display text-2xl font-bold mb-4">Speed Reading Challenge</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Read words at high speed and test your comprehension. Adjust the speed to match your skill level.
            </p>

            {/* WPM Slider */}
            <div className="mb-8 px-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Words Per Minute</span>
                <span className="font-display font-bold text-xl text-primary">{wpm} WPM</span>
              </div>
              <Slider
                value={[wpm]}
                onValueChange={(value) => setWpm(value[0])}
                min={100}
                max={800}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Beginner</span>
                <span>Advanced</span>
                <span>Expert</span>
              </div>
            </div>

            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-neon-cyan to-primary hover:opacity-90 text-primary-foreground font-display font-semibold px-8 py-6 rounded-xl text-lg neon-glow"
            >
              Start Reading
            </Button>
          </motion.div>
        )}

        {/* Countdown State */}
        {gameState === "countdown" && article && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Stats Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                <Timer className="w-4 h-4 text-primary" />
                <span className="font-display font-bold">{wpm} WPM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Round {currentRound + 1} of {article.paragraphs.length}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-green/20 border border-neon-green/30">
                <Trophy className="w-4 h-4 text-neon-green" />
                <span className="font-display font-bold text-neon-green">{score}</span>
              </div>
            </div>

            {/* Countdown Display */}
            <div className="glass-card rounded-3xl p-12 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-primary/5" />

              <p className="text-muted-foreground mb-4">Get ready...</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={countdown}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <span className="font-display text-8xl font-bold neon-text">
                    {countdown}
                  </span>
                </motion.div>
              </AnimatePresence>

              <motion.div
                className="w-24 h-1 bg-primary/30 rounded-full mt-8 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-neon-cyan to-primary"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  key={`progress-${currentRound}-${gameState}`}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Playing/Paused State */}
        {(gameState === "playing" || gameState === "paused") && article && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Stats Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                <Timer className="w-4 h-4 text-primary" />
                <span className="font-display font-bold">{wpm} WPM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Round {currentRound + 1} of {article.paragraphs.length}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-green/20 border border-neon-green/30">
                <Trophy className="w-4 h-4 text-neon-green" />
                <span className="font-display font-bold text-neon-green">{score}</span>
              </div>
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-2" />

            {/* Word Display */}
            <div className="glass-card rounded-3xl p-12 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-primary/5" />

              {gameState === "paused" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10"
                >
                  <div className="text-center">
                    <Pause className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Paused</p>
                    <Button onClick={handleResume} className="gap-2">
                      <Play className="w-4 h-4" />
                      Resume
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Current Word */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWordIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.05 }}
                  className="relative z-0"
                >
                  <span className="font-display text-5xl md:text-6xl font-bold neon-text">
                    {currentWord}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Word counter */}
              <div className="absolute bottom-4 text-sm text-muted-foreground">
                {currentWordIndex + 1} / {words.length} words
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleRestart}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restart
              </Button>
              <Button
                onClick={gameState === "paused" ? handleResume : handlePause}
                className="gap-2 bg-gradient-to-r from-neon-cyan to-primary"
              >
                {gameState === "paused" ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Question State */}
        {(gameState === "question" || gameState === "result") && article && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Stats Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-display font-bold">Round {currentRound + 1}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-green/20 border border-neon-green/30">
                <Trophy className="w-4 h-4 text-neon-green" />
                <span className="font-display font-bold text-neon-green">{score}</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="glass-card rounded-3xl p-8">
              <h3 className="font-display text-xl font-bold mb-6 text-center">
                Comprehension Check
              </h3>
              <p className="text-lg text-center mb-8">
                {article.paragraphs[currentRound].question.text}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {article.paragraphs[currentRound].question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === article.paragraphs[currentRound].question.correctIndex;
                  const showResult = gameState === "result";

                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswer(index)}
                      disabled={gameState === "result"}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all duration-300",
                        "border backdrop-blur-sm flex items-center gap-3",
                        !showResult && "bg-secondary/50 border-border/50 hover:border-primary/50 hover:bg-primary/10",
                        showResult && isCorrect && "bg-neon-green/20 border-neon-green/50",
                        showResult && isSelected && !isCorrect && "bg-destructive/20 border-destructive/50"
                      )}
                    >
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border",
                        !showResult && "border-border/50 bg-secondary/50",
                        showResult && isCorrect && "border-neon-green/50 bg-neon-green/20 text-neon-green",
                        showResult && isSelected && !isCorrect && "border-destructive/50 bg-destructive/20 text-destructive"
                      )}>
                        {showResult && isCorrect ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : showResult && isSelected && !isCorrect ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </span>
                      <span className={cn(
                        showResult && isCorrect && "text-neon-green",
                        showResult && isSelected && !isCorrect && "text-destructive"
                      )}>
                        {option}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Next Round Button */}
              {gameState === "result" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center"
                >
                  <Button
                    onClick={handleNextRound}
                    className="gap-2 bg-gradient-to-r from-neon-cyan to-primary"
                  >
                    {currentRound + 1 >= article.paragraphs.length ? (
                      "See Results"
                    ) : (
                      <>
                        Next Round
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Ended State */}
        {gameState === "ended" && article && (
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
              className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-neon-cyan to-primary mb-6"
            >
              <Trophy className="w-16 h-16 text-primary-foreground" />
            </motion.div>

            <h2 className="font-display text-3xl font-bold mb-2">
              {correctAnswers === 3 ? "Perfect!" : correctAnswers >= 2 ? "Great Job!" : "Keep Practicing!"}
            </h2>
            <p className="text-muted-foreground mb-6">
              You finished "{article.title}"
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-primary/20 border border-primary/30">
                <div className="text-2xl font-display font-bold text-primary">{wpm}</div>
                <div className="text-xs text-muted-foreground">WPM</div>
              </div>
              <div className="p-4 rounded-xl bg-neon-green/20 border border-neon-green/30">
                <div className="text-2xl font-display font-bold text-neon-green">{correctAnswers}/3</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="p-4 rounded-xl bg-neon-orange/20 border border-neon-orange/30">
                <div className="text-2xl font-display font-bold text-neon-orange">{score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Games
              </Button>
              <Button
                onClick={startGame}
                className="gap-2 bg-gradient-to-r from-neon-cyan to-primary"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpeedReading;
