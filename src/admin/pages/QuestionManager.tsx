import { useState, useEffect } from "react";
import {
    FileText,
    CheckCircle,
    XCircle,
    Filter,
    RefreshCw,
    Eye,
    X,
    Trash2,
    Pencil,
    LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getQuestions,
    updateReviewStatus,
    deleteQuestion,
    updateQuestion,
    Question
} from "../api";
import { EditQuestionDialog } from "../EditQuestionDialog";
import { toast } from "sonner";
import { GAME_TYPES } from "../constants";
import { ConfirmDialog, useConfirmDialog } from "../ConfirmDialog";

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
    const { id, difficulty, is_reviewed, game_type, ...questionData } = question;

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
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const { confirm, dialogProps } = useConfirmDialog();

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const data = await getQuestions(selectedType);
            setQuestions(data.questions || []);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
            toast.error("Failed to fetch questions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [selectedType]);

    const handleReview = async (questionId: number, reviewed: boolean) => {
        try {
            await updateReviewStatus(questionId, reviewed);
            setQuestions((prev) =>
                prev.map((q) =>
                    q.id === questionId ? { ...q, is_reviewed: reviewed } : q
                )
            );
            toast.success(reviewed ? "Marked as reviewed" : "Unmarked as reviewed");
        } catch (error) {
            console.error("Failed to update review status:", error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (questionId: number) => {
        const confirmed = await confirm({
            title: "Delete Question",
            message: "Are you sure you want to delete this question? This action cannot be undone.",
            variant: "danger",
        });

        if (!confirmed) return;

        try {
            await deleteQuestion(questionId);
            setQuestions((prev) => prev.filter((q) => q.id !== questionId));
            toast.success("Question deleted successfully");
        } catch (error) {
            console.error("Failed to delete question:", error);
            toast.error("Failed to delete question");
        }
    };

    const handleUpdate = async (id: number, updates: Partial<Question>) => {
        try {
            const updated = await updateQuestion(id, updates);
            setQuestions((prev) =>
                prev.map((q) => q.id === id ? { ...q, ...updated } : q)
            );
            toast.success("Question updated successfully");
        } catch (error) {
            console.error("Failed to update question:", error);
            throw error; // Let the dialog handle the error display
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

            {/* Edit Modal */}
            {editingQuestion && (
                <EditQuestionDialog
                    question={editingQuestion}
                    onClose={() => setEditingQuestion(null)}
                    onSave={handleUpdate}
                />
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog {...dialogProps} confirmText="Delete" />

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
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                            selectedType === type.id
                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                : "bg-[#1a2744] text-gray-400 border border-transparent hover:text-white"
                        )}
                    >
                        {type.label}
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
                            {filteredQuestions.map((question) => {
                                // Prepare preview text safely
                                const { id, difficulty, is_reviewed, ...rest } = question;
                                const previewText = JSON.stringify(rest).slice(0, 60) + "...";

                                return (
                                    <tr
                                        key={question.id}
                                        className="hover:bg-[#1a2744]/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedQuestion(question)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            #{question.id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <code className="px-2 py-1 rounded bg-[#0a0e1a] text-cyan-400/80 text-xs font-mono">
                                                    {previewText}
                                                </code>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn(
                                                "px-2 py-1 text-xs font-medium rounded-md capitalize",
                                                question.difficulty === 'hard' ? "bg-red-500/10 text-red-400" :
                                                    question.difficulty === 'easy' ? "bg-green-500/10 text-green-400" :
                                                        "bg-blue-500/10 text-blue-400"
                                            )}>
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
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => {
                                                        setEditingQuestion(question);
                                                    }}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a3a5a] transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(question.id)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <div className="w-px h-4 bg-[#2a3a5a] mx-1" />

                                                <button
                                                    onClick={() => handleReview(question.id, !question.is_reviewed)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                                                        question.is_reviewed
                                                            ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                                            : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                                    )}
                                                >
                                                    {question.is_reviewed ? "Unmark" : "Approve"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default QuestionManager;

