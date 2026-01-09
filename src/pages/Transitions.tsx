import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Zap, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { transitionsData, categoryLabels, categoryColors, TransitionQuestion } from "@/data/transitionsData";
import { useLayoutControl } from "@/hooks/useLayoutControl";

type GameState = "idle" | "playing" | "result" | "complete";

const Transitions = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [questions, setQuestions] = useState<TransitionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = 10;
  const { setHideHeader } = useLayoutControl();

  useEffect(() => {
    if (gameState !== "idle" && gameState !== "complete") {
      setHideHeader(true);
    } else {
      setHideHeader(false);
    }
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = useCallback(() => {
    const shuffled = shuffleArray(transitionsData).slice(0, totalQuestions);
    // Shuffle options for each question
    const withShuffledOptions = shuffled.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));
    setQuestions(withShuffledOptions);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState("playing");
  }, []);

  const handleAnswerSelect = (answer: string) => {
    if (gameState !== "playing" || selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setGameState("result");
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setGameState("playing");
    } else {
      setGameState("complete");
    }
  };

  const getButtonStyle = (option: string) => {
    if (gameState !== "result") {
      return "border-border/50 hover:border-primary/50 hover:bg-primary/5";
    }

    if (option === currentQuestion.correctAnswer) {
      return "border-green-500 bg-green-500/10 text-green-400";
    }

    if (option === selectedAnswer && !isCorrect) {
      return "border-red-500 bg-red-500/10 text-red-400";
    }

    return "border-border/30 opacity-50";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Transitions
          </h1>
          <p className="text-muted-foreground text-sm">
            Master the art of connecting ideas
          </p>
        </div>
      </motion.div>

      {/* Idle State */}
      {gameState === "idle" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Zap className="h-10 w-10 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Become a Persuasive Speaker</h2>
                <p className="text-muted-foreground">
                  Learn powerful transitions to connect complex ideas and deliver engaging talks.
                  Choose the best transition for each context.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className={`bg-gradient-to-r ${categoryColors[key as TransitionQuestion["category"]]} border-border/50`}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
              <Button
                size="lg"
                onClick={startGame}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                Start Practice
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Playing & Result States */}
      {(gameState === "playing" || gameState === "result") && currentQuestion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Progress & Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-card/50">
                <Target className="h-3 w-3 mr-1" />
                {currentIndex + 1}/{totalQuestions}
              </Badge>
              {streak > 1 && (
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500">
                  🔥 {streak} streak
                </Badge>
              )}
            </div>
            <Badge
              variant="outline"
              className={`bg-gradient-to-r ${categoryColors[currentQuestion.category]} border-border/50`}
            >
              {categoryLabels[currentQuestion.category]}
            </Badge>
          </div>

          <Progress value={((currentIndex + 1) / totalQuestions) * 100} className="h-2" />

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="space-y-4">
                  <p className="text-lg text-foreground">
                    {currentQuestion.context}
                  </p>
                  <p className="text-lg font-medium text-primary">
                    {currentQuestion.blank}
                  </p>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswerSelect(option)}
                disabled={gameState === "result"}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${getButtonStyle(option)}
                  ${gameState === "playing" ? "cursor-pointer" : "cursor-default"}
                `}
              >
                <span className="font-medium">{option}</span>
              </motion.button>
            ))}
          </div>

          {/* Result Feedback */}
          {gameState === "result" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-green-400 font-medium">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-400 font-medium">
                      Answer: {currentQuestion.correctAnswer}
                    </span>
                  </>
                )}
              </div>
              <Button onClick={handleNext}>
                {currentIndex < questions.length - 1 ? "Next" : "See Results"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Complete State */}
      {gameState === "complete" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Practice Complete!</h2>
                <p className="text-muted-foreground">
                  You've completed the transitions practice session.
                </p>
              </div>

              <div className="py-6">
                <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {score}/{totalQuestions}
                </div>
                <p className="text-muted-foreground mt-2">
                  {score === totalQuestions
                    ? "Perfect! You're a master of transitions!"
                    : score >= 7
                    ? "Great job! Your speaking will be more engaging."
                    : score >= 5
                    ? "Good effort! Keep practicing to improve."
                    : "Keep going! Practice makes perfect."}
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  Play Again
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Transitions;
