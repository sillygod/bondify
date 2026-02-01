import { motion } from "framer-motion";
import { Brain, RotateCcw, Trophy, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDueWords, useSRSStats } from "@/hooks/useSRS";

export const SRSReviewCard = () => {
    const navigate = useNavigate();
    const { data: dueData, isLoading: isDueLoading } = useDueWords(10);
    const { data: stats, isLoading: isStatsLoading } = useSRSStats();

    const dueCount = dueData?.total || dueData?.words.length || 0;
    const words = dueData?.words || [];
    const hasDueWords = dueCount > 0;
    const isLoading = isDueLoading || isStatsLoading;

    if (isLoading) {
        return (
            <div className="glass-card rounded-2xl p-6 min-h-[200px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 relative overflow-hidden"
        >
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display font-semibold text-xl flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Spaced Repetition
                    </h2>
                    {stats && (
                        <div className="px-3 py-1 rounded-lg bg-secondary/50 text-xs text-muted-foreground border border-border/50">
                            Total Cards: {stats.totalCards}
                        </div>
                    )}
                </div>

                {hasDueWords ? (
                    <div className="space-y-6">
                        <div>
                            <p className="text-3xl font-display font-bold text-primary mb-1">
                                {dueCount} words
                            </p>
                            <p className="text-muted-foreground">Due for review right now</p>
                        </div>

                        {/* Word Preview */}
                        <div className="flex flex-wrap gap-2">
                            {words.slice(0, 5).map((word) => (
                                <span
                                    key={word.id}
                                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm font-medium"
                                >
                                    {word.word}
                                </span>
                            ))}
                            {dueCount > 5 && (
                                <span className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-sm">
                                    +{dueCount - 5} more
                                </span>
                            )}
                        </div>

                        <Button
                            onClick={() => navigate("/srs-review")}
                            className="w-full bg-gradient-to-r from-neon-purple to-primary hover:opacity-90 h-12 text-lg font-display"
                        >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            Start Review Session
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-4">
                            <Trophy className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="font-display font-bold text-lg mb-2">All Caught Up!</h3>
                        <p className="text-muted-foreground mb-6">
                            You've reviewed all your due cards. Great job keeping up with your streak!
                        </p>

                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/wordlist")}
                                className="gap-2"
                            >
                                View Wordlist
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
