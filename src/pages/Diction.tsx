import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookCheck, Trophy, RotateCcw, Check, X, Lightbulb, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DictionQuestion, getRandomDictionQuestions } from "@/data/dictionData";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useNavigate } from "react-router-dom";

type GameState = "ready" | "playing" | "showingResult" | "ended";

const Diction = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("ready");
  const [questions, setQuestions] = useState<DictionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = 10;
  const { setHideHeader } = useLayoutControl();

  useEffect(() => {
    if (gameState !== "ready" && gameState !== "ended") {
      setHideHeader(true);
    } else {
      setHideHeader(false);
    }
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  const startGame = useCallback(() => {
    const newQuestions = getRandomDictionQuestions(totalQuestions);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setGameState("playing");
  }, []);

  const handleAnswer = (answer: boolean) => {
    if (gameState !== "playing") return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.isCorrect;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    setGameState("showingResult");
  };

  const nextQuestion = () => {
    if (currentIndex >= questions.length - 1) {
      setGameState("ended");
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setGameState("playing");
    }
  };

  const renderSentence = () => {
    if (!currentQuestion) return null;
    
    const { sentence, highlightedPart } = currentQuestion;
    const startIdx = highlightedPart.startIndex;
    const endIdx = startIdx + highlightedPart.text.length;
    
    const before = sentence.slice(0, startIdx);
    const highlighted = sentence.slice(startIdx, endIdx);
    const after = sentence.slice(endIdx);
    
    return (
      <p className="text-xl leading-relaxed text-center">
        {before}
        <span className="px-2 py-1 rounded-lg bg-primary/30 text-primary border border-primary/50 font-medium">
          {highlighted}
        </span>
        {after}
      </p>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      vocabulary: "Vocabulary",
      grammar: "Grammar",
      idiom: "Idiom",
      preposition: "Preposition",
      "word-choice": "Word Choice",
    };
    return labels[category] || category;
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-cyan/80 to-primary">
            <BookCheck className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Diction</h1>
            <p className="text-sm text-muted-foreground">Avoid embarrassing errors</p>
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
              <p className="font-display font-bold text-xl text-neon-cyan">{streak}🔥</p>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Ready State */}
          {gameState === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <div className="p-8 rounded-3xl bg-gradient-to-br from-neon-cyan via-neon-cyan/80 to-primary">
                  <BookCheck className="w-16 h-16 text-background" />
                </div>
              </motion.div>
              
              <h2 className="font-display text-3xl font-bold mb-4">Master Your Diction</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Spot common errors in everyday speech. Learn to avoid embarrassing mistakes
                in vocabulary, grammar, idioms, and word choice.
              </p>
              
              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-neon-cyan to-primary hover:opacity-90"
              >
                Start Game
              </Button>
            </motion.div>
          )}

          {/* Playing State */}
          {(gameState === "playing" || gameState === "showingResult") && currentQuestion && (
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
                  <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                    {getCategoryLabel(currentQuestion.category)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-cyan to-primary"
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
                  Is the highlighted part correct?
                </p>
                
                {renderSentence()}
              </motion.div>

              {/* Answer Buttons */}
              {gameState === "playing" && (
                <div className="flex gap-4 justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Button
                      onClick={() => handleAnswer(true)}
                      size="lg"
                      className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/50 min-w-32"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Correct
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      onClick={() => handleAnswer(false)}
                      size="lg"
                      className="bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/50 min-w-32"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Wrong
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Result Display */}
              <AnimatePresence>
                {gameState === "showingResult" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Result Badge */}
                    <div className="flex justify-center">
                      {selectedAnswer === currentQuestion.isCorrect ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/20 border border-neon-green/50 text-neon-green">
                          <Check className="w-5 h-5" />
                          <span className="font-medium">Correct!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/20 border border-destructive/50 text-destructive">
                          <X className="w-5 h-5" />
                          <span className="font-medium">Incorrect</span>
                        </div>
                      )}
                    </div>

                    {/* Correction if wrong */}
                    {!currentQuestion.isCorrect && currentQuestion.correctVersion && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-xl bg-neon-orange/10 border border-neon-orange/30 text-center"
                      >
                        <p className="text-sm text-muted-foreground mb-1">Should be:</p>
                        <p className="font-medium text-neon-orange text-lg">
                          {currentQuestion.correctVersion}
                        </p>
                      </motion.div>
                    )}

                    {/* Explanation */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30"
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-neon-cyan mb-1">Explanation</p>
                          <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Next Button */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex justify-center pt-2"
                    >
                      <Button
                        onClick={nextQuestion}
                        className="bg-gradient-to-r from-neon-cyan to-primary"
                      >
                        {currentIndex >= questions.length - 1 ? "See Results" : "Next Question"}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                <div className="p-6 rounded-3xl bg-gradient-to-br from-neon-cyan to-primary">
                  <Trophy className="w-12 h-12 text-background" />
                </div>
              </motion.div>
              
              <h2 className="font-display text-3xl font-bold mb-2">Game Complete!</h2>
              <p className="text-muted-foreground mb-6">
                {score >= 8 
                  ? "Excellent! Your diction is impeccable!" 
                  : score >= 5 
                  ? "Good job! Keep practicing to master your diction."
                  : "Keep learning! These common errors trip up many people."}
              </p>
              
              <div className="glass-card rounded-2xl p-6 mb-8 max-w-sm mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-neon-cyan">{score}</p>
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
                className="bg-gradient-to-r from-neon-cyan to-primary hover:opacity-90"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Diction;
