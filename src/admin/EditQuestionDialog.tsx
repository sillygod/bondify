import { useState, useEffect } from "react";
import { X, Save, AlertTriangle, Check } from "lucide-react";
import { Question } from "./api";
import { cn } from "@/lib/utils";

interface EditQuestionDialogProps {
    question: Question;
    onClose: () => void;
    onSave: (id: number, updates: Partial<Question>) => Promise<void>;
}

export const EditQuestionDialog = ({
    question,
    onClose,
    onSave,
}: EditQuestionDialogProps) => {
    const [jsonContent, setJsonContent] = useState("");
    const [difficulty, setDifficulty] = useState(question.difficulty);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Initialize state from question
    useEffect(() => {
        // Extract everything except metadata to form the JSON body
        const { id, difficulty, is_reviewed, ...rest } = question;
        setJsonContent(JSON.stringify(rest, null, 2));
        setDifficulty(question.difficulty);
    }, [question]);

    const handleSave = async () => {
        setError(null);
        setSaving(true);

        try {
            // Validate JSON
            let parsedContent;
            try {
                parsedContent = JSON.parse(jsonContent);
            } catch (e) {
                throw new Error("Invalid JSON format. Please check your syntax.");
            }

            // Prepare updates
            const updates: Partial<Question> = {
                question_json: parsedContent, // Send as object, backend handles it
                difficulty,
            };

            await onSave(question.id, updates);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-[#0d1321] border border-[#1a2744] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2744] bg-[#1a2744]/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white">Edit Question #{question.id}</h2>
                        <div className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            {question.game_type}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a3a5a] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full bg-[#1a2744] border border-[#2a3a5a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        {/* Read-only info */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Status</label>
                            <div className="w-full bg-[#1a2744]/50 border border-[#2a3a5a] rounded-lg px-3 py-2 text-gray-400 flex items-center gap-2">
                                {question.is_reviewed ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        <span>Reviewed</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        <span>Pending Review</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
                        <label className="text-sm font-medium text-gray-400 flex items-center justify-between">
                            <span>Question Content (JSON)</span>
                            <span className="text-xs text-gray-500">Edit raw JSON structure</span>
                        </label>
                        <textarea
                            value={jsonContent}
                            onChange={(e) => setJsonContent(e.target.value)}
                            className="flex-1 w-full bg-[#0a0e1a] border border-[#2a3a5a] rounded-xl p-4 font-mono text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed"
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1a2744] bg-[#1a2744]/30 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a3a5a] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
