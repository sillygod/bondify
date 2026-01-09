import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Trophy, RotateCcw, Check, X, Volume2, Lightbulb, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PronunciationWord, getRandomPronunciationWords } from "@/data/pronunciationData";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useNavigate } from "react-router-dom";

type GameState = "ready" | "playing" | "showingResult" | "ended";

interface QuestionData {
  word: PronunciationWord;
  shownPronunciation: string;
  isShownCorrect: boolean;
}

const Pronunciation = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("ready");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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

  const speakPronunciation = useCallback((pronunciation: string) => {
    if (!pronunciation) return;
    if (!("speechSynthesis" in window)) return;

    // Prevent queued/overlapping utterances
    window.speechSynthesis.cancel();

    // Respelling strings use hyphens for syllables; spaces sound more natural.
    const text = pronunciation.replace(/[–-]/g, " ").replace(/\s+/g, " ").trim();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.7;
    window.speechSynthesis.speak(utterance);
  }, []);

  const speakShownPronunciation = useCallback(() => {
    if (!currentQuestion) return;
    speakPronunciation(currentQuestion.shownPronunciation);
  }, [currentQuestion, speakPronunciation]);

  const speakCorrectPronunciation = useCallback(() => {
    if (!currentQuestion) return;
    speakPronunciation(currentQuestion.word.correctPronunciation);
  }, [currentQuestion, speakPronunciation]);

  // Auto-play the *shown* pronunciation when a new question appears
  useEffect(() => {
    if (gameState === "playing" && currentQuestion) {
      const timer = setTimeout(() => {
        speakShownPronunciation();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [gameState, currentIndex, currentQuestion, speakShownPronunciation]);

  const startGame = useCallback(() => {
    const words = getRandomPronunciationWords(totalQuestions);
    // For each word, randomly decide whether to show correct or incorrect pronunciation
    const newQuestions: QuestionData[] = words.map(word => {
      const showCorrect = Math.random() > 0.5;
      return {
        word,
        shownPronunciation: showCorrect 
          ? word.correctPronunciation 
          : word.incorrectPronunciations[Math.floor(Math.random() * word.incorrectPronunciations.length)],
        isShownCorrect: showCorrect
      };
    });
    
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setUserAnswer(null);
    setIsCorrect(null);
    setGameState("playing");
  }, []);

  const handleAnswer = (userSaysCorrect: boolean) => {
    if (gameState !== "playing") return;
    
    setUserAnswer(userSaysCorrect);
    const correct = userSaysCorrect === currentQuestion.isShownCorrect;
    setIsCorrect(correct);
    
    if (correct) {
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
      setUserAnswer(null);
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-neon-purple via-neon-purple/80 to-primary">
            <Mic className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Pronunciation</h1>
            <p className="text-sm text-muted-foreground">Master correct pronunciation</p>
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
              <p className="font-display font-bold text-xl text-neon-purple">{streak}🔥</p>
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
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <div className="p-8 rounded-3xl bg-gradient-to-br from-neon-purple via-neon-purple/80 to-primary">
                  <Mic className="w-16 h-16 text-background" />
                </div>
              </motion.div>
              
              <h2 className="font-display text-3xl font-bold mb-4">Ready to practice?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Learn correct pronunciations and avoid common mistakes.
                Decide if the shown pronunciation is correct or not!
              </p>
              
              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-neon-purple to-primary hover:opacity-90"
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
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-purple to-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Word Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-8 mb-6"
              >
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  {gameState === "playing" 
                    ? "Is this pronunciation correct?"
                    : "Result:"}
                </p>
                
                {/* Hidden word display (show ??? when playing) */}
                <div className="text-center mb-4">
                  <h2 className="font-display text-4xl font-bold mb-2 text-primary">
                    {gameState === "playing" ? "???" : currentQuestion.word.word}
                  </h2>
                  <p className="text-muted-foreground italic mb-4">
                    "{currentQuestion.word.definition}"
                  </p>
                </div>

                {/* Shown Pronunciation */}
                <div className="text-center mb-4">
                  <span className="font-mono text-2xl text-foreground">
                    {currentQuestion.shownPronunciation}
                  </span>
                </div>

                {/* Listen Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={speakShownPronunciation}
                    className="border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </Button>
                </div>

                {/* IPA display only in result */}
                {gameState === "showingResult" && (
                  <div className="text-center mt-4">
                    <span className="text-lg text-neon-cyan font-mono">
                      {currentQuestion.word.ipaCorrect}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Answer Buttons */}
              {gameState === "playing" && (
                <div className="flex gap-4 justify-center mb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Button
                      size="lg"
                      onClick={() => handleAnswer(true)}
                      className="bg-neon-green/20 border border-neon-green text-neon-green hover:bg-neon-green/30 min-w-32"
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
                      size="lg"
                      onClick={() => handleAnswer(false)}
                      className="bg-destructive/20 border border-destructive text-destructive hover:bg-destructive/30 min-w-32"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Incorrect
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Result Feedback */}
              <AnimatePresence>
                {gameState === "showingResult" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-4 ${
                      isCorrect 
                        ? "bg-neon-green/20 border border-neon-green/30" 
                        : "bg-destructive/20 border border-destructive/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isCorrect ? (
                        <Check className="w-6 h-6 text-neon-green" />
                      ) : (
                        <X className="w-6 h-6 text-destructive" />
                      )}
                      <div>
                        <p className={`font-medium ${isCorrect ? "text-neon-green" : "text-destructive"}`}>
                          {isCorrect ? "Correct!" : "Incorrect!"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          The pronunciation "{currentQuestion.shownPronunciation}" is{" "}
                          <span className={currentQuestion.isShownCorrect ? "text-neon-green" : "text-destructive"}>
                            {currentQuestion.isShownCorrect ? "correct" : "incorrect"}
                          </span>
                          . The correct pronunciation is: <span className="text-neon-cyan font-mono">{currentQuestion.word.correctPronunciation}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Audio Playback Buttons (only in result when wrong) */}
              <AnimatePresence>
                {gameState === "showingResult" && !currentQuestion.isShownCorrect && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 justify-center mb-6"
                  >
                    <Button
                      variant="outline"
                      onClick={speakCorrectPronunciation}
                      className="border-neon-green/50 text-neon-green hover:bg-neon-green/10"
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Correct: {currentQuestion.word.correctPronunciation}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Explanation Card */}
              <AnimatePresence>
                {gameState === "showingResult" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-neon-cyan mb-1">Why?</p>
                        <p className="text-sm text-muted-foreground">{currentQuestion.word.explanation}</p>
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
                    className="bg-gradient-to-r from-neon-purple to-primary"
                  >
                    {currentIndex >= questions.length - 1 ? "See Results" : "Next Word"}
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
                <div className="p-6 rounded-3xl bg-gradient-to-br from-neon-purple to-primary">
                  <Trophy className="w-12 h-12 text-background" />
                </div>
              </motion.div>
              
              <h2 className="font-display text-3xl font-bold mb-2">Game Complete!</h2>
              <p className="text-muted-foreground mb-6">
                You've practiced pronunciation!
              </p>
              
              <div className="glass-card rounded-2xl p-6 mb-8 max-w-sm mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-neon-purple">{score}</p>
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
                className="bg-gradient-to-r from-neon-purple to-primary hover:opacity-90"
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

export default Pronunciation;
