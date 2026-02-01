import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Trophy, RotateCcw, Check, X, Lightbulb, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RephraseQuestion,
  getProgressiveQuestions,
  challengeTypeLabels,
  challengeTypeColors,
  levelLabels
} from "@/data/rephraseData";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";

type GameState = "ready" | "playing" | "showingResult" | "ended";

const Rephrase = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("ready");
  const [questions, setQuestions] = useState<RephraseQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const { setHideHeader } = useLayoutControl();

  useEffect(() => {
    setHideHeader(gameState === "playing" || gameState === "showingResult");

    return () => {
      setHideHeader(false);
    };
  }, [gameState, setHideHeader]);

  const { resetProgress } = useGameProgress({
    gameState,
    score: score * 100,
    wordsLearned: currentIndex,
  });

  const startGame = useCallback(() => {
    const newQuestions = getProgressiveQuestions(10);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    resetProgress();
    setGameState("playing");
  }, [resetProgress]);

  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const currentQuestion = questions[currentIndex];

    if (answer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }

    setGameState("showingResult");
  }, [selectedAnswer, questions, currentIndex]);

  const nextQuestion = useCallback(() => {
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setGameState("playing");
    } else {
      setGameState("ended");
    }
  }, [currentIndex, questions.length]);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const getLevelColor = (level: 1 | 2 | 3) => {
    switch (level) {
      case 1: return "text-green-400";
      case 2: return "text-yellow-400";
      case 3: return "text-red-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 via-amber-500/80 to-primary">
            <PenLine className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rephrase Master</h1>
            <p className="text-sm text-muted-foreground">Improve your writing skills</p>
          </div>
        </div>
        {gameState !== "ready" && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-2xl font-bold text-primary">{score}/{questions.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-2xl font-bold text-foreground">{currentIndex + 1}/{questions.length}</div>
            </div>
          </div>
        )}
      </div>

      {/* Game Content */}
      <AnimatePresence mode="wait">
        {gameState === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center">
                <PenLine className="w-10 h-10 text-background" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Rephrase Master</h2>
              <p className="text-muted-foreground mb-6">
                Improve paragraphs by choosing better conjunctions, reordering sentences,
                and rephrasing for clarity and flow.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                  <div className="font-semibold text-neon-cyan mb-1">Conjunctions</div>
                  <div className="text-muted-foreground">Replace weak connectors</div>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                  <div className="font-semibold text-neon-purple mb-1">Reorder</div>
                  <div className="text-muted-foreground">Fix sentence flow</div>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                  <div className="font-semibold text-neon-pink mb-1">Rephrase</div>
                  <div className="text-muted-foreground">Improve clarity</div>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                  <div className="font-semibold text-neon-green mb-1">Combine</div>
                  <div className="text-muted-foreground">Merge sentences</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">Easy</span>
                <span>→</span>
                <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">Medium</span>
                <span>→</span>
                <span className="px-2 py-1 rounded bg-red-500/20 text-red-400">Hard</span>
              </div>

              <Button
                size="lg"
                onClick={startGame}
                className="bg-gradient-to-r from-amber-500 to-primary hover:from-amber-600 hover:to-primary/90"
              >
                Start Challenge
              </Button>
            </div>
          </motion.div>
        )}

        {(gameState === "playing" || gameState === "showingResult") && currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-3xl mx-auto"
          >
            {/* Level & Type Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(currentQuestion.level)} bg-background/50 border border-current/30`}>
                {levelLabels[currentQuestion.level]}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium text-${challengeTypeColors[currentQuestion.type]} bg-background/50 border border-current/30`}>
                {challengeTypeLabels[currentQuestion.type]}
              </span>
            </div>

            {/* Question Card */}
            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                {currentQuestion.type === "conjunction" && "Choose the best conjunction:"}
                {currentQuestion.type === "reorder" && "Choose the correct order:"}
                {currentQuestion.type === "rephrase" && "Choose the best rephrasing:"}
                {currentQuestion.type === "combine" && "Choose the best combination:"}
              </h3>

              <div className="p-4 rounded-xl bg-background/70 border border-border/30 mb-2">
                <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.context}
                </p>
              </div>

              {currentQuestion.targetSentence && (
                <p className="text-sm text-muted-foreground italic">
                  Task: {currentQuestion.targetSentence}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.correctAnswer;
                const showResult = gameState === "showingResult";

                let optionStyle = "bg-card/50 border-border/50 hover:border-primary/50 hover:bg-primary/5";
                if (showResult) {
                  if (isCorrectOption) {
                    optionStyle = "bg-green-500/20 border-green-500";
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = "bg-red-500/20 border-red-500";
                  } else {
                    optionStyle = "bg-card/30 border-border/30 opacity-60";
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={gameState === "showingResult"}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${optionStyle}`}
                    whileHover={gameState === "playing" ? { scale: 1.01 } : {}}
                    whileTap={gameState === "playing" ? { scale: 0.99 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-foreground flex-1">{option}</span>
                      {showResult && isCorrectOption && (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                      {showResult && isSelected && !isCorrectOption && (
                        <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Result & Explanation */}
            {gameState === "showingResult" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className={`p-4 rounded-xl mb-4 ${isCorrect ? "bg-green-500/20 border border-green-500/50" : "bg-red-500/20 border border-red-500/50"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`font-semibold ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                      {isCorrect ? "Correct!" : "Not quite right"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="mb-4 text-muted-foreground hover:text-foreground"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showExplanation ? "Hide" : "Show"} Explanation
                </Button>

                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-xl bg-primary/10 border border-primary/30 mb-4"
                  >
                    <p className="text-foreground">{currentQuestion.explanation}</p>
                  </motion.div>
                )}

                <Button
                  onClick={nextQuestion}
                  className="w-full bg-gradient-to-r from-amber-500 to-primary"
                >
                  {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
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
            className="max-w-md mx-auto text-center"
          >
            <div className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center">
                <Trophy className="w-10 h-10 text-background" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Challenge Complete!</h2>
              <p className="text-muted-foreground mb-6">Great work on improving your writing skills!</p>

              <div className="p-6 rounded-xl bg-background/50 mb-6">
                <div className="text-5xl font-bold text-primary mb-2">{score}/{questions.length}</div>
                <div className="text-muted-foreground">
                  {score >= 8 ? "Excellent! You're a master!" :
                    score >= 6 ? "Good job! Keep practicing!" :
                      "Keep learning, you'll improve!"}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  onClick={startGame}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-primary"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>

              {/* Buy me a coffee - show when score is good */}
              {score >= 6 && <Footer minimal className="mt-6" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Rephrase;
