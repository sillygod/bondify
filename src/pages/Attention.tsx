import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Headphones,
  CheckCircle2,
  XCircle,
  Volume2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AttentionArticle,
  MainBubble,
  RelatedBubble,
  attentionArticles,
  shuffleArray,
} from "@/data/attentionData";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useAttentionArticle, AttentionAPIArticle } from "@/hooks/useGameQuestions";
import { Footer } from "@/components/layout/Footer";

type GameState = "ready" | "playing" | "paused" | "ended";

interface MergedBubble extends MainBubble {
  mergedItems: RelatedBubble[];
}

const colorClasses = {
  purple: {
    bg: "bg-primary/20",
    border: "border-primary/50",
    glow: "shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
    text: "text-primary",
  },
  cyan: {
    bg: "bg-accent/20",
    border: "border-accent/50",
    glow: "shadow-[0_0_20px_hsl(var(--accent)/0.3)]",
    text: "text-accent",
  },
  orange: {
    bg: "bg-neon-orange/20",
    border: "border-neon-orange/50",
    glow: "shadow-[0_0_20px_rgba(255,165,0,0.3)]",
    text: "text-neon-orange",
  },
};

const Attention = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("ready");
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const { setHideHeader } = useLayoutControl();

  // TanStack Query hook
  const { refetch: fetchArticle } = useAttentionArticle();

  useEffect(() => {
    if (gameState === "playing" || gameState === "paused") {
      setHideHeader(true);
    } else {
      setHideHeader(false);
    }
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  const [article, setArticle] = useState<AttentionArticle | null>(null);
  const [mainBubbles, setMainBubbles] = useState<MergedBubble[]>([]);
  const [pendingBubbles, setPendingBubbles] = useState<RelatedBubble[]>([]);
  const [currentBubble, setCurrentBubble] = useState<RelatedBubble | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    targetId: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [totalMatched, setTotalMatched] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { resetProgress } = useGameProgress({
    gameState,
    score,
    wordsLearned: totalMatched,
  });

  const initGame = useCallback(async () => {
    setIsLoading(true);
    setUsingMockData(false);

    try {
      const result = await fetchArticle();
      const apiArticle = result.data;

      if (apiArticle) {
        // Transform API article to match frontend interface
        const transformed: AttentionArticle = {
          id: String(apiArticle.id ?? 'api-1'),
          title: apiArticle.title,
          audioText: apiArticle.audioText,
          mainBubbles: apiArticle.mainBubbles,
          relatedBubbles: apiArticle.relatedBubbles,
        };
        setArticle(transformed);
        setMainBubbles(transformed.mainBubbles.map((b) => ({ ...b, mergedItems: [] })));
        setPendingBubbles(shuffleArray([...transformed.relatedBubbles]));
      } else {
        throw new Error("No article available");
      }
    } catch (error) {
      console.warn("API unavailable, using mock data:", error);
      setUsingMockData(true);
      // Fallback to mock data
      const randomIndex = Math.floor(Math.random() * attentionArticles.length);
      const selectedArticle = attentionArticles[randomIndex];
      setArticle(selectedArticle);
      setMainBubbles(selectedArticle.mainBubbles.map((b) => ({ ...b, mergedItems: [] })));
      setPendingBubbles(shuffleArray([...selectedArticle.relatedBubbles]));
    }

    setCurrentBubble(null);
    setScore(0);
    setTotalMatched(0);
    setFeedback(null);
    resetProgress();
    setGameState("ready");
    setIsLoading(false);
  }, [resetProgress, fetchArticle]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Show next bubble when game is playing
  useEffect(() => {
    if (gameState === "playing" && !currentBubble && pendingBubbles.length > 0) {
      const timer = setTimeout(() => {
        setCurrentBubble(pendingBubbles[0]);
        setPendingBubbles((prev) => prev.slice(1));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, currentBubble, pendingBubbles]);

  // Check if game ended
  useEffect(() => {
    if (
      gameState === "playing" &&
      pendingBubbles.length === 0 &&
      !currentBubble &&
      totalMatched === article?.relatedBubbles.length
    ) {
      const timer = setTimeout(() => {
        stopSpeaking();
        setGameState("ended");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, pendingBubbles, currentBubble, totalMatched, article]);

  const startSpeaking = useCallback(() => {
    if (!article) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(article.audioText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  }, [article]);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const pauseSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    }
  }, []);

  const handleStart = () => {
    setGameState("playing");
    startSpeaking();
  };

  const handlePause = () => {
    setGameState("paused");
    pauseSpeaking();
  };

  const handleResume = () => {
    setGameState("playing");
    resumeSpeaking();
  };

  const handleDragStart = (e: React.DragEvent, bubble: RelatedBubble) => {
    e.dataTransfer.setData("bubbleId", bubble.id);
    e.dataTransfer.setData("parentId", bubble.parentId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDraggedOver(targetId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, targetBubble: MergedBubble) => {
    e.preventDefault();
    setDraggedOver(null);

    const parentId = e.dataTransfer.getData("parentId");
    const isCorrect = parentId === targetBubble.id;

    setFeedback({ type: isCorrect ? "correct" : "wrong", targetId: targetBubble.id });

    if (isCorrect && currentBubble) {
      setScore((prev) => prev + 100);
      setTotalMatched((prev) => prev + 1);
      setMainBubbles((prev) =>
        prev.map((b) =>
          b.id === targetBubble.id
            ? { ...b, mergedItems: [...b.mergedItems, currentBubble] }
            : b
        )
      );
      setTimeout(() => {
        setCurrentBubble(null);
        setFeedback(null);
      }, 800);
    } else {
      setTimeout(() => {
        setFeedback(null);
      }, 800);
    }
  };

  // Touch handlers for mobile
  const handleTouchEnd = (targetBubble: MergedBubble) => {
    if (!currentBubble) return;

    const isCorrect = currentBubble.parentId === targetBubble.id;
    setFeedback({ type: isCorrect ? "correct" : "wrong", targetId: targetBubble.id });

    if (isCorrect) {
      setScore((prev) => prev + 100);
      setTotalMatched((prev) => prev + 1);
      setMainBubbles((prev) =>
        prev.map((b) =>
          b.id === targetBubble.id
            ? { ...b, mergedItems: [...b.mergedItems, currentBubble] }
            : b
        )
      );
      setTimeout(() => {
        setCurrentBubble(null);
        setFeedback(null);
      }, 800);
    } else {
      setTimeout(() => {
        setFeedback(null);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            stopSpeaking();
            navigate("/");
          }}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-xl">Attention</h1>
        </div>
        <div className="text-right">
          <span className="text-sm text-muted-foreground">Score</span>
          <p className="font-bold text-lg text-primary">{score}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Loading State */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading article...</p>
          </motion.div>
        )}

        {/* Ready State */}
        {!isLoading && gameState === "ready" && article && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6"
            >
              <Headphones className="w-12 h-12 text-primary" />
            </motion.div>
            <h2 className="font-display font-bold text-2xl mb-2">{article.title}</h2>
            <p className="text-muted-foreground max-w-md mb-4">
              Listen to the article and match related items to their categories by
              dragging the bubbles.
            </p>
            <div className="flex gap-4 mb-8">
              {article.mainBubbles.map((bubble) => (
                <div
                  key={bubble.id}
                  className={`px-4 py-2 rounded-full ${colorClasses[bubble.color].bg} ${colorClasses[bubble.color].border} border`}
                >
                  <span className={colorClasses[bubble.color].text}>{bubble.text}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleStart} size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Start Listening
            </Button>
          </motion.div>
        )}

        {/* Playing/Paused State */}
        {(gameState === "playing" || gameState === "paused") && article && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Audio indicator */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Volume2
                  className={`w-5 h-5 text-primary ${isSpeaking ? "animate-pulse" : ""}`}
                />
                <span className="text-sm">
                  {isSpeaking ? "Listening..." : "Paused"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={gameState === "playing" ? handlePause : handleResume}
              >
                {gameState === "playing" ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Progress */}
            <div className="text-center text-sm text-muted-foreground">
              Matched: {totalMatched} / {article.relatedBubbles.length}
            </div>

            {/* Main Bubbles */}
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {mainBubbles.map((bubble) => (
                <motion.div
                  key={bubble.id}
                  className={`relative p-4 md:p-6 rounded-2xl ${colorClasses[bubble.color].bg} ${colorClasses[bubble.color].border} border-2 min-h-[150px] md:min-h-[200px] transition-all duration-300 ${draggedOver === bubble.id ? colorClasses[bubble.color].glow : ""
                    } ${feedback?.targetId === bubble.id
                      ? feedback.type === "correct"
                        ? "ring-4 ring-neon-green"
                        : "ring-4 ring-destructive animate-[shake_0.5s_ease-in-out]"
                      : ""
                    }`}
                  onDragOver={(e) => handleDragOver(e, bubble.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, bubble)}
                  onClick={() => handleTouchEnd(bubble)}
                >
                  <h3
                    className={`font-display font-semibold text-sm md:text-base mb-3 ${colorClasses[bubble.color].text}`}
                  >
                    {bubble.text}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {bubble.mergedItems.map((item) => (
                      <motion.span
                        key={item.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-2 py-1 rounded-full text-xs ${colorClasses[bubble.color].bg} ${colorClasses[bubble.color].border} border`}
                      >
                        {item.text}
                      </motion.span>
                    ))}
                  </div>
                  {feedback?.targetId === bubble.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      {feedback.type === "correct" ? (
                        <CheckCircle2 className="w-6 h-6 text-neon-green" />
                      ) : (
                        <XCircle className="w-6 h-6 text-destructive" />
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Current Bubble to Drag */}
            <div className="flex justify-center min-h-[80px]">
              <AnimatePresence>
                {currentBubble && (
                  <motion.div
                    key={currentBubble.id}
                    initial={{ scale: 0, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, currentBubble)}
                    className="px-6 py-3 rounded-full bg-secondary/80 border-2 border-secondary-foreground/20 cursor-grab active:cursor-grabbing hover:bg-secondary hover:scale-105 transition-all shadow-lg"
                  >
                    <span className="font-medium">{currentBubble.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Drag the bubble above to the correct category
            </p>
          </motion.div>
        )}

        {/* Ended State */}
        {gameState === "ended" && article && (
          <motion.div
            key="ended"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-neon-green/20 flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-neon-green" />
            </motion.div>
            <h2 className="font-display font-bold text-2xl mb-2">
              Great Listening!
            </h2>
            <p className="text-muted-foreground mb-6">
              You matched all items correctly!
            </p>

            <div className="glass-card rounded-2xl p-6 mb-8 min-w-[200px]">
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Final Score</span>
                <p className="font-display font-bold text-4xl text-primary">
                  {score}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button onClick={initGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>

            {/* Buy me a coffee - show when score is good */}
            {score >= 500 && <Footer minimal className="mt-6" />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attention;
