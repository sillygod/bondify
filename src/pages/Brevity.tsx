import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Trophy, RotateCcw, Check, X, Lightbulb, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useNavigate } from "react-router-dom";
import { useBrevityQuestions, BrevityQuestion } from "@/hooks/useGameQuestions";
import { Footer } from "@/components/layout/Footer";

// Fallback mock data
const mockBrevityData = [
  {
    originalSentence: "At this point in time, we are not in a position to make a decision.",
    options: ["We cannot decide now.", "At this moment we are unable to make decisions.", "We are currently not positioned to decide."],
    correctOption: "We cannot decide now.",
    reason: "Removes redundant phrases like 'at this point in time' and 'in a position to' for clearer expression."
  },
  {
    originalSentence: "The reason why he was late was due to the fact that there was heavy traffic.",
    options: ["He was late because of heavy traffic.", "The reason for his lateness was heavy traffic conditions.", "Due to heavy traffic, the reason for being late was explained."],
    correctOption: "He was late because of heavy traffic.",
    reason: "'The reason why' and 'due to the fact that' are both wordy. Use 'because of' for clarity."
  },
  {
    originalSentence: "In order to succeed in life, it is necessary to work hard.",
    options: ["To succeed, work hard.", "For success in life, hard work is a necessity.", "In life, success requires that you work hard."],
    correctOption: "To succeed, work hard.",
    reason: "'In order to' can be shortened to 'To', and 'it is necessary to' is wordy."
  },
  {
    originalSentence: "She is of the opinion that the project should be completed by Friday.",
    options: ["She thinks the project should be done by Friday.", "Her opinion is that project completion should occur Friday.", "She holds the view that Friday is the deadline."],
    correctOption: "She thinks the project should be done by Friday.",
    reason: "'Is of the opinion that' is wordy. Simply use 'thinks' or 'believes'."
  },
  {
    originalSentence: "Despite the fact that it was raining heavily, the game continued.",
    options: ["Although it rained heavily, the game continued.", "Despite heavy rain conditions, the game went on.", "The game continued notwithstanding the heavy rainfall."],
    correctOption: "Although it rained heavily, the game continued.",
    reason: "'Despite the fact that' is wordy. Use 'Although' or 'Despite' + noun."
  },
  {
    originalSentence: "It is important to note that all employees must attend the meeting.",
    options: ["All employees must attend the meeting.", "Notably, meeting attendance is required for all employees.", "It should be mentioned that employee attendance is mandatory."],
    correctOption: "All employees must attend the meeting.",
    reason: "'It is important to note that' is filler. Get directly to the point."
  },
  {
    originalSentence: "The committee has made a decision to postpone the event.",
    options: ["The committee decided to postpone the event.", "A postponement decision was made by the committee.", "The committee's decision was to postpone."],
    correctOption: "The committee decided to postpone the event.",
    reason: "'Has made a decision to' is wordy. Use the verb 'decided' directly."
  },
  {
    originalSentence: "There are many people who believe that climate change is urgent.",
    options: ["Many people believe climate change is urgent.", "Belief in climate change urgency exists among many.", "People who believe in urgent climate change are many."],
    correctOption: "Many people believe climate change is urgent.",
    reason: "'There are...who' is an expletive construction. Start directly with the subject."
  },
  {
    originalSentence: "He conducted an investigation into the matter.",
    options: ["He investigated the matter.", "An investigation of the matter was conducted by him.", "He carried out an investigative process."],
    correctOption: "He investigated the matter.",
    reason: "'Conducted an investigation into' is wordy. Use the verb 'investigated'."
  },
  {
    originalSentence: "Each and every person in the room applauded.",
    options: ["Everyone in the room applauded.", "Each person in the room applauded.", "Each and every individual applauded."],
    correctOption: "Everyone in the room applauded.",
    reason: "'Each and every' is redundant. Use 'everyone' or 'each'."
  }
];

type GameState = "ready" | "loading" | "playing" | "showingResult" | "ended";

interface BrevitySentence {
  id: number;
  originalSentence: string;
  options: string[];
  correctOption: string;
  reason: string;
}

const Brevity = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("ready");
  const [sentences, setSentences] = useState<BrevitySentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const currentSentence = sentences[currentIndex];
  const totalQuestions = 10;
  const { setHideHeader } = useLayoutControl();

  // TanStack Query hook
  const { refetch: fetchQuestions } = useBrevityQuestions(totalQuestions);

  useEffect(() => {
    if (gameState !== "ready" && gameState !== "ended") {
      setHideHeader(true);
    } else {
      setHideHeader(false);
    }
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  const { resetProgress } = useGameProgress({
    gameState,
    score: score * 100,
    wordsLearned: currentIndex,
  });

  const startGame = useCallback(async () => {
    setGameState("loading");
    setUsingMockData(false);

    try {
      const result = await fetchQuestions();
      const apiQuestions = result.data;

      if (apiQuestions && apiQuestions.length > 0) {
        // Use API questions directly
        const transformedSentences: BrevitySentence[] = apiQuestions.map((q: BrevityQuestion, index: number) => ({
          id: q.id ?? index,
          originalSentence: q.originalSentence,
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
      const shuffled = [...mockBrevityData].sort(() => Math.random() - 0.5).slice(0, totalQuestions);
      const mockSentences: BrevitySentence[] = shuffled.map((q, index) => ({
        id: index,
        ...q
      }));
      setSentences(mockSentences);
    }

    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    resetProgress();
    setGameState("playing");
  }, [resetProgress, fetchQuestions]);

  const handleAnswerSelect = (answer: string) => {
    if (gameState !== "playing") return;

    setSelectedAnswer(answer);
    const correct = answer === currentSentence.correctOption;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    setGameState("showingResult");
  };

  const nextQuestion = () => {
    if (currentIndex >= sentences.length - 1) {
      setGameState("ended");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setGameState("playing");
    }
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-neon-pink via-neon-pink/80 to-primary">
            <Scissors className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Brevity</h1>
            <p className="text-sm text-muted-foreground">Choose the concise version</p>
          </div>
        </div>

        {gameState !== "ready" && gameState !== "ended" && gameState !== "loading" && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="font-display font-bold text-xl">
                {score}/{totalQuestions}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="font-display font-bold text-xl text-neon-pink">{streak}🔥</p>
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
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <div className="p-8 rounded-3xl bg-gradient-to-br from-neon-pink via-neon-pink/80 to-primary">
                  <Scissors className="w-16 h-16 text-background" />
                </div>
              </motion.div>

              <h2 className="font-display text-3xl font-bold mb-4">Ready to write concisely?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Read the wordy sentence and select the most concise version.
                Master the art of brevity!
              </p>

              <Button
                onClick={startGame}
                size="lg"
                disabled={gameState === "loading"}
                className="bg-gradient-to-r from-neon-pink to-primary hover:opacity-90"
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

          {/* Playing / Showing Result State */}
          {(gameState === "playing" || gameState === "showingResult") && currentSentence && (
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
                  <span>
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-pink to-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Original Sentence Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 mb-6"
              >
                <p className="text-sm text-muted-foreground mb-2">Wordy sentence:</p>
                <p className="text-lg font-medium text-neon-orange">
                  "{currentSentence.originalSentence}"
                </p>
              </motion.div>

              {/* Options */}
              <p className="text-sm text-muted-foreground mb-4 text-center">
                {gameState === "playing" ? "Choose the most concise version:" : "Result:"}
              </p>

              <div className="grid gap-3">
                {currentSentence.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = option === currentSentence.correctOption;
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
                        ${showResult && isCorrectOption
                          ? "bg-neon-green/20 border-neon-green text-neon-green"
                          : showResult && isSelected && !isCorrectOption
                            ? "bg-destructive/20 border-destructive text-destructive"
                            : "glass-card border-border/50 hover:border-primary/50 hover:bg-primary/10"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showResult && isCorrectOption && (
                          <Check className="w-5 h-5 text-neon-green" />
                        )}
                        {showResult && isSelected && !isCorrectOption && (
                          <X className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

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
                    className="bg-gradient-to-r from-neon-pink to-primary"
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
                <div className="p-6 rounded-3xl bg-gradient-to-br from-neon-pink to-primary">
                  <Trophy className="w-12 h-12 text-background" />
                </div>
              </motion.div>

              <h2 className="font-display text-3xl font-bold mb-2">Game Complete!</h2>
              <p className="text-muted-foreground mb-6">You've sharpened your brevity skills!</p>

              <div className="glass-card rounded-2xl p-6 mb-8 max-w-sm mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-neon-pink">{score}</p>
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
                className="bg-gradient-to-r from-neon-pink to-primary hover:opacity-90"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>

              {/* Buy me a coffee - show when score is good */}
              {score >= 6 && <Footer minimal className="mt-6" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Brevity;
