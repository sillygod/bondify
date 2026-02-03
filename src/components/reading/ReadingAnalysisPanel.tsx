/**
 * Reading Analysis Panel
 * Displays AI analysis results including summary, vocabulary, concepts, and grammar.
 */

import { motion } from "framer-motion";
import {
    FileText,
    BookOpen,
    Lightbulb,
    PenTool,
    Plus,
    Loader2,
    Sparkles,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReadingAnalysis } from "@/lib/api/reading";
import { addToWordlist } from "@/lib/api/wordlist";
import { useToast } from "@/hooks/use-toast";

interface ReadingAnalysisPanelProps {
    analysis: ReadingAnalysis | undefined;
    isAnalyzing: boolean;
    onAnalyze: () => void;
    hasAnalyzed: boolean;
}

export function ReadingAnalysisPanel({
    analysis,
    isAnalyzing,
    onAnalyze,
    hasAnalyzed,
}: ReadingAnalysisPanelProps) {
    const { toast } = useToast();
    const [expandedConcepts, setExpandedConcepts] = useState<Set<number>>(new Set());
    const [expandedGrammar, setExpandedGrammar] = useState<Set<number>>(new Set());
    const [addingWords, setAddingWords] = useState<Set<string>>(new Set());
    const [addedWords, setAddedWords] = useState<Set<string>>(new Set());

    const toggleConcept = (index: number) => {
        const newExpanded = new Set(expandedConcepts);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedConcepts(newExpanded);
    };

    const toggleGrammar = (index: number) => {
        const newExpanded = new Set(expandedGrammar);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedGrammar(newExpanded);
    };

    const handleAddWord = async (word: string, definition: string) => {
        if (addingWords.has(word) || addedWords.has(word)) return;

        setAddingWords(prev => new Set(prev).add(word));
        try {
            await addToWordlist(word, definition);
            setAddedWords(prev => new Set(prev).add(word));
            toast({
                title: "Word added",
                description: `"${word}" has been added to your word list`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add word to your list",
                variant: "destructive",
            });
        } finally {
            setAddingWords(prev => {
                const next = new Set(prev);
                next.delete(word);
                return next;
            });
        }
    };

    // Not yet analyzed - show trigger button
    if (!hasAnalyzed && !isAnalyzing) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 text-center"
            >
                <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-display font-bold text-lg mb-2">AI Reading Assistant</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Get vocabulary suggestions, a summary, key concepts, and grammar highlights
                </p>
                <Button onClick={onAnalyze} className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Analyze with AI
                </Button>
            </motion.div>
        );
    }

    // Analyzing - show loading
    if (isAnalyzing) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-6 text-center"
            >
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Analyzing article...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
            </motion.div>
        );
    }

    // No analysis data (error or empty)
    if (!analysis) {
        return (
            <div className="glass-card rounded-2xl p-6 text-center">
                <p className="text-muted-foreground">Analysis failed. Please try again.</p>
                <Button onClick={onAnalyze} variant="outline" className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    // Show analysis results
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Summary Section */}
            <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Summary</h3>
                    {analysis.cached && (
                        <Badge variant="outline" className="text-xs">Cached</Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.summary}
                </p>
            </div>

            {/* Suggested Words Section */}
            {analysis.suggestedWords.length > 0 && (
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-neon-green" />
                        <h3 className="font-semibold">Vocabulary to Learn</h3>
                        <Badge variant="outline" className="text-xs">
                            {analysis.suggestedWords.length}
                        </Badge>
                    </div>
                    <div className="space-y-3">
                        {analysis.suggestedWords.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-3 bg-background/50 rounded-lg border border-border/50"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <span className="font-medium text-primary">{item.word}</span>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            {item.definition}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={addedWords.has(item.word) ? "secondary" : "outline"}
                                        className="shrink-0 h-7 px-2"
                                        onClick={() => handleAddWord(item.word, item.definition)}
                                        disabled={addingWords.has(item.word) || addedWords.has(item.word)}
                                    >
                                        {addingWords.has(item.word) ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : addedWords.has(item.word) ? (
                                            "Added"
                                        ) : (
                                            <>
                                                <Plus className="w-3 h-3 mr-1" />
                                                Add
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-primary/30 pl-2">
                                    "{item.contextSentence}"
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Key Concepts Section */}
            {analysis.keyConcepts.length > 0 && (
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-neon-orange" />
                        <h3 className="font-semibold">Key Concepts</h3>
                    </div>
                    <div className="space-y-2">
                        {analysis.keyConcepts.map((item, index) => (
                            <div
                                key={index}
                                className="p-3 bg-background/50 rounded-lg border border-border/50 cursor-pointer"
                                onClick={() => toggleConcept(index)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{item.concept}</span>
                                    {expandedConcepts.has(index) ? (
                                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                                {expandedConcepts.has(index) && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="text-sm text-muted-foreground mt-2"
                                    >
                                        {item.explanation}
                                    </motion.p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Grammar Highlights Section */}
            {analysis.grammarHighlights.length > 0 && (
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <PenTool className="w-4 h-4 text-purple-400" />
                        <h3 className="font-semibold">Grammar Patterns</h3>
                    </div>
                    <div className="space-y-2">
                        {analysis.grammarHighlights.map((item, index) => (
                            <div
                                key={index}
                                className="p-3 bg-background/50 rounded-lg border border-border/50 cursor-pointer"
                                onClick={() => toggleGrammar(index)}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <Badge variant="secondary" className="shrink-0">
                                        {item.pattern}
                                    </Badge>
                                    {expandedGrammar.has(index) ? (
                                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                                {expandedGrammar.has(index) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-2"
                                    >
                                        <p className="text-sm italic text-muted-foreground border-l-2 border-purple-400/30 pl-2">
                                            "{item.sentence}"
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {item.explanation}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default ReadingAnalysisPanel;
