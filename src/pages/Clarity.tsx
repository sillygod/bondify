import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, RotateCcw, Check, X, Lightbulb, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClaritySentence, clarityData } from "@/data/clarityData";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useNavigate } from "react-router-dom";
import { useClarityQuestions, ClarityQuestion } from "@/hooks/useGameQuestions";
import { Footer } from "@/components/layout/Footer";

type GameState = "ready" | "loading" | "playing" | "selectingAnswer" | "showingResult" | "ended";

const Clarity = () => {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [sentences, setSentences] = useState<ClaritySentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedPart, setSelectedPart] = useState<{ start: number; end: number } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrectPart, setIsCorrectPart] = useState<boolean | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);

  const currentSentence = sentences[currentIndex];
  const totalQuestions = 10;
  const { setHideHeader } = useLayoutControl();
  const navigate = useNavigate();
  const [usingMockData, setUsingMockData] = useState(false);

  // TanStack Query hook
  const { refetch: fetchQuestions } = useClarityQuestions(totalQuestions);

  useEffect(() => {
    if (gameState !== "ready" && gameState !== "ended") {
      setHideHeader(true);
    } else {
      setHideHeader(false);
    }
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  // Track progress for streak updates
  const { resetProgress } = useGameProgress({
    gameState,
    score: score * 100, // Convert to points
    wordsLearned: currentIndex,
  });

  const startGame = useCallback(async () => {
    setGameState("loading");
    setUsingMockData(false);

    try {
      const result = await fetchQuestions();
      const apiQuestions = result.data;

      if (apiQuestions && apiQuestions.length > 0) {
        // Transform API questions to match frontend interface
        const transformedSentences: ClaritySentence[] = apiQuestions.map((q: ClarityQuestion, index: number) => ({
          id: String(q.id ?? index),
          sentence: q.sentence,
          wordyPart: {
            startIndex: q.wordyPart.startIndex,
            endIndex: q.wordyPart.startIndex + q.wordyPart.text.length,
            text: q.wordyPart.text,
          },
          options: q.options,
          correctOption: q.correctOption,
          reason: q.reason,
        }));
        setSentences(transformedSentences);
      } else {
        throw new Error("No questions available");
      }
    } catch (error) {
      console.warn("API unavailable, using mock data:", error);
      setUsingMockData(true);
      // Fallback to mock data
      const shuffled = [...clarityData].sort(() => Math.random() - 0.5).slice(0, totalQuestions);
      setSentences(shuffled);
    }

    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedPart(null);
    setSelectedAnswer(null);
    setIsCorrectPart(null);
    setIsCorrectAnswer(null);
    resetProgress();
    setGameState("playing");
  }, [resetProgress, fetchQuestions]);

  const handlePartClick = (start: number, end: number) => {
    if (gameState !== "playing") return;

    setSelectedPart({ start, end });

    const wordy = currentSentence.wordyPart;
    const wordyStart = wordy.startIndex;
    const wordyEnd = wordy.startIndex + wordy.text.length;

    // Check if clicked word is within the wordy part
    const isCorrect = start >= wordyStart && end <= wordyEnd;
    setIsCorrectPart(isCorrect);

    if (isCorrect) {
      setGameState("selectingAnswer");
    } else {
      // Show correct part and move to answer selection
      setTimeout(() => {
        setGameState("selectingAnswer");
      }, 1000);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (gameState !== "selectingAnswer") return;

    setSelectedAnswer(answer);
    const isCorrect = answer === currentSentence.correctOption;
    setIsCorrectAnswer(isCorrect);

    if (isCorrect && isCorrectPart) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else if (isCorrect) {
      // Half point for getting answer right but not the part
      setScore(prev => prev + 0.5);
      setStreak(0);
    } else {
      setStreak(0);
    }

    setGameState("showingResult");
  };

  const nextQuestion = () => {
    if (currentIndex >= sentences.length - 1) {
      setGameState("ended");
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedPart(null);
      setSelectedAnswer(null);
      setIsCorrectPart(null);
      setIsCorrectAnswer(null);
      setGameState("playing");
    }
  };

  // Split sentence into individual clickable words
  const renderSentence = () => {
    if (!currentSentence) return null;

    const sentence = currentSentence.sentence;
    const wordy = currentSentence.wordyPart;
    const words: { text: string; start: number; end: number; isWordy: boolean }[] = [];

    // Split by words
    const regex = /(\S+)/g;
    let match;

    while ((match = regex.exec(sentence)) !== null) {
      const wordStart = match.index;
      const wordEnd = match.index + match[0].length;

      // Check if this word is within the wordy part
      const wordyStart = wordy.startIndex;
      const wordyEnd = wordy.startIndex + wordy.text.length;
      const isWordy = wordStart >= wordyStart && wordEnd <= wordyEnd;

      words.push({
        text: match[0],
        start: wordStart,
        end: wordEnd,
        isWordy,
      });
    }

    const showCorrectHighlight = gameState !== "playing";

    return (
      <div className="flex flex-wrap gap-2 justify-center text-xl leading-relaxed">
        {words.map((word, index) => {
          const isClickedWord = selectedPart &&
            word.start === selectedPart.start &&
            word.end === selectedPart.end;

          // Highlight all wordy words when showing results or selecting answer
          const isWordyHighlighted = word.isWordy && showCorrectHighlight;

          // Determine highlight style
          const isCorrectlyIdentified = isWordyHighlighted && isCorrectPart;
          const isIncorrectlyMissed = isWordyHighlighted && !isCorrectPart;
          const isWrongClick = isClickedWord && !isCorrectPart && !word.isWordy;

          return (
            <motion.span
              key={index}
              onClick={() => handlePartClick(word.start, word.end)}
              whileHover={gameState === "playing" ? { scale: 1.05 } : {}}
              className={`
                px-2 py-1 rounded-lg cursor-pointer transition-all duration-200
                ${gameState === "playing" ? "hover:bg-primary/20 hover:text-primary" : ""}
                ${isCorrectlyIdentified ? "bg-neon-green/30 text-neon-green border border-neon-green/50" : ""}
                ${isIncorrectlyMissed ? "bg-neon-orange/30 text-neon-orange border border-neon-orange/50" : ""}
                ${isWrongClick ? "bg-destructive/30 text-destructive border border-destructive/50" : ""}
              `}
            >
              {word.text}
            </motion.span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="p-3 rounded-xl bg-gradient-to-br from-neon-orange via-neon-orange/80 to-neon-pink">
            <Sparkles className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Clarity</h1>
            <p className="text-sm text-muted-foreground">Make sentences concise</p>
          </div>
        </div>

        {gameState !== "ready" && gameState !== "ended" && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="font-display font-bold text-xl">{score}/{totalQuestions}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="font-display font-bold text-xl text-neon-orange">{streak}🔥</p>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Ready State */}
          {(gameState === "ready" || gameState === "loading") && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <div className="p-8 rounded-3xl bg-gradient-to-br from-neon-orange via-neon-orange/80 to-neon-pink">
                  <Sparkles className="w-16 h-16 text-background" />
                </div>
              </motion.div>

              <h2 className="font-display text-3xl font-bold mb-4">Ready to clarify?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Find the wordy parts of sentences and choose a more concise alternative.
                Click on the wordy phrase, then select the best replacement!
              </p>

              <Button
                onClick={startGame}
                size="lg"
                disabled={gameState === "loading"}
                className="bg-gradient-to-r from-neon-orange to-neon-pink hover:opacity-90"
              >
                {gameState === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Start Game"
                )}
              </Button>
            </motion.div>
          )}

          {/* Playing State */}
          {(gameState === "playing" || gameState === "selectingAnswer" || gameState === "showingResult") && currentSentence && (
            <motion.div
              key={`question-${currentIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-3xl"
            >
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentIndex + 1} of {totalQuestions}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-orange to-neon-pink"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Sentence Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-8 mb-6"
              >
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  {gameState === "playing"
                    ? "Click on the wordy part of this sentence:"
                    : gameState === "selectingAnswer"
                      ? "Now select the best replacement:"
                      : "Result:"}
                </p>

                {renderSentence()}
              </motion.div>

              {/* Answer Options */}
              <AnimatePresence>
                {(gameState === "selectingAnswer" || gameState === "showingResult") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-3"
                  >
                    {currentSentence.options.map((option, index) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = option === currentSentence.correctOption;
                      const showResult = gameState === "showingResult";

                      return (
                        <motion.button
                          key={option}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={gameState === "showingResult"}
                          className={`
                            w-full p-4 rounded-xl text-left transition-all duration-200
                            border
                            ${showResult && isCorrect
                              ? "bg-neon-green/20 border-neon-green text-neon-green"
                              : showResult && isSelected && !isCorrect
                                ? "bg-destructive/20 border-destructive text-destructive"
                                : "glass-card border-border/50 hover:border-primary/50 hover:bg-primary/10"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option}</span>
                            {showResult && isCorrect && (
                              <Check className="w-5 h-5 text-neon-green" />
                            )}
                            {showResult && isSelected && !isCorrect && (
                              <X className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reason Card */}
              <AnimatePresence>
                {gameState === "showingResult" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-neon-cyan mb-1">Why?</p>
                        <p className="text-sm text-muted-foreground">{currentSentence.reason}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {gameState === "showingResult" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex justify-center"
                >
                  <Button
                    onClick={nextQuestion}
                    className="bg-gradient-to-r from-neon-orange to-neon-pink"
                  >
                    {currentIndex >= sentences.length - 1 ? "See Results" : "Next Sentence"}
                  </Button>
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
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-6"
              >
                <div className="p-6 rounded-3xl bg-gradient-to-br from-neon-orange to-neon-pink">
                  <Trophy className="w-12 h-12 text-background" />
                </div>
              </motion.div>

              <h2 className="font-display text-3xl font-bold mb-2">Game Complete!</h2>
              <p className="text-muted-foreground mb-6">
                You've mastered concise writing!
              </p>

              <div className="glass-card rounded-2xl p-6 mb-8 max-w-sm mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-neon-orange">{score}</p>
                    <p className="text-sm text-muted-foreground">Final Score</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-neon-green">
                      {Math.round((score / totalQuestions) * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-neon-orange to-neon-pink hover:opacity-90"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>

              {/* Buy me a coffee - show when score is good */}
              {score >= 7 && <Footer minimal className="mt-6" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Clarity;
