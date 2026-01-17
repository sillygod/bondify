import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, Volume2, Play, Pause, RotateCcw, CheckCircle, XCircle, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getRandomQuestions, ListeningQuestion } from "@/data/listeningData";
import { useNavigate } from "react-router-dom";
import { useGameProgress } from "@/hooks/useGameProgress";

type GameState = "ready" | "playing" | "showingResult" | "ended";

const ListeningGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("ready");
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const { resetProgress } = useGameProgress({
    gameState,
    score: score * 100,
    wordsLearned: score,
  });

  const startGame = () => {
    const randomQuestions = getRandomQuestions(5);
    setQuestions(randomQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setHasListened(false);
    resetProgress();
    setGameState("playing");
  };

  const playConversation = () => {
    if (!currentQuestion || isPlaying) return;

    window.speechSynthesis.cancel();
    setIsPlaying(true);
    setCurrentSpeakerIndex(0);

    const speakLine = (index: number) => {
      if (index >= currentQuestion.conversation.length) {
        setIsPlaying(false);
        setHasListened(true);
        return;
      }

      setCurrentSpeakerIndex(index);
      const line = currentQuestion.conversation[index];
      const utterance = new SpeechSynthesisUtterance(line.text);

      // Alternate voices for different speakers
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      if (englishVoices.length > 1) {
        utterance.voice = englishVoices[index % 2];
      }

      utterance.rate = 0.9;
      utterance.pitch = index % 2 === 0 ? 1 : 1.1;

      utterance.onend = () => {
        setTimeout(() => speakLine(index + 1), 500);
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakLine(0);
  };

  const stopPlayback = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
    setGameState("showingResult");
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setHasListened(false);
      setGameState("playing");
    } else {
      setGameState("ended");
    }
  };

  useEffect(() => {
    // Load voices
    window.speechSynthesis.getVoices();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [currentIndex]);

  if (gameState === "ready") {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Headphones className="w-10 h-10 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">Listening & Response</h1>
            <p className="text-muted-foreground">
              Listen to conversations and choose the best response
            </p>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">How to Play</h3>
              <ul className="text-left text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  Listen to the conversation by clicking the play button
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  Read the question about what to say next
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  Choose the most appropriate response from 3 options
                </li>
              </ul>

              <div className="flex items-center justify-center gap-4 pt-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Casual
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  Professional
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Button onClick={startGame} size="lg" className="px-8">
            Start Listening
          </Button>
        </motion.div>
      </div>
    );
  }

  if (gameState === "ended") {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Headphones className="w-12 h-12 text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
            <p className="text-muted-foreground">Great listening practice</p>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="text-5xl font-bold text-primary mb-2">
                {score}/{questions.length}
              </div>
              <p className="text-muted-foreground">
                {percentage >= 80 ? "Excellent understanding!" :
                  percentage >= 60 ? "Good job! Keep practicing." :
                    "Keep listening and learning!"}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Dashboard
            </Button>
            <Button onClick={startGame}>
              Practice Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold">Listening & Response</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
        <Badge variant={currentQuestion?.category === "casual" ? "secondary" : "default"}>
          {currentQuestion?.category === "casual" ? (
            <><Users className="w-3 h-3 mr-1" /> Casual</>
          ) : (
            <><Briefcase className="w-3 h-3 mr-1" /> Professional</>
          )}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Conversation Card */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-muted-foreground">Conversation</h3>
                <div className="flex gap-2">
                  {isPlaying ? (
                    <Button variant="outline" size="sm" onClick={stopPlayback}>
                      <Pause className="w-4 h-4 mr-1" />
                      Stop
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={playConversation}>
                      <Play className="w-4 h-4 mr-1" />
                      {hasListened ? "Replay" : "Play"}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion?.conversation.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.5 }}
                    animate={{
                      opacity: isPlaying && currentSpeakerIndex === index ? 1 : 0.7,
                      scale: isPlaying && currentSpeakerIndex === index ? 1.02 : 1,
                    }}
                    className={`p-3 rounded-lg transition-colors ${isPlaying && currentSpeakerIndex === index
                        ? "bg-primary/20 border border-primary/30"
                        : "bg-muted/50"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${index % 2 === 0 ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                        }`}>
                        {line.speaker.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{line.speaker}</p>
                        <p className="text-sm">{line.text}</p>
                      </div>
                      {isPlaying && currentSpeakerIndex === index && (
                        <Volume2 className="w-4 h-4 text-primary animate-pulse ml-auto" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question */}
          <div className="text-center">
            <h2 className="text-xl font-semibold">{currentQuestion?.question}</h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = gameState === "showingResult";

              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult || !hasListened}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${!hasListened
                      ? "opacity-50 cursor-not-allowed border-border/50 bg-muted/30"
                      : showResult
                        ? isCorrect
                          ? "border-green-500 bg-green-500/20"
                          : isSelected
                            ? "border-red-500 bg-red-500/20"
                            : "border-border/50 bg-muted/30 opacity-50"
                        : "border-border/50 bg-card hover:border-primary/50 hover:bg-primary/10 cursor-pointer"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${showResult && isCorrect
                        ? "bg-green-500 text-white"
                        : showResult && isSelected
                          ? "bg-red-500 text-white"
                          : "bg-muted"
                      }`}>
                      {showResult && isCorrect ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : showResult && isSelected ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {!hasListened && gameState === "playing" && (
            <p className="text-center text-sm text-muted-foreground">
              Click "Play" to listen to the conversation first
            </p>
          )}

          {/* Explanation */}
          {gameState === "showingResult" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="pt-4">
                  <p className="text-sm">
                    <strong>Explanation:</strong> {currentQuestion?.explanation}
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-center mt-4">
                <Button onClick={nextQuestion}>
                  {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ListeningGame;
