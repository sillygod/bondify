import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Trophy, RotateCcw, Check, X, Lightbulb, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrevitySentence, getRandomBrevitySentences } from "@/data/brevityData";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useNavigate } from "react-router-dom";

type GameState = "ready" | "playing" | "showingResult" | "ended";

const Brevity = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("ready");
  const [sentences, setSentences] = useState<BrevitySentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedWord, setSelectedWord] = useState<{ start: number; end: number } | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentSentence = sentences[currentIndex];
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

  const { resetProgress } = useGameProgress({
    gameState,
    score: score * 100,
    wordsLearned: currentIndex,
  });

  const startGame = useCallback(() => {
    const newSentences = getRandomBrevitySentences(totalQuestions);
    setSentences(newSentences);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedWord(null);
    setIsCorrect(null);
    resetProgress();
    setGameState("playing");
  }, [resetProgress]);

  // Get the actual start index of redundant part by finding it in the sentence
  const getRedundantBounds = () => {
    if (!currentSentence) return { start: -1, end: -1 };
    const sentence = currentSentence.sentence;
    const redundantText = currentSentence.redundantPart.text;
    const start = sentence.indexOf(redundantText);
    return { start, end: start + redundantText.length };
  };

  const handleWordClick = (start: number, end: number) => {
    if (gameState !== "playing") return;

    setSelectedWord({ start, end });

    const { start: redundantStart, end: redundantEnd } = getRedundantBounds();

    // Check if clicked word is within the redundant part
    const correct = start >= redundantStart && end <= redundantEnd;
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
      setSelectedWord(null);
      setIsCorrect(null);
      setGameState("playing");
    }
  };

  // Split sentence into individual clickable words
  const renderSentence = () => {
    if (!currentSentence) return null;

    const sentence = currentSentence.sentence;
    const { start: redundantStart, end: redundantEnd } = getRedundantBounds();
    const words: { text: string; start: number; end: number; isRedundant: boolean }[] = [];

    // Split by words
    const regex = /(\S+)/g;
    let match;

    while ((match = regex.exec(sentence)) !== null) {
      const wordStart = match.index;
      const wordEnd = match.index + match[0].length;

      // Check if this word is within the redundant part
      const isRedundant = wordStart >= redundantStart && wordEnd <= redundantEnd;

      words.push({
        text: match[0],
        start: wordStart,
        end: wordEnd,
        isRedundant,
      });
    }

    const showCorrectHighlight = gameState === "showingResult";

    return (
      <div className="flex flex-wrap gap-2 justify-center text-xl leading-relaxed">
        {words.map((word, index) => {
          const isClickedWord =
            selectedWord && word.start === selectedWord.start && word.end === selectedWord.end;

          // Highlight all redundant words when showing results
          const isRedundantHighlighted = word.isRedundant && showCorrectHighlight;

          // Determine highlight style
          const isCorrectlyIdentified = isRedundantHighlighted && isCorrect;
          const isIncorrectlyMissed = isRedundantHighlighted && !isCorrect;
          const isWrongClick = isClickedWord && !isCorrect && !word.isRedundant;

          return (
            <motion.span
              key={index}
              onClick={() => handleWordClick(word.start, word.end)}
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-neon-pink via-neon-pink/80 to-primary">
            <Scissors className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Brevity</h1>
            <p className="text-sm text-muted-foreground">Cut the redundancy</p>
          </div>
        </div>

        {gameState !== "ready" && gameState !== "ended" && (
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
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <div className="p-8 rounded-3xl bg-gradient-to-br from-neon-pink via-neon-pink/80 to-primary">
                  <Scissors className="w-16 h-16 text-background" />
                </div>
              </motion.div>

              <h2 className="font-display text-3xl font-bold mb-4">Ready to cut redundancy?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Find and click on the unnecessary or redundant words in each sentence. Sharpen your
                writing by eliminating wordiness!
              </p>

              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-neon-pink to-primary hover:opacity-90"
              >
                Start Game
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

              {/* Sentence Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-8 mb-6"
              >
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  {gameState === "playing"
                    ? "Click on the redundant or unnecessary part:"
                    : "Result:"}
                </p>

                {renderSentence()}

                {/* Result Feedback */}
                <AnimatePresence>
                  {gameState === "showingResult" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex justify-center"
                    >
                      {isCorrect ? (
                        <div className="flex items-center gap-2 text-neon-green">
                          <Check className="w-5 h-5" />
                          <span className="font-medium">Correct!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-destructive">
                          <X className="w-5 h-5" />
                          <span className="font-medium">Not quite!</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Reason Card */}
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
                        <p className="font-medium text-neon-cyan mb-1">
                          The redundant part: "{currentSentence.redundantPart.text}"
                        </p>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Brevity;
