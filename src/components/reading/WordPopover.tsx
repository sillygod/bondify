import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Volume2, Plus, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WordDefinition } from "@/lib/api/vocabulary";
import { useAddWord } from "@/hooks/useWordlist";
import { useToast } from "@/hooks/use-toast";

interface WordPopoverProps {
    word: string;
    definition: WordDefinition | null;
    isLoading: boolean;
    position: { x: number; y: number };
    onClose: () => void;
}

/**
 * Popover component for displaying word definition and adding to wordlist.
 */
export function WordPopover({
    word,
    definition,
    isLoading,
    position,
    onClose,
}: WordPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const addWord = useAddWord();
    const { toast } = useToast();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleSpeak = () => {
        if (!definition) return;
        const utterance = new SpeechSynthesisUtterance(definition.word);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
    };

    const handleAddToWordlist = async () => {
        try {
            await addWord.mutateAsync({ word });
            toast({
                title: "Word added!",
                description: `"${word}" has been added to your wordlist`,
            });
            onClose();
        } catch (error: any) {
            if (error?.message?.includes("already")) {
                toast({
                    title: "Already in wordlist",
                    description: `"${word}" is already in your wordlist`,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to add word to wordlist",
                    variant: "destructive",
                });
            }
        }
    };

    // Calculate position (centered above/below the word)
    const style = {
        left: Math.max(16, Math.min(position.x - 160, window.innerWidth - 336)),
        top: position.y + 8,
    };

    return (
        <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed z-50 w-80 glass-card rounded-xl p-4 shadow-2xl border border-primary/30"
            style={style}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg text-primary">{word}</span>
                    {definition && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleSpeak}
                        >
                            <Volume2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : definition ? (
                <div className="space-y-3">
                    {/* Part of speech & Pronunciation */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="italic">{definition.partOfSpeech}</span>
                        {definition.pronunciation && (
                            <span className="font-mono text-xs">
                                /{definition.pronunciation.ipa}/
                            </span>
                        )}
                    </div>

                    {/* Definition */}
                    <p className="text-sm">{definition.definition}</p>

                    {/* Example sentences */}
                    {definition.meanings && definition.meanings.length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Example:</p>
                            <p className="text-sm italic text-muted-foreground">
                                "{definition.meanings[0].example}"
                            </p>
                        </div>
                    )}

                    {/* Add to Wordlist button */}
                    <Button
                        onClick={handleAddToWordlist}
                        disabled={addWord.isPending}
                        className="w-full gap-2 mt-2"
                        size="sm"
                    >
                        {addWord.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        Add to Wordlist
                    </Button>
                </div>
            ) : (
                <div className="text-center py-6 text-muted-foreground">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                        Couldn't find definition for "{word}"
                    </p>
                </div>
            )}
        </motion.div>
    );
}
