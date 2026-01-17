import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Puzzle, ArrowLeft, Trophy, Check, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vocabularyData, Word } from "@/data/vocabulary";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useGameProgress } from "@/hooks/useGameProgress";

interface WordPart {
  type: "prefix" | "root" | "suffix";
  value: string;
  meaning: string;
}

interface Question {
  word: Word;
  parts: WordPart[];
  missingPartIndex: number;
  options: string[];
}

const TOTAL_QUESTIONS = 10;

const partMeanings: Record<string, string> = {
  // Prefixes
  "ubi-": "everywhere",
  "e-": "out, from",
  "re-": "again, back",
  "bene-": "good, well",
  "ambi-": "both, around",
  "per-": "through, thoroughly",
  // Roots
  "que": "where",
  "loqu": "speak",
  "sili": "leap, spring",
  "pragma": "deed, action",
  "gu": "drive, act",
  "sever": "strict, serious",
  "vol": "will, wish",
  "scrut": "search, examine",
  "greg": "flock, group",
  "ten": "hold",
  "luc": "light",
  "vor": "devour, eat",
  "dilig": "choose, value",
  // Suffixes
  "-ous": "full of, having",
  "-ent": "having quality of",
  "-tic": "relating to",
  "-ize": "to make, to cause",
  "-arious": "connected with",
  "-acious": "inclined to",
  "-id": "having quality of",
};

const getPartColor = (type: "prefix" | "root" | "suffix") => {
  switch (type) {
    case "prefix":
      return "from-neon-cyan to-neon-cyan/70";
    case "root":
      return "from-neon-pink to-neon-pink/70";
    case "suffix":
      return "from-neon-orange to-neon-orange/70";
  }
};

const getPartBorder = (type: "prefix" | "root" | "suffix") => {
  switch (type) {
    case "prefix":
      return "border-neon-cyan/50";
    case "root":
      return "border-neon-pink/50";
    case "suffix":
      return "border-neon-orange/50";
  }
};

const WordParts = () => {
  const navigate = useNavigate();
  const { setHideHeader } = useLayoutControl();
  const [gameState, setGameState] = useState<"ready" | "playing" | "ended">("ready");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Hide header/sidebar when playing
  useEffect(() => {
    setHideHeader(gameState === "playing");
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  const { resetProgress } = useGameProgress({
    gameState,
    score,
    wordsLearned: currentQuestionIndex,
  });

  const generateQuestions = useCallback((): Question[] => {
    const wordsWithParts = vocabularyData.filter(
      (w) => w.prefix || w.root || w.suffix
    );
    const shuffled = [...wordsWithParts].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, TOTAL_QUESTIONS);

    return selected.map((word) => {
      const parts: WordPart[] = [];
      if (word.prefix) {
        parts.push({
          type: "prefix",
          value: word.prefix,
          meaning: partMeanings[word.prefix] || "prefix meaning",
        });
      }
      if (word.root) {
        parts.push({
          type: "root",
          value: word.root,
          meaning: partMeanings[word.root] || "root meaning",
        });
      }
      if (word.suffix) {
        parts.push({
          type: "suffix",
          value: word.suffix,
          meaning: partMeanings[word.suffix] || "suffix meaning",
        });
      }

      const missingPartIndex = Math.floor(Math.random() * parts.length);
      const correctPart = parts[missingPartIndex].value;

      // Generate wrong options from other parts of the same type
      const sameTypeParts = Object.keys(partMeanings).filter((p) => {
        if (parts[missingPartIndex].type === "prefix") return p.endsWith("-") && !p.startsWith("-");
        if (parts[missingPartIndex].type === "suffix") return p.startsWith("-") && !p.endsWith("-");
        return !p.startsWith("-") && !p.endsWith("-");
      });

      const wrongOptions = sameTypeParts
        .filter((p) => p !== correctPart)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [...wrongOptions, correctPart].sort(() => Math.random() - 0.5);

      return {
        word,
        parts,
        missingPartIndex,
        options,
      };
    });
  }, []);

  const initGame = useCallback(() => {
    setQuestions(generateQuestions());
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    resetProgress();
    setGameState("playing");
  }, [generateQuestions, resetProgress]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correctPart = currentQuestion.parts[currentQuestion.missingPartIndex].value;
    const correct = answer === correctPart;

    setSelectedAnswer(answer);
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 100 + streak * 10);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
      setGameState("ended");
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

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
          <h1 className="font-display font-bold text-2xl neon-text">Word Parts</h1>
          <p className="text-sm text-muted-foreground">Master prefixes, roots & suffixes</p>
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
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-neon-pink to-neon-orange mb-6 neon-glow"
            >
              <Puzzle className="w-16 h-16 text-primary-foreground" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold mb-4">Word Etymology</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Break down words into their components. Learn how prefixes, roots, and suffixes combine to form meaning!
            </p>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
                <div className="w-3 h-3 rounded-full bg-neon-cyan" />
                <span className="text-sm">Prefix (before)</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-pink/10 border border-neon-pink/30">
                <div className="w-3 h-3 rounded-full bg-neon-pink" />
                <span className="text-sm">Root (core)</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-orange/10 border border-neon-orange/30">
                <div className="w-3 h-3 rounded-full bg-neon-orange" />
                <span className="text-sm">Suffix (after)</span>
              </div>
            </div>

            <Button
              onClick={initGame}
              className="bg-gradient-to-r from-neon-pink to-neon-orange hover:opacity-90 text-primary-foreground font-display font-semibold px-8 py-6 rounded-xl text-lg neon-glow"
            >
              Start Learning
            </Button>
          </motion.div>
        )}

        {gameState === "playing" && currentQuestion && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Stats Bar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-display font-bold">{score}</span>
              </div>
              {streak > 1 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 rounded-lg bg-neon-orange/20 border border-neon-orange/30 text-neon-orange text-sm font-semibold"
                >
                  🔥 {streak}
                </motion.span>
              )}
              <div className="flex-1 text-right text-sm text-muted-foreground">
                {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
              </div>
            </div>

            {/* Progress */}
            <Progress value={((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100} className="h-2" />

            {/* Word Display */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <p className="text-sm text-muted-foreground mb-3 text-center">Complete the word:</p>
              <h2 className="font-display text-3xl font-bold text-center mb-2 neon-text">
                {(() => {
                  const missingPart = currentQuestion.parts[currentQuestion.missingPartIndex].value;
                  const cleanMissing = missingPart.replace(/-/g, "");
                  return currentQuestion.word.word.replace(cleanMissing, "???");
                })()}
              </h2>
              <p className="text-sm text-muted-foreground text-center italic mb-6">
                "{currentQuestion.word.meaning}"
              </p>

              {/* Word Parts Visualization */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {currentQuestion.parts.map((part, index) => {
                  const isMissing = index === currentQuestion.missingPartIndex;
                  const showAnswer = selectedAnswer !== null && isMissing;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "relative px-5 py-3 rounded-xl border-2 transition-all duration-300",
                        isMissing && !showAnswer && "border-dashed border-muted-foreground/50 bg-secondary/30",
                        !isMissing && `bg-gradient-to-br ${getPartColor(part.type)} ${getPartBorder(part.type)}`,
                        showAnswer && isCorrect && "bg-gradient-to-br from-neon-green to-neon-green/70 border-neon-green/50",
                        showAnswer && !isCorrect && "bg-gradient-to-br from-destructive to-destructive/70 border-destructive/50"
                      )}
                    >
                      <span className={cn(
                        "font-display font-bold text-lg",
                        isMissing && !showAnswer && "text-muted-foreground",
                        !isMissing && "text-primary-foreground"
                      )}>
                        {isMissing ? (showAnswer ? selectedAnswer : "???") : part.value}
                      </span>
                      {!isMissing && (
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                          {part.meaning}
                        </span>
                      )}
                      {showAnswer && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2"
                        >
                          {isCorrect ? (
                            <div className="w-6 h-6 rounded-full bg-neon-green flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
                              <X className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Show correct answer if wrong */}
              {selectedAnswer && !isCorrect && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-8 text-sm text-muted-foreground"
                >
                  Correct answer:{" "}
                  <span className="text-neon-green font-semibold">
                    {currentQuestion.parts[currentQuestion.missingPartIndex].value}
                  </span>
                  {" "}({currentQuestion.parts[currentQuestion.missingPartIndex].meaning})
                </motion.p>
              )}
            </motion.div>

            {/* Part Type Indicator */}
            <div className="text-center">
              <span className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
                currentQuestion.parts[currentQuestion.missingPartIndex].type === "prefix" && "bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan",
                currentQuestion.parts[currentQuestion.missingPartIndex].type === "root" && "bg-neon-pink/20 border border-neon-pink/30 text-neon-pink",
                currentQuestion.parts[currentQuestion.missingPartIndex].type === "suffix" && "bg-neon-orange/20 border border-neon-orange/30 text-neon-orange"
              )}>
                Find the missing{" "}
                <strong>{currentQuestion.parts[currentQuestion.missingPartIndex].type}</strong>
              </span>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, i) => {
                const correctPart = currentQuestion.parts[currentQuestion.missingPartIndex].value;
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === correctPart;
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
                      "p-4 rounded-xl font-display font-medium text-center transition-all duration-300",
                      "border backdrop-blur-sm",
                      !showResult && "bg-secondary/50 border-border/50 hover:border-primary/50 hover:bg-primary/10",
                      showResult && isCorrectOption && "bg-neon-green/20 border-neon-green/50 text-neon-green",
                      showResult && isSelected && !isCorrectOption && "bg-destructive/20 border-destructive/50 text-destructive"
                    )}
                  >
                    <span className="text-lg">{option}</span>
                    {partMeanings[option] && (
                      <span className="block text-xs mt-1 opacity-70">
                        ({partMeanings[option]})
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Next Button */}
            {selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-6"
              >
                <Button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-neon-pink to-neon-orange hover:opacity-90 text-primary-foreground font-display font-semibold px-8 py-3 rounded-xl neon-glow"
                >
                  {currentQuestionIndex + 1 >= TOTAL_QUESTIONS ? "See Results" : "Next Question"}
                </Button>
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
              Great Job!
            </h2>
            <p className="text-muted-foreground mb-6">
              You scored {score} points learning word parts!
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center px-6 py-3 rounded-xl bg-secondary/50">
                <p className="text-2xl font-display font-bold text-primary">{TOTAL_QUESTIONS}</p>
                <p className="text-xs text-muted-foreground">Words Studied</p>
              </div>
              <div className="text-center px-6 py-3 rounded-xl bg-secondary/50">
                <p className="text-2xl font-display font-bold text-neon-green">{score}</p>
                <p className="text-xs text-muted-foreground">Total Score</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="rounded-xl"
              >
                Back Home
              </Button>
              <Button
                onClick={initGame}
                className="bg-gradient-to-r from-neon-pink to-neon-orange hover:opacity-90 text-primary-foreground font-display font-semibold rounded-xl"
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

export default WordParts;
