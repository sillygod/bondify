import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Target, BookOpen, Loader2, TrendingDown, BarChart3 } from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { getWeaknessAnalysis, WeaknessAnalysisResponse, PartOfSpeechStats } from "@/lib/api/analytics";

interface WeaknessReportProps {
    className?: string;
}

const POS_COLORS: Record<string, string> = {
    noun: "#8b5cf6",       // purple
    verb: "#06b6d4",       // cyan
    adjective: "#f97316",  // orange
    adverb: "#22c55e",     // green
    preposition: "#ec4899", // pink
    conjunction: "#eab308", // yellow
    pronoun: "#3b82f6",    // blue
    interjection: "#ef4444", // red
    unknown: "#6b7280",    // gray
};

const timeRangeOptions = [
    { value: 7, label: "7 Days" },
    { value: 30, label: "30 Days" },
    { value: 90, label: "90 Days" },
];

export const WeaknessReport = ({ className }: WeaknessReportProps) => {
    const [data, setData] = useState<WeaknessAnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getWeaknessAnalysis(timeRange);
                setData(response);
            } catch (err) {
                console.error("Error fetching weakness analysis:", err);
                setError("Failed to load analysis data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    // Prepare pie chart data
    const pieData = data?.byPartOfSpeech.map((pos) => ({
        name: pos.partOfSpeech.charAt(0).toUpperCase() + pos.partOfSpeech.slice(1),
        value: pos.totalAnswers,
        accuracy: pos.accuracy,
        errorRate: pos.errorRate,
        color: POS_COLORS[pos.partOfSpeech.toLowerCase()] || POS_COLORS.unknown,
    })) || [];

    // Custom tooltip for pie chart
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
                    <p className="font-medium mb-1">{data.name}</p>
                    <p className="text-xs text-muted-foreground">
                        Answers: <span className="text-foreground">{data.value}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Accuracy: <span className="text-neon-green">{Math.round(data.accuracy * 100)}%</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Error Rate: <span className="text-neon-orange">{Math.round(data.errorRate * 100)}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative overflow-hidden rounded-2xl p-6",
                "bg-gradient-to-br from-neon-orange/10 to-neon-pink/5 backdrop-blur-xl border border-neon-orange/30",
                "shadow-[0_0_20px_hsl(30_100%_55%/0.2)]",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-card/50 border border-neon-orange/30">
                        <AlertTriangle className="w-5 h-5 text-neon-orange" />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-lg">Weakness Analysis</h3>
                        <p className="text-xs text-muted-foreground">Areas that need more practice</p>
                    </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center gap-1 bg-card/50 rounded-lg p-1">
                    {timeRangeOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setTimeRange(option.value)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                timeRange === option.value
                                    ? "bg-neon-orange text-white"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neon-orange" />
                </div>
            ) : error ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                    {error}
                </div>
            ) : !data || data.totalAnswers === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                    <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">No data yet. Complete some exercises!</p>
                </div>
            ) : (
                <>
                    {/* Overall Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-card/30 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold">{data.totalAnswers}</p>
                            <p className="text-xs text-muted-foreground">Total Answers</p>
                        </div>
                        <div className="bg-card/30 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-neon-green">{Math.round(data.overallAccuracy * 100)}%</p>
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                        <div className="bg-card/30 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-neon-orange">{data.topWeakWords.length}</p>
                            <p className="text-xs text-muted-foreground">Weak Words</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Part of Speech Pie Chart */}
                        <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                By Part of Speech
                            </h4>
                            {pieData.length > 0 ? (
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend
                                                layout="horizontal"
                                                align="center"
                                                wrapperStyle={{ fontSize: "10px" }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Not enough data for breakdown
                                </p>
                            )}
                        </div>

                        {/* Top Weak Words */}
                        <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-neon-orange" />
                                Focus Words
                            </h4>
                            {data.topWeakWords.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {data.topWeakWords.slice(0, 5).map((word, index) => (
                                        <div
                                            key={word.word}
                                            className="flex items-center justify-between p-2 bg-card/30 rounded-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                                                <div>
                                                    <p className="text-sm font-medium">{word.word}</p>
                                                    {word.partOfSpeech && (
                                                        <p className="text-xs text-muted-foreground">{word.partOfSpeech}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-neon-orange">
                                                    {Math.round(word.errorRate * 100)}% errors
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {word.totalAttempts} attempts
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Great job! No weak words found.
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Decorative gradient blob */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 bg-neon-orange" />
        </motion.div>
    );
};

export default WeaknessReport;
