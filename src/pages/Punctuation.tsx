import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, Trophy, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PunctuationQuestion,
  punctuationData,
  punctuationTypes,
} from "@/data/punctuationData";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { usePunctuationGameQuestions, PunctuationAPIQuestion } from "@/hooks/useGameQuestions";

const TOTAL_QUESTIONS = 10;

const Punctuation = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<PunctuationQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isBlankAnswered, setIsBlankAnswered] = useState(false);
  const [isQuestionComplete, setIsQuestionComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  const { setHideHeader } = useLayoutControl();

  // TanStack Query hook
  const { refetch: fetchQuestions } = usePunctuationGameQuestions(TOTAL_QUESTIONS);

  const loadQuestions = useCallback(async (type?: string) => {
    setIsLoading(true);
    setUsingMockData(false);

    try {
      const result = await fetchQuestions();
      const apiQuestions = result.data;

      if (apiQuestions && apiQuestions.length > 0) {
        // Transform API questions to match frontend interface
        let transformed: PunctuationQuestion[] = apiQuestions.map((q: PunctuationAPIQuestion, index: number) => ({
          id: String(q.id ?? index),
          sentence: q.sentence,
          blanks: q.blanks,
          punctuationType: q.punctuationType,
          explanation: q.explanation,
        }));

        // Apply type filter if specified
        if (type) {
          transformed = transformed.filter((q) => q.punctuationType === type);
        }

        setQuestions(transformed.slice(0, TOTAL_QUESTIONS));
      } else {
        throw new Error("No questions available");
      }
    } catch (error) {
      console.warn("API unavailable, using mock data:", error);
      setUsingMockData(true);
      // Fallback to mock data
      let available = [...punctuationData];
      if (type) {
        available = available.filter((q) => q.punctuationType === type);
      }
      const shuffled = available.sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, TOTAL_QUESTIONS));
    }

    setCurrentIndex(0);
    setCurrentBlankIndex(0);
    setSelectedAnswers([]);
    setIsBlankAnswered(false);
    setIsQuestionComplete(false);
    setScore(0);
    setIsComplete(false);
    setIsLoading(false);
  }, [fetchQuestions]);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (!isComplete && questions.length > 0) {
      setHideHeader(true);
    } else {
      setHideHeader(false);
    }
    return () => setHideHeader(false);
  }, [isComplete, questions.length, setHideHeader]);

  const currentQuestion = questions[currentIndex];
  const totalBlanks = currentQuestion?.blanks.length || 1;
  const currentBlank = currentQuestion?.blanks[currentBlankIndex];
  const progress = ((currentIndex + (isQuestionComplete ? 1 : 0)) / TOTAL_QUESTIONS) * 100;

  const handleSelectOption = (index: number) => {
    if (isBlankAnswered) return;

    const newAnswers = [...selectedAnswers, index];
    setSelectedAnswers(newAnswers);
    setIsBlankAnswered(true);

    // Check if this was the last blank
    if (currentBlankIndex + 1 >= totalBlanks) {
      // Question complete - calculate if all answers were correct
      const allCorrect = newAnswers.every(
        (answer, i) => answer === currentQuestion.blanks[i].correctIndex
      );
      if (allCorrect) {
        setScore((prev) => prev + 1);
      }
      setIsQuestionComplete(true);
    }
  };

  const handleNextBlank = () => {
    setCurrentBlankIndex((prev) => prev + 1);
    setIsBlankAnswered(false);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setCurrentBlankIndex(0);
      setSelectedAnswers([]);
      setIsBlankAnswered(false);
      setIsQuestionComplete(false);
    }
  };

  const handleRestart = () => {
    loadQuestions(selectedType || undefined);
  };

  const handleTypeFilter = (type: string | null) => {
    setSelectedType(type);
    loadQuestions(type || undefined);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      apostrophe: "from-neon-purple to-primary",
      comma: "from-neon-cyan to-primary",
      hyphen: "from-neon-orange to-neon-pink",
      semicolon: "from-neon-green to-neon-cyan",
      colon: "from-neon-pink to-primary",
    };
    return colors[type] || "from-primary to-neon-cyan";
  };

  // Render sentence with blanks - show filled answers and current blank
  const renderSentence = () => {
    if (!currentQuestion) return null;

    const parts = currentQuestion.sentence.split("___");

    return (
      <p className="text-xl font-display leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <>
                {selectedAnswers[i] !== undefined ? (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-block px-2 py-0.5 mx-1 rounded font-mono ${isQuestionComplete
                      ? selectedAnswers[i] === currentQuestion.blanks[i].correctIndex
                        ? "bg-green-500/30 text-green-400 border border-green-500/50"
                        : "bg-destructive/30 text-destructive border border-destructive/50"
                      : "bg-primary/30 text-primary border border-primary/50"
                      }`}
                  >
                    {currentQuestion.blanks[i].options[selectedAnswers[i]]}
                  </motion.span>
                ) : i === currentBlankIndex ? (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-block w-16 mx-1 border-b-2 border-primary"
                  />
                ) : (
                  <span className="inline-block w-16 mx-1 border-b-2 border-border/50" />
                )}
              </>
            )}
          </span>
        ))}
      </p>
    );
  };

  if (questions.length === 0 || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading questions...
        </div>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex items-center justify-center"
      >
        <Card className="glass-card p-8 text-center max-w-md w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-orange to-neon-pink flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold mb-2">
            {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good Job!" : "Keep Practicing!"}
          </h2>
          <p className="text-muted-foreground mb-6">
            You scored {score} out of {TOTAL_QUESTIONS} ({percentage}%)
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button onClick={handleRestart} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {TOTAL_QUESTIONS}
          </span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/20 border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === null ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeFilter(null)}
        >
          All
        </Button>
        {punctuationTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeFilter(type.id)}
            className="gap-1"
          >
            <span className="font-mono text-lg">{type.icon}</span>
            {type.label}
          </Button>
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <Card className="glass-card p-6">
            {/* Punctuation Type Badge & Blank Indicator */}
            <div className="mb-4 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getTypeColor(currentQuestion.punctuationType)} text-white`}
              >
                {punctuationTypes.find((t) => t.id === currentQuestion.punctuationType)?.label}
              </span>
              {totalBlanks > 1 && !isQuestionComplete && (
                <span className="text-sm text-muted-foreground">
                  Blank {currentBlankIndex + 1} of {totalBlanks}
                </span>
              )}
            </div>

            {/* Sentence */}
            <div className="mb-8">{renderSentence()}</div>

            {/* Options for current blank */}
            {!isQuestionComplete && currentBlank && (
              <motion.div
                key={currentBlankIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-3"
              >
                {currentBlank.options.map((option, index) => {
                  const isCorrect = index === currentBlank.correctIndex;
                  const isSelected = selectedAnswers[currentBlankIndex] === index;
                  let optionClass = "glass-card border-2 border-border/30 hover:border-primary/50";

                  if (isBlankAnswered) {
                    if (isCorrect) {
                      optionClass = "bg-green-500/20 border-2 border-green-500";
                    } else if (isSelected && !isCorrect) {
                      optionClass = "bg-destructive/20 border-2 border-destructive";
                    } else {
                      optionClass = "opacity-50 border-2 border-border/30";
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      whileHover={!isBlankAnswered ? { scale: 1.02 } : {}}
                      whileTap={!isBlankAnswered ? { scale: 0.98 } : {}}
                      onClick={() => handleSelectOption(index)}
                      disabled={isBlankAnswered}
                      className={`p-4 rounded-xl text-left transition-all ${optionClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg">{option}</span>
                        {isBlankAnswered && isCorrect && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                        {isBlankAnswered && isSelected && !isCorrect && (
                          <X className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {/* Explanation - shown when question is complete */}
            <AnimatePresence>
              {isQuestionComplete && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/30"
                >
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Explanation: </span>
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Next Button */}
      {isBlankAnswered && !isQuestionComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button onClick={handleNextBlank} size="lg" className="gap-2">
            Next Blank
          </Button>
        </motion.div>
      )}

      {isQuestionComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button onClick={handleNextQuestion} size="lg" className="gap-2">
            {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Punctuation;
