import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, Trophy, Loader2, Volume2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { useDueWords, useRecordReview, useSRSStats } from "@/hooks/useSRS";
import { RATING_CONFIG, DueWord } from "@/lib/api/srs";

const SRSReview = () => {
    const navigate = useNavigate();
    const { setHideHeader } = useLayoutControl();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch due words
    const { data: dueData, isLoading, refetch } = useDueWords(50);
    const { data: stats } = useSRSStats();
    const recordReviewMutation = useRecordReview();

    const words = dueData?.words || [];
    const currentWord = words[currentIndex];
    const isFinished = currentIndex >= words.length || words.length === 0;

    // Hide header when reviewing
    useEffect(() => {
        setHideHeader(!isFinished && words.length > 0);
        return () => setHideHeader(false);
    }, [isFinished, words.length, setHideHeader]);

    const handleRating = async (rating: 1 | 2 | 3 | 4) => {
        if (!currentWord || isProcessing) return;

        setIsProcessing(true);
        try {
            await recordReviewMutation.mutateAsync({
                wordId: currentWord.id,
                rating,
            });
            setReviewedCount((prev) => prev + 1);
            setShowAnswer(false);
            setCurrentIndex((prev) => prev + 1);
        } catch (error) {
            console.error("Failed to record review:", error);
        }
        setIsProcessing(false);
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setReviewedCount(0);
        setShowAnswer(false);
        refetch();
    };

    const speakWord = (word: string) => {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-display font-bold text-2xl neon-text">SRS Review</h1>
                        <p className="text-sm text-muted-foreground">Spaced repetition practice</p>
                    </div>
                </div>
                <div className="glass-card rounded-3xl p-8 text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading cards...</p>
                </div>
            </div>
        );
    }

    // No cards due
    if (words.length === 0 && !isLoading) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-display font-bold text-2xl neon-text">SRS Review</h1>
                        <p className="text-sm text-muted-foreground">Spaced repetition practice</p>
                    </div>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-3xl p-8 text-center"
                >
                    <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-neon-green to-primary mb-6">
                        <Trophy className="w-16 h-16 text-primary-foreground" />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-4">All Caught Up!</h2>
                    <p className="text-muted-foreground mb-6">
                        No cards are due for review right now. Add more words to your wordlist or come back later!
                    </p>
                    {stats && (
                        <div className="flex justify-center gap-4 mb-6">
                            <div className="px-4 py-3 rounded-xl bg-primary/20 border border-primary/30">
                                <p className="text-xl font-display font-bold">{stats.totalCards}</p>
                                <p className="text-xs text-muted-foreground">Total Cards</p>
                            </div>
                            <div className="px-4 py-3 rounded-xl bg-neon-green/20 border border-neon-green/30">
                                <p className="text-xl font-display font-bold text-neon-green">
                                    {Math.round(stats.averageRetention * 100)}%
                                </p>
                                <p className="text-xs text-muted-foreground">Retention</p>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => navigate("/wordlist")} className="rounded-xl">
                            Go to Wordlist
                        </Button>
                        <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-neon-cyan to-primary rounded-xl">
                            Back Home
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Finished reviewing
    if (isFinished) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-display font-bold text-2xl neon-text">SRS Review</h1>
                        <p className="text-sm text-muted-foreground">Session complete</p>
                    </div>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-3xl p-8 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-neon-cyan to-primary mb-6"
                    >
                        <Trophy className="w-16 h-16 text-primary-foreground" />
                    </motion.div>
                    <h2 className="font-display text-3xl font-bold mb-2">Session Complete!</h2>
                    <p className="text-muted-foreground mb-6">
                        You reviewed {reviewedCount} card{reviewedCount !== 1 ? "s" : ""} this session.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl">
                            Back Home
                        </Button>
                        <Button
                            onClick={handleRestart}
                            className="bg-gradient-to-r from-neon-cyan to-primary hover:opacity-90 rounded-xl font-display"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Review More
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Review screen
    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="font-display font-bold text-2xl neon-text">SRS Review</h1>
                    <p className="text-sm text-muted-foreground">Spaced repetition practice</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/20 border border-primary/30">
                    <span className="text-sm text-muted-foreground">Reviewed:</span>
                    <span className="font-display font-bold">{reviewedCount}</span>
                </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {words.length}
                </span>
                <Progress value={((currentIndex + 1) / words.length) * 100} className="flex-1 h-2" />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentWord.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-6"
                >
                    {/* Card */}
                    <div className="glass-card rounded-2xl p-6 min-h-[300px] flex flex-col">
                        {/* Front - Word */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <span
                                className={cn(
                                    "text-xs px-2 py-1 rounded-full mb-4",
                                    currentWord.state === "New" && "bg-blue-500/20 text-blue-400",
                                    currentWord.state === "Learning" && "bg-orange-500/20 text-orange-400",
                                    currentWord.state === "Review" && "bg-green-500/20 text-green-400",
                                    currentWord.state === "Relearning" && "bg-red-500/20 text-red-400"
                                )}
                            >
                                {currentWord.state}
                            </span>
                            <h2 className="font-display text-4xl font-bold mb-2">{currentWord.word}</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => speakWord(currentWord.word)}
                                className="text-muted-foreground"
                            >
                                <Volume2 className="w-4 h-4 mr-1" />
                                {currentWord.pronunciation || "Listen"}
                            </Button>
                        </div>

                        {/* Back - Definition (shown after clicking) */}
                        <AnimatePresence>
                            {showAnswer && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border-t border-border/50 pt-6 mt-6"
                                >
                                    <p className="text-sm text-muted-foreground mb-1">{currentWord.partOfSpeech}</p>
                                    <p className="text-lg">{currentWord.definition}</p>
                                    {currentWord.examples && currentWord.examples.length > 0 && (
                                        <p className="text-sm text-muted-foreground mt-4 italic">
                                            "{currentWord.examples[0]}"
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions */}
                    {!showAnswer ? (
                        <Button
                            onClick={() => setShowAnswer(true)}
                            className="w-full h-14 bg-gradient-to-r from-neon-cyan to-primary hover:opacity-90 rounded-xl font-display text-lg"
                        >
                            Show Answer
                        </Button>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {([1, 2, 3, 4] as const).map((rating) => (
                                <Button
                                    key={rating}
                                    onClick={() => handleRating(rating)}
                                    disabled={isProcessing}
                                    className={cn(
                                        "h-16 flex flex-col gap-1 rounded-xl font-display",
                                        RATING_CONFIG[rating].color,
                                        "hover:opacity-90 text-white"
                                    )}
                                >
                                    <span className="font-bold">{RATING_CONFIG[rating].label}</span>
                                    <span className="text-xs opacity-80">{RATING_CONFIG[rating].description}</span>
                                </Button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SRSReview;
