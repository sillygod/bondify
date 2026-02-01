import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Loader2 } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { getProgressHistory, ProgressHistoryDay } from "@/lib/api/progress";

type MetricType = "xp" | "reviews" | "accuracy";
type TimeRange = 7 | 30 | 90;

interface LearningCurveProps {
    className?: string;
}

const metricConfig = {
    xp: {
        label: "XP Earned",
        color: "hsl(270, 100%, 65%)", // primary purple
        format: (v: number) => v.toLocaleString(),
    },
    reviews: {
        label: "Reviews",
        color: "hsl(180, 100%, 50%)", // neon cyan
        format: (v: number) => v.toString(),
    },
    accuracy: {
        label: "Accuracy",
        color: "hsl(150, 100%, 50%)", // neon green
        format: (v: number) => `${Math.round(v * 100)}%`,
    },
};

const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 7, label: "7 Days" },
    { value: 30, label: "30 Days" },
    { value: 90, label: "90 Days" },
];

export const LearningCurve = ({ className }: LearningCurveProps) => {
    const [data, setData] = useState<ProgressHistoryDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<MetricType>("xp");
    const [timeRange, setTimeRange] = useState<TimeRange>(30);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getProgressHistory(timeRange);
                setData(response.data);
            } catch (err) {
                console.error("Error fetching progress history:", err);
                setError("Failed to load progress data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dayData = payload[0].payload as ProgressHistoryDay;
            return (
                <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-2">{formatDate(label)}</p>
                    <div className="space-y-1 text-xs">
                        <p className="text-primary">
                            <span className="text-muted-foreground">XP:</span>{" "}
                            {dayData.xp.toLocaleString()}
                        </p>
                        <p className="text-neon-cyan">
                            <span className="text-muted-foreground">Reviews:</span>{" "}
                            {dayData.reviews}
                        </p>
                        <p className="text-neon-green">
                            <span className="text-muted-foreground">Accuracy:</span>{" "}
                            {Math.round(dayData.accuracy * 100)}%
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const config = metricConfig[selectedMetric];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative overflow-hidden rounded-2xl p-6",
                "bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl border border-primary/30",
                "shadow-[0_0_20px_hsl(270_100%_65%/0.2)]",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-card/50 border border-primary/30">
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-lg">Learning Curve</h3>
                        <p className="text-xs text-muted-foreground">Your progress over time</p>
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
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric Selector */}
            <div className="flex items-center gap-2 mb-4">
                {(Object.keys(metricConfig) as MetricType[]).map((metric) => (
                    <button
                        key={metric}
                        onClick={() => setSelectedMetric(metric)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-full transition-all border",
                            selectedMetric === metric
                                ? "bg-primary/20 border-primary/50 text-primary"
                                : "border-border/50 text-muted-foreground hover:border-primary/30"
                        )}
                    >
                        {metricConfig[metric].label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="h-64">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        {error}
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <Calendar className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-sm">No data yet. Start learning!</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                opacity={0.3}
                            />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) =>
                                    selectedMetric === "accuracy" ? `${Math.round(v * 100)}%` : v
                                }
                                domain={selectedMetric === "accuracy" ? [0, 1] : ["auto", "auto"]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey={selectedMetric}
                                stroke={config.color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 6,
                                    fill: config.color,
                                    stroke: "hsl(var(--background))",
                                    strokeWidth: 2,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Summary Stats */}
            {!isLoading && !error && data.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/30">
                    <div className="text-center">
                        <p className="text-lg font-bold text-primary">
                            {data.reduce((sum, d) => sum + d.xp, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-neon-cyan">
                            {data.reduce((sum, d) => sum + d.reviews, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Reviews</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-neon-green">
                            {Math.round(
                                (data.filter((d) => d.accuracy > 0).reduce((sum, d) => sum + d.accuracy, 0) /
                                    Math.max(data.filter((d) => d.accuracy > 0).length, 1)) *
                                100
                            )}
                            %
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Accuracy</p>
                    </div>
                </div>
            )}

            {/* Decorative gradient blob */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 bg-primary" />
        </motion.div>
    );
};

export default LearningCurve;
