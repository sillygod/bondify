import { useEffect, useState } from "react";
import {
    FileText,
    CheckCircle,
    Clock,
    Book,
    TrendingUp,
    BarChart3
} from "lucide-react";
import { StatsCard } from "../components/StatsCard";
import { api } from "@/lib/api";

interface QuestionStats {
    [gameType: string]: {
        total: number;
        reviewed: number;
    };
}

interface CacheStats {
    cached_words: number;
    total_lookups: number;
}

export const AdminDashboard = () => {
    const [questionStats, setQuestionStats] = useState<QuestionStats>({});
    const [cacheStats, setCacheStats] = useState<CacheStats>({ cached_words: 0, total_lookups: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [qStats, cStats] = await Promise.all([
                    api.get<any>('/api/admin/questions/stats'),
                    api.get<any>('/api/admin/vocabulary/cache-stats'),
                ]);

                setQuestionStats(qStats.stats || {});
                setCacheStats(cStats);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Calculate totals
    const totalQuestions = Object.values(questionStats).reduce((sum, s) => sum + s.total, 0);
    const totalReviewed = Object.values(questionStats).reduce((sum, s) => sum + s.reviewed, 0);
    const pendingReview = totalQuestions - totalReviewed;
    const gameTypesCount = Object.keys(questionStats).length;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
                <p className="text-gray-500">Overview of your AI question database</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Questions"
                    value={totalQuestions}
                    change={`${gameTypesCount} game types`}
                    changeType="neutral"
                    icon={FileText}
                    iconColor="text-cyan-400"
                />
                <StatsCard
                    title="Reviewed"
                    value={totalReviewed}
                    change={totalQuestions > 0 ? `${Math.round((totalReviewed / totalQuestions) * 100)}% of total` : "0%"}
                    changeType="positive"
                    icon={CheckCircle}
                    iconColor="text-emerald-400"
                />
                <StatsCard
                    title="Pending Review"
                    value={pendingReview}
                    change="Needs attention"
                    changeType={pendingReview > 0 ? "negative" : "neutral"}
                    icon={Clock}
                    iconColor="text-amber-400"
                />
                <StatsCard
                    title="Cached Words"
                    value={cacheStats.cached_words}
                    change={`${cacheStats.total_lookups} lookups`}
                    changeType="positive"
                    icon={Book}
                    iconColor="text-purple-400"
                />
            </div>

            {/* Game Types Breakdown */}
            <div className="bg-[#0d1321] border border-[#1a2744] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Questions by Game Type</h2>
                        <p className="text-sm text-gray-500">Distribution across all supported games</p>
                    </div>
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                    </div>
                ) : Object.keys(questionStats).length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">No questions generated yet</p>
                        <p className="text-sm text-gray-600 mt-1">Go to Generate page to create questions</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(questionStats).map(([gameType, stats]) => {
                            const reviewedPercent = stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0;
                            return (
                                <div key={gameType} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-white capitalize">
                                            {gameType.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {stats.reviewed}/{stats.total} reviewed
                                        </span>
                                    </div>
                                    <div className="h-2 bg-[#1a2744] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                                            style={{ width: `${reviewedPercent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                    href="/admin/generate"
                    className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/50 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30 transition-colors">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Generate Questions</h3>
                            <p className="text-sm text-gray-500">Create new AI-powered questions</p>
                        </div>
                    </div>
                </a>

                <a
                    href="/admin/questions"
                    className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Manage Questions</h3>
                            <p className="text-sm text-gray-500">Review and edit question bank</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    );
};

export default AdminDashboard;
