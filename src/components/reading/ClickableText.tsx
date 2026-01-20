import { useCallback } from "react";

interface ClickableTextProps {
    text: string;
    onWordClick: (word: string, rect: DOMRect) => void;
}

/**
 * Component that renders text with clickable words.
 * Each word can be clicked to trigger a lookup.
 */
export function ClickableText({ text, onWordClick }: ClickableTextProps) {
    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLSpanElement>, word: string) => {
            // Clean the word (remove punctuation)
            const cleanWord = word.replace(/[^a-zA-Z'-]/g, "");
            if (cleanWord.length < 2) return;

            const rect = e.currentTarget.getBoundingClientRect();
            onWordClick(cleanWord, rect);
        },
        [onWordClick]
    );

    // Split text into paragraphs, then sentences, then words
    const paragraphs = text.split(/\n\n+/);

    return (
        <div className="space-y-4">
            {paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="leading-relaxed">
                    {paragraph.split(/\s+/).map((word, wIndex) => {
                        // Check if the word has any letters
                        const hasLetters = /[a-zA-Z]/.test(word);

                        if (!hasLetters) {
                            return <span key={wIndex}>{word} </span>;
                        }

                        return (
                            <span
                                key={wIndex}
                                onClick={(e) => handleClick(e, word)}
                                className="cursor-pointer hover:bg-primary/20 hover:text-primary px-0.5 rounded transition-colors"
                            >
                                {word}
                            </span>
                        );
                    }).reduce((acc: React.ReactNode[], el, idx, arr) => {
                        acc.push(el);
                        if (idx < arr.length - 1) {
                            acc.push(" ");
                        }
                        return acc;
                    }, [])}
                </p>
            ))}
        </div>
    );
}
