import { useState } from "react";
import {
    Sparkles,
    Loader2,
    CheckCircle,
    AlertCircle,
    Play
} from "lucide-react";
import { cn } from "@/lib/utils";

const GAME_TYPES = [
    { id: "clarity", label: "Clarity", description: "Simplify wordy phrases" },
    { id: "transitions", label: "Transitions", description: "Choose transition words" },
    { id: "brevity", label: "Brevity", description: "Make sentences concise" },
    { id: "context", label: "Context", description: "Vocabulary in context" },
    { id: "diction", label: "Diction", description: "Word choice correctness" },
    { id: "punctuation", label: "Punctuation", description: "Punctuation practice" },
    { id: "listening", label: "Listening", description: "Conversation comprehension" },
    { id: "speed_reading", label: "Speed Reading", description: "Reading comprehension" },
    { id: "word_parts", label: "Word Parts", description: "Etymology breakdown" },
    { id: "rocket", label: "Rocket", description: "Synonym matching" },
    { id: "rephrase", label: "Rephrase", description: "Sentence improvement" },
    { id: "recall", label: "Recall", description: "Word recall from definition" },
    { id: "attention", label: "Attention", description: "Listening categorization" },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const GenerateQuestions = () => {
    const [selectedType, setSelectedType] = useState<string>("clarity");
    const [count, setCount] = useState<number>(5);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch(`${API_BASE}/api/game-questions/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    game_type: selectedType,
                    count: count,
                    difficulty: "medium",
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setResult({
                    success: true,
                    message: `Successfully generated ${data.generated} questions!`,
                    data: data.questions,
                });
            } else {
                setResult({
                    success: false,
                    message: data.detail?.detail || "Generation failed",
                });
            }
        } catch (error) {
            setResult({
                success: false,
                message: "Network error. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Generate Questions</h1>
                <p className="text-gray-500">Create new AI-powered questions for games</p>
            </div>

            {/* Game Type Selection */}
            <div className="bg-[#0d1321] border border-[#1a2744] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Select Game Type</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {GAME_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={cn(
                                "p-4 rounded-xl text-left transition-all border",
                                selectedType === type.id
                                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                                    : "bg-[#1a2744] border-transparent text-gray-400 hover:text-white hover:border-[#2a3a5a]"
                            )}
                        >
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs opacity-70 mt-1">{type.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Count Selection */}
            <div className="bg-[#0d1321] border border-[#1a2744] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Number of Questions</h2>
                <div className="flex gap-3">
                    {[1, 3, 5, 10, 15, 20].map((n) => (
                        <button
                            key={n}
                            onClick={() => setCount(n)}
                            className={cn(
                                "w-14 h-14 rounded-xl font-bold transition-all border",
                                count === n
                                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                                    : "bg-[#1a2744] border-transparent text-gray-400 hover:text-white"
                            )}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold text-lg hover:from-cyan-400 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Generate {count} Questions
                    </>
                )}
            </button>

            {/* Result */}
            {result && (
                <div
                    className={cn(
                        "rounded-2xl p-6 border",
                        result.success
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-red-500/10 border-red-500/30"
                    )}
                >
                    <div className="flex items-center gap-3 mb-4">
                        {result.success ? (
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-red-400" />
                        )}
                        <p className={cn("font-semibold", result.success ? "text-emerald-400" : "text-red-400")}>
                            {result.message}
                        </p>
                    </div>

                    {result.data && (
                        <div className="bg-[#0a0e1a] rounded-xl p-4 overflow-auto max-h-96">
                            <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                                {JSON.stringify(result.data, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GenerateQuestions;
