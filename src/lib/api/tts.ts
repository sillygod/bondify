/**
 * TTS (Text-to-Speech) API client
 * 
 * Uses the Piper TTS backend for high-quality speech synthesis.
 * Works with plain English text and Oxford respelling notation.
 */

/**
 * Synthesize speech from text
 * Returns an audio blob that can be played
 * 
 * @param text - Text to speak (can be English word or Oxford respelling like "ka-SHAY")
 * @returns Audio blob or null if synthesis fails
 */
export async function synthesizeSpeech(text: string): Promise<Blob | null> {
    if (!text || !text.trim()) {
        return null;
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/tts/speak`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            console.error('TTS API error:', response.status);
            return null;
        }

        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('TTS synthesis failed:', error);
        return null;
    }
}

/**
 * Play speech for the given text
 * 
 * Falls back to browser speechSynthesis if backend TTS is unavailable.
 * 
 * @param text - Text to speak
 * @param onEnd - Optional callback when audio finishes playing
 */
export async function speak(text: string, onEnd?: () => void): Promise<void> {
    if (!text || !text.trim()) {
        return;
    }

    try {
        // Try backend TTS first
        const blob = await synthesizeSpeech(text);

        if (blob && blob.size > 0) {
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audio.onended = () => {
                URL.revokeObjectURL(url);
                onEnd?.();
            };

            audio.onerror = () => {
                URL.revokeObjectURL(url);
                // Fallback to browser TTS on error
                fallbackSpeak(text, onEnd);
            };

            await audio.play();
            return;
        }
    } catch {
        // Fallback to browser TTS
    }

    // Fallback to browser speechSynthesis
    fallbackSpeak(text, onEnd);
}

/**
 * Fallback to browser's speechSynthesis API
 */
function fallbackSpeak(text: string, onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) {
        console.warn('Browser speechSynthesis not available');
        onEnd?.();
        return;
    }

    window.speechSynthesis.cancel();

    // Clean up respelling notation for browser TTS
    const cleanText = text.replace(/[–-]/g, ' ').replace(/\s+/g, ' ').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.7;
    utterance.onend = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
}

/**
 * Stop all speech
 */
export function stopSpeech(): void {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}
