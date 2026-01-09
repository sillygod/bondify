import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, Trophy, Lightbulb, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vocabularyData, Word } from "@/data/vocabulary";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useLayoutControl } from "@/hooks/useLayoutControl";

const TOTAL_QUESTIONS = 10;

const RecallGame = () => {
  const navigate = useNavigate();
  const { setHideHeader } = useLayoutControl();
  const [gameState, setGameState] = useState<"ready" | "playing" | "ended">("ready");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Word[]>([]);
  const [userInput, setUserInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

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
    setUserInput("");
    setShowHint(false);
    setIsCorrect(null);
    setScore(0);
    setCorrectAnswers(0);
    setGameState("playing");
  }, []);

  const currentWord = questions[currentQuestionIndex];

  const getHint = () => {
    if (!currentWord) return "";
    const word = currentWord.word;
    const revealed = Math.ceil(word.length / 3);
    return word.slice(0, revealed) + "_".repeat(word.length - revealed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || isCorrect !== null) return;

    const correct = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + (showHint ? 50 : 100));
      setCorrectAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
        setGameState("ended");
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setUserInput("");
        setShowHint(false);
        setIsCorrect(null);
      }
    }, 1500);
  };

  const handleSkip = () => {
    setIsCorrect(false);
    setTimeout(() => {
      if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
        setGameState("ended");
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setUserInput("");
        setShowHint(false);
        setIsCorrect(null);
      }
    }, 1500);
  };

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
          <h1 className="font-display font-bold text-2xl neon-text">Recall Challenge</h1>
          <p className="text-sm text-muted-foreground">Fill in the vocabulary</p>
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
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-neon-cyan to-primary mb-6 neon-glow-cyan"
            >
              <Brain className="w-16 h-16 text-primary-foreground" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold mb-4">Test Your Memory</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Read the definition and type the correct vocabulary word. Use hints if you need help!
            </p>
            <Button
              onClick={initGame}
              className="bg-gradient-to-r from-neon-cyan to-primary hover:opacity-90 text-primary-foreground font-display font-semibold px-8 py-6 rounded-xl text-lg"
            >
              Start Challenge
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
            {/* Progress */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
              </span>
              <Progress value={((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100} className="flex-1 h-2" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/20 border border-primary/30">
                <span className="font-display font-bold text-sm">{score}</span>
              </div>
            </div>

            {/* Definition Card */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "glass-card rounded-2xl p-6 relative overflow-hidden",
                isCorrect === true && "border-neon-green/50 shadow-[0_0_30px_hsl(150_100%_50%/0.3)]",
                isCorrect === false && "border-destructive/50 shadow-[0_0_30px_hsl(0_84%_60%/0.3)]"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30">
                  <Lightbulb className="w-6 h-6 text-neon-cyan" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Definition</p>
                  <p className="text-lg font-medium">{currentWord.meaning}</p>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Part of speech: {currentWord.partOfSpeech}
                  </p>
                </div>
              </div>

              {/* Result Overlay */}
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                >
                  <div className="text-center">
                    {isCorrect ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-neon-green/20">
                          <Check className="w-8 h-8 text-neon-green" />
                        </div>
                        <p className="font-display font-bold text-neon-green">Correct!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-destructive/20">
                          <X className="w-8 h-8 text-destructive" />
                        </div>
                        <p className="font-display font-bold text-destructive">The answer was:</p>
                        <p className="text-xl font-bold">{currentWord.word}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Hint */}
            {showHint && !isCorrect && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-center"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-orange/20 border border-neon-orange/30 font-mono text-lg">
                  {getHint()}
                </span>
              </motion.div>
            )}

            {/* Starting Letters Hint */}
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Starts with: </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/20 border border-primary/30 font-mono text-lg font-bold">
                {currentWord.word.slice(0, Math.min(3, Math.ceil(currentWord.word.length / 3)))}...
              </span>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the word..."
                disabled={isCorrect !== null}
                className="h-14 text-lg text-center font-medium rounded-xl bg-secondary/50 border-border/50 focus:border-primary/50"
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowHint(true)}
                  disabled={showHint || isCorrect !== null}
                  className="flex-1 rounded-xl"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Hint (-50 pts)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isCorrect !== null}
                  className="flex-1 rounded-xl"
                >
                  Skip
                </Button>
                <Button
                  type="submit"
                  disabled={!userInput.trim() || isCorrect !== null}
                  className="flex-1 bg-gradient-to-r from-neon-cyan to-primary hover:opacity-90 rounded-xl font-display"
                >
                  Submit
                </Button>
              </div>
            </form>
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
              className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-neon-cyan to-primary mb-6"
            >
              <Trophy className="w-16 h-16 text-primary-foreground" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold mb-2">Challenge Complete!</h2>
            <p className="text-muted-foreground mb-6">
              You recalled {correctAnswers} out of {TOTAL_QUESTIONS} words
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="px-6 py-4 rounded-xl bg-primary/20 border border-primary/30">
                <p className="text-2xl font-display font-bold text-primary">{score}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="px-6 py-4 rounded-xl bg-neon-green/20 border border-neon-green/30">
                <p className="text-2xl font-display font-bold text-neon-green">
                  {Math.round((correctAnswers / TOTAL_QUESTIONS) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
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
                className="bg-gradient-to-r from-neon-cyan to-primary hover:opacity-90 rounded-xl font-display"
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

export default RecallGame;
