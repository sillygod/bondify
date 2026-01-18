import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookText, ArrowLeft, Trophy, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { contextQuestions, ContextQuestion } from "@/data/contextData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useContextQuestions as useApiContextQuestions, ContextQuestion as ApiContextQuestion } from "@/hooks/useGameQuestions";

const TOTAL_QUESTIONS = 10;

const ContextGame = () => {
  const navigate = useNavigate();
  const { setHideHeader } = useLayoutControl();
  const [gameState, setGameState] = useState<"ready" | "playing" | "ended">("ready");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<ContextQuestion[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Hide header/sidebar when playing
  useEffect(() => {
    setHideHeader(gameState === "playing");
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  const { resetProgress } = useGameProgress({
    gameState,
    score,
    wordsLearned: correctAnswers,
  });

  const { refetch: fetchApiQuestions } = useApiContextQuestions(TOTAL_QUESTIONS);

  // Convert API question to local format
  const convertApiQuestion = (apiQ: ApiContextQuestion): ContextQuestion => ({
    id: String(apiQ.id),
    sentence: apiQ.sentence,
    correctWord: apiQ.correctWord,
    options: apiQ.options,
    explanation: apiQ.explanation,
  });

  const initGame = useCallback(async () => {
    let gameQuestions: ContextQuestion[] = [];

    // Try API first
    try {
      const result = await fetchApiQuestions();
      if (result.data && result.data.length > 0) {
        gameQuestions = result.data.map(convertApiQuestion);
      }
    } catch {
      // API failed, will use mock
    }

    // Fallback to mock data
    if (gameQuestions.length === 0) {
      const shuffled = [...contextQuestions].sort(() => Math.random() - 0.5);
      gameQuestions = shuffled.slice(0, TOTAL_QUESTIONS);
    }

    // Shuffle options for each question
    const withShuffledOptions = gameQuestions.map((q) => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5),
    }));

    setQuestions(withShuffledOptions);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setCorrectAnswers(0);
    resetProgress();
    setGameState("playing");
  }, [resetProgress, fetchApiQuestions]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (option: string) => {
    if (isCorrect !== null) return;

    setSelectedOption(option);
    const correct = option === currentQuestion.correctWord;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 100);
      setCorrectAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
        setGameState("ended");
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      }
    }, 2000);
  };

  const renderSentenceWithBlank = (sentence: string) => {
    const parts = sentence.split("_____");
    return (
      <p className="text-lg leading-relaxed">
        {parts[0]}
        <span className="inline-block min-w-[120px] mx-1 px-3 py-1 rounded-lg bg-primary/20 border-2 border-primary/50 border-dashed text-center font-bold">
          {isCorrect !== null ? currentQuestion.correctWord : "?"}
        </span>
        {parts[1]}
      </p>
    );
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
          <h1 className="font-display font-bold text-2xl neon-text">Context Match</h1>
          <p className="text-sm text-muted-foreground">Choose the word that fits</p>
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
              className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-neon-green to-primary mb-6 neon-glow"
            >
              <BookText className="w-16 h-16 text-primary-foreground" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold mb-4">Context Match</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Read the sentence and choose the vocabulary word that best fits the context and meaning.
            </p>
            <Button
              onClick={initGame}
              className="bg-gradient-to-r from-neon-green to-primary hover:opacity-90 text-primary-foreground font-display font-semibold px-8 py-6 rounded-xl text-lg"
            >
              Start Game
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

            {/* Sentence Card */}
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
                <div className="p-3 rounded-xl bg-neon-green/20 border border-neon-green/30">
                  <BookText className="w-6 h-6 text-neon-green" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Fill in the blank:</p>
                  {renderSentenceWithBlank(currentQuestion.sentence)}
                </div>
              </div>

              {/* Explanation on answer */}
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-border/50"
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <Check className="w-5 h-5 text-neon-green mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-destructive mt-0.5" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectOption(option)}
                  disabled={isCorrect !== null}
                  className={cn(
                    "p-4 rounded-xl text-center font-medium transition-all duration-200",
                    "bg-secondary/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10",
                    selectedOption === option && isCorrect === true && "bg-neon-green/20 border-neon-green/50 text-neon-green",
                    selectedOption === option && isCorrect === false && "bg-destructive/20 border-destructive/50 text-destructive",
                    isCorrect !== null && option === currentQuestion.correctWord && selectedOption !== option && "bg-neon-green/20 border-neon-green/50",
                    isCorrect !== null && "pointer-events-none"
                  )}
                >
                  {option}
                </motion.button>
              ))}
            </div>
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
              className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-neon-green to-primary mb-6"
            >
              <Trophy className="w-16 h-16 text-primary-foreground" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold mb-2">Game Complete!</h2>
            <p className="text-muted-foreground mb-6">
              You matched {correctAnswers} out of {TOTAL_QUESTIONS} words correctly
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
                className="bg-gradient-to-r from-neon-green to-primary hover:opacity-90 rounded-xl font-display"
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

export default ContextGame;
