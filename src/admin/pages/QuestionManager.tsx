import { useState, useEffect } from "react";
import {
    FileText,
    CheckCircle,
    XCircle,
    Filter,
    RefreshCw,
    Eye,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
    id: number;
    difficulty: string;
    is_reviewed: boolean;
    [key: string]: any;
}

const GAME_TYPES = [
    "clarity", "transitions", "brevity", "context", "diction",
    "punctuation", "listening", "speed_reading", "word_parts",
    "rocket", "rephrase", "recall", "attention"
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Detail Modal Component
const QuestionDetailModal = ({
    question,
    onClose,
    onReview,
}: {
    question: Question;
    onClose: () => void;
    onReview: (id: number, reviewed: boolean) => void;
}) => {
    // Extract display fields (exclude metadata)
    const { id, difficulty, is_reviewed, ...questionData } = question;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#0d1321] border border-[#1a2744] rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2744] bg-[#1a2744]/50">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400">Question</span>
                        <span className="text-white font-bold">#{id}</span>
                        <span className="px-2 py-1 text-xs font-medium rounded-md bg-[#2a3a5a] text-gray-300 capitalize">
                            {difficulty}
                        </span>
                        {is_reviewed ? (
                            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-emerald-500/20 text-emerald-400">
                                <CheckCircle className="w-3 h-3" />
                                Reviewed
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-amber-500/20 text-amber-400">
                                <XCircle className="w-3 h-3" />
                                Pending
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a3a5a] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-auto max-h-[60vh]">
                    <div className="space-y-4">
                        {Object.entries(questionData).map(([key, value]) => (
                            <div key={key} className="bg-[#1a2744]/50 rounded-xl p-4">
                                <label className="block text-xs font-medium text-cyan-400 uppercase tracking-wider mb-2">
                                    {key.replace(/_/g, " ")}
                                </label>
                                <div className="text-white">
                                    {typeof value === "object" ? (
                                        <pre className="text-sm whitespace-pre-wrap bg-[#0a0e1a] rounded-lg p-3 overflow-auto">
                                            {JSON.stringify(value, null, 2)}
                                        </pre>
                                    ) : (
                                        <p className="text-sm leading-relaxed">{String(value)}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1a2744] bg-[#1a2744]/30">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a3a5a] transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            onReview(id, !is_reviewed);
                            onClose();
                        }}
                        className={cn(
                            "px-4 py-2 rounded-lg font-medium transition-colors",
                            is_reviewed
                                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        )}
                    >
                        {is_reviewed ? "Unmark as Reviewed" : "Approve"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const QuestionManager = () => {
    const [selectedType, setSelectedType] = useState<string>("clarity");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<"all" | "reviewed" | "pending">("all");
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/api/game-questions/${selectedType}?limit=50`
            );
            if (res.ok) {
                const data = await res.json();
                setQuestions(data.questions || []);
            }
        } catch (error) {
            console.error("Failed to fetch questions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [selectedType]);

    const handleReview = async (questionId: number, reviewed: boolean) => {
        try {
            const res = await fetch(
                `${API_BASE}/api/game-questions/${questionId}/review?reviewed=${reviewed}`,
                { method: "PATCH" }
            );
            if (res.ok) {
                setQuestions((prev) =>
                    prev.map((q) =>
                        q.id === questionId ? { ...q, is_reviewed: reviewed } : q
                    )
                );
            }
        } catch (error) {
            console.error("Failed to update review status:", error);
        }
    };

    const filteredQuestions = questions.filter((q) => {
        if (filter === "reviewed") return q.is_reviewed;
        if (filter === "pending") return !q.is_reviewed;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Detail Modal */}
            {selectedQuestion && (
                <QuestionDetailModal
                    question={selectedQuestion}
                    onClose={() => setSelectedQuestion(null)}
                    onReview={handleReview}
                />
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Question Manager</h1>
                    <p className="text-gray-500">Review and manage AI-generated questions</p>
                </div>
                <button
                    onClick={fetchQuestions}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a2744] border border-[#2a3a5a] rounded-lg text-gray-300 hover:bg-[#2a3a5a] transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    Refresh
                </button>
            </div>

            {/* Game Type Selector */}
            <div className="flex flex-wrap gap-2">
                {GAME_TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                            selectedType === type
                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                : "bg-[#1a2744] text-gray-400 border border-transparent hover:text-white"
                        )}
                    >
                        {type.replace(/_/g, " ")}
                    </button>
                ))}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <div className="flex gap-2">
                    {(["all", "reviewed", "pending"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3 py-1 rounded-md text-sm font-medium transition-all capitalize",
                                filter === f
                                    ? "bg-[#1a2744] text-white"
                                    : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <span className="text-sm text-gray-500 ml-auto">
                    {filteredQuestions.length} questions
                </span>
            </div>

            {/* Questions Table */}
            <div className="bg-[#0d1321] border border-[#1a2744] rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">No questions found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-[#1a2744]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Preview
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Difficulty
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a2744]">
                            {filteredQuestions.map((question) => (
                                <tr
                                    key={question.id}
                                    className="hover:bg-[#1a2744]/50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedQuestion(question)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        #{question.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                                        {JSON.stringify(question).slice(0, 80)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium rounded-md bg-[#1a2744] text-gray-300 capitalize">
                                            {question.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {question.is_reviewed ? (
                                            <span className="flex items-center gap-1 text-emerald-400 text-sm">
                                                <CheckCircle className="w-4 h-4" />
                                                Reviewed
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-amber-400 text-sm">
                                                <XCircle className="w-4 h-4" />
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedQuestion(question);
                                                }}
                                                className="px-3 py-1 rounded-md text-xs font-medium bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReview(question.id, !question.is_reviewed);
                                                }}
                                                className={cn(
                                                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                                    question.is_reviewed
                                                        ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                                        : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                                )}
                                            >
                                                {question.is_reviewed ? "Unmark" : "Approve"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default QuestionManager;

