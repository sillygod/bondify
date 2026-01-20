/**
 * Speech Recognition Hook
 * Wraps Web Speech API for voice recording and transcription
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition?: new () => SpeechRecognition;
        webkitSpeechRecognition?: new () => SpeechRecognition;
    }
}

export interface UseSpeechRecognitionResult {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
    interimTranscript: string;
    confidence: number;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Check browser support
    const isSupported = typeof window !== 'undefined' &&
        (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

    // Initialize recognition
    useEffect(() => {
        if (!isSupported) return;

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) return;

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';
            let final = '';
            let conf = 0;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const text = result[0].transcript;

                if (result.isFinal) {
                    final += text;
                    conf = result[0].confidence;
                } else {
                    interim += text;
                }
            }

            if (final) {
                setTranscript(prev => prev + final);
                setConfidence(conf);
            }
            setInterimTranscript(interim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [isSupported]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported) {
            setError('Speech recognition not supported');
            return;
        }

        try {
            setTranscript('');
            setInterimTranscript('');
            setConfidence(0);
            setError(null);
            recognitionRef.current.start();
        } catch (err) {
            console.error('Failed to start recognition:', err);
            setError('Failed to start microphone');
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setConfidence(0);
        setError(null);
    }, []);

    return {
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        confidence,
        error,
        startListening,
        stopListening,
        resetTranscript,
    };
}
