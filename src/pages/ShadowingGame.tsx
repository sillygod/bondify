/**
 * Shadowing Game - Follow-along Pronunciation Practice
 * Cyberpunk Neon Visual Style
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    MicOff,
    Play,
    RotateCcw,
    ArrowLeft,
    Trophy,
    Volume2,
    ChevronRight,
    Sparkles,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLayoutControl } from '@/hooks/useLayoutControl';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { speak, stopSpeech } from '@/lib/api/tts';
import { WaveformVisualizer } from '@/components/shadowing/WaveformVisualizer';
import {
    shadowingCategories,
    getRandomSentences,
    calculateSimilarity,
    getScoreGrade,
    ShadowingSentence,
    ShadowingCategory,
} from '@/data/shadowingData';

type GameState = 'menu' | 'playing' | 'recording' | 'result' | 'summary';

const ShadowingGame = () => {
    const navigate = useNavigate();
    const { setHideHeader } = useLayoutControl();

    // Game state
    const [gameState, setGameState] = useState<GameState>('menu');
    const [selectedCategory, setSelectedCategory] = useState<ShadowingCategory | null>(null);
    const [sentences, setSentences] = useState<ShadowingSentence[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scores, setScores] = useState<number[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);

    // Speech recognition
    const {
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        error: speechError,
        startListening,
        stopListening,
        resetTranscript,
    } = useSpeechRecognition();

    const currentSentence = sentences[currentIndex];
    const totalSentences = 5;

    const { resetProgress } = useGameProgress({
        gameState: gameState === 'summary' ? 'ended' : 'playing',
        score: scores.reduce((a, b) => a + b, 0),
        wordsLearned: currentIndex,
    });

    // Hide header during game
    useEffect(() => {
        if (gameState !== 'menu' && gameState !== 'summary') {
            setHideHeader(true);
        } else {
            setHideHeader(false);
        }
        return () => setHideHeader(false);
    }, [gameState, setHideHeader]);

    // Start game with selected category
    const startGame = useCallback((category: ShadowingCategory) => {
        setSelectedCategory(category);
        const randomSentences = getRandomSentences(category.id, totalSentences);
        setSentences(randomSentences);
        setCurrentIndex(0);
        setScores([]);
        resetTranscript();
        resetProgress();
        setGameState('playing');
    }, [resetTranscript, resetProgress]);

    // Play TTS for current sentence
    const playSentence = useCallback(() => {
        if (!currentSentence || isPlaying) return;
        setIsPlaying(true);
        speak(currentSentence.sentence, () => setIsPlaying(false));
    }, [currentSentence, isPlaying]);

    // Start recording
    const beginRecording = useCallback(() => {
        if (!isSupported) return;
        resetTranscript();
        startListening();
        setGameState('recording');
    }, [isSupported, resetTranscript, startListening]);

    // Stop recording and calculate score
    const finishRecording = useCallback(() => {
        stopListening();

        // Small delay to ensure transcript is final
        setTimeout(() => {
            const score = calculateSimilarity(currentSentence?.sentence || '', transcript);
            setScores(prev => [...prev, score]);
            setGameState('result');
        }, 500);
    }, [stopListening, currentSentence, transcript]);

    // Next sentence or show summary
    const nextSentence = useCallback(() => {
        if (currentIndex >= sentences.length - 1) {
            setGameState('summary');
        } else {
            setCurrentIndex(prev => prev + 1);
            resetTranscript();
            setGameState('playing');
        }
    }, [currentIndex, sentences.length, resetTranscript]);

    // Retry current sentence
    const retrySentence = useCallback(() => {
        setScores(prev => prev.slice(0, -1));
        resetTranscript();
        setGameState('playing');
    }, [resetTranscript]);

    // Calculate average score
    const averageScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const currentScore = scores[scores.length - 1] || 0;
    const scoreGrade = getScoreGrade(currentScore);
    const finalGrade = getScoreGrade(averageScore);

    return (
        <div className="min-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => gameState === 'menu' ? navigate('/') : setGameState('menu')}
                        className="hover:bg-primary/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                            Shadowing Practice
                        </h1>
                        <p className="text-sm text-muted-foreground">Follow along and improve your pronunciation</p>
                    </div>
                </div>

                {gameState !== 'menu' && gameState !== 'summary' && (
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Progress</p>
                            <p className="font-display font-bold text-xl">{currentIndex + 1}/{totalSentences}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Browser Support Warning */}
            {!isSupported && gameState === 'menu' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    <p className="text-sm text-orange-200">
                        Your browser doesn't fully support speech recognition. Please use Chrome or Edge for the best experience.
                    </p>
                </motion.div>
            )}

            {/* Game Content */}
            <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {/* Category Selection Menu */}
                    {gameState === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-4xl"
                        >
                            <div className="text-center mb-8">
                                <motion.div
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="inline-block mb-6"
                                >
                                    <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30">
                                        <Volume2 className="w-16 h-16 text-white" />
                                    </div>
                                </motion.div>
                                <h2 className="font-display text-3xl font-bold mb-3">Choose a Topic</h2>
                                <p className="text-muted-foreground">Practice everyday English sentences</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {shadowingCategories.map((category, index) => (
                                    <motion.button
                                        key={category.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => startGame(category)}
                                        className="group relative p-6 rounded-2xl border border-border/30 bg-card hover:border-primary/50 transition-all duration-300 text-left overflow-hidden"
                                    >
                                        {/* Gradient background on hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                        <div className="relative z-10">
                                            <span className="text-4xl mb-3 block">{category.icon}</span>
                                            <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {category.sentences.length} sentences
                                            </p>
                                        </div>

                                        <ChevronRight className="absolute right-4 bottom-4 w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Playing State - Listen */}
                    {(gameState === 'playing' || gameState === 'recording') && currentSentence && (
                        <motion.div
                            key={`sentence-${currentIndex}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full max-w-3xl"
                        >
                            {/* Progress bar */}
                            <div className="mb-8">
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-cyan-400 to-pink-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentIndex + 1) / totalSentences) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Sentence Card */}
                            <motion.div
                                className="relative rounded-3xl p-8 mb-8 overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                }}
                            >
                                {/* Animated border glow */}
                                <motion.div
                                    className="absolute inset-0 rounded-3xl"
                                    animate={{
                                        boxShadow: [
                                            '0 0 20px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.1)',
                                            '0 0 30px rgba(168, 85, 247, 0.4), inset 0 0 30px rgba(168, 85, 247, 0.1)',
                                            '0 0 20px rgba(236, 72, 153, 0.3), inset 0 0 20px rgba(236, 72, 153, 0.1)',
                                            '0 0 20px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.1)',
                                        ],
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />

                                <div className="relative z-10">
                                    {/* Category badge */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-2xl">{selectedCategory?.icon}</span>
                                        <span className="text-sm text-muted-foreground">{selectedCategory?.name}</span>
                                        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${currentSentence.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                                currentSentence.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {currentSentence.difficulty}
                                        </span>
                                    </div>

                                    {/* Sentence */}
                                    <p className="text-2xl md:text-3xl font-medium leading-relaxed mb-4 text-center">
                                        {currentSentence.sentence}
                                    </p>

                                    {/* Translation */}
                                    <p className="text-center text-muted-foreground text-sm">
                                        {currentSentence.translation}
                                    </p>

                                    {/* Listen button */}
                                    <div className="flex justify-center mt-6">
                                        <Button
                                            onClick={playSentence}
                                            disabled={isPlaying}
                                            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
                                        >
                                            <Volume2 className={`w-4 h-4 mr-2 ${isPlaying ? 'animate-pulse' : ''}`} />
                                            {isPlaying ? 'Playing...' : 'Listen'}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Waveform Visualizer */}
                            <div className="h-32 mb-8">
                                <WaveformVisualizer
                                    isActive={gameState === 'recording'}
                                    color="#22d3ee"
                                    className="h-full"
                                />
                            </div>

                            {/* Transcript display */}
                            {gameState === 'recording' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center mb-6 min-h-[60px]"
                                >
                                    <p className="text-lg text-cyan-400">
                                        {transcript || interimTranscript || 'Listening...'}
                                    </p>
                                </motion.div>
                            )}

                            {/* Record button */}
                            <div className="flex justify-center">
                                {gameState === 'playing' ? (
                                    <motion.button
                                        onClick={beginRecording}
                                        disabled={!isSupported}
                                        className="relative p-8 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500"
                                            animate={{
                                                boxShadow: [
                                                    '0 0 30px rgba(6, 182, 212, 0.5)',
                                                    '0 0 50px rgba(168, 85, 247, 0.5)',
                                                    '0 0 30px rgba(236, 72, 153, 0.5)',
                                                    '0 0 30px rgba(6, 182, 212, 0.5)',
                                                ],
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <Mic className="relative w-10 h-10 text-white" />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        onClick={finishRecording}
                                        className="relative p-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.div
                                            className="absolute inset-0 rounded-full"
                                            animate={{
                                                boxShadow: [
                                                    '0 0 30px rgba(239, 68, 68, 0.5)',
                                                    '0 0 50px rgba(239, 68, 68, 0.7)',
                                                    '0 0 30px rgba(239, 68, 68, 0.5)',
                                                ],
                                            }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                        />
                                        <MicOff className="relative w-10 h-10 text-white" />
                                    </motion.button>
                                )}
                            </div>

                            <p className="text-center text-sm text-muted-foreground mt-4">
                                {gameState === 'playing'
                                    ? 'Click the microphone to start recording'
                                    : 'Click to stop recording'}
                            </p>
                        </motion.div>
                    )}

                    {/* Result State */}
                    {gameState === 'result' && currentSentence && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-2xl text-center"
                        >
                            {/* Score display */}
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', damping: 15 }}
                                className="mb-8"
                            >
                                <div className="relative inline-block">
                                    <motion.div
                                        className={`text-9xl font-display font-bold ${scoreGrade.color}`}
                                        animate={{
                                            textShadow: [
                                                `0 0 20px currentColor`,
                                                `0 0 40px currentColor`,
                                                `0 0 20px currentColor`,
                                            ],
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        {scoreGrade.grade}
                                    </motion.div>
                                    <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 animate-pulse" />
                                </div>
                                <p className="text-2xl mt-4">{currentScore}%</p>
                                <p className="text-muted-foreground">{scoreGrade.message}</p>
                            </motion.div>

                            {/* Comparison */}
                            <div className="glass-card rounded-2xl p-6 mb-6 text-left space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Original</p>
                                    <p className="text-lg">{currentSentence.sentence}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">You said</p>
                                    <p className="text-lg text-cyan-400">{transcript || '(No speech detected)'}</p>
                                </div>
                                {currentSentence.tips && (
                                    <div className="pt-4 border-t border-border/30">
                                        <p className="text-sm text-muted-foreground mb-1">💡 Tip</p>
                                        <p className="text-sm">{currentSentence.tips}</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={retrySentence}
                                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={nextSentence}
                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
                                >
                                    {currentIndex >= sentences.length - 1 ? 'See Results' : 'Next'}
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Summary State */}
                    {gameState === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-lg text-center"
                        >
                            <motion.div
                                animate={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.5 }}
                                className="inline-block mb-6"
                            >
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30">
                                    <Trophy className="w-12 h-12 text-white" />
                                </div>
                            </motion.div>

                            <h2 className="font-display text-3xl font-bold mb-2">Practice Complete!</h2>
                            <p className="text-muted-foreground mb-8">
                                You've completed the {selectedCategory?.name} theme
                            </p>

                            {/* Stats */}
                            <div className="glass-card rounded-2xl p-6 mb-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className={`text-5xl font-bold ${finalGrade.color}`}>{finalGrade.grade}</p>
                                        <p className="text-sm text-muted-foreground mt-1">Overall Grade</p>
                                    </div>
                                    <div>
                                        <p className="text-5xl font-bold text-cyan-400">{averageScore}%</p>
                                        <p className="text-sm text-muted-foreground mt-1">Average Score</p>
                                    </div>
                                </div>

                                {/* Individual scores */}
                                <div className="mt-6 pt-6 border-t border-border/30">
                                    <p className="text-sm text-muted-foreground mb-3">Score Breakdown</p>
                                    <div className="flex justify-center gap-2">
                                        {scores.map((score, i) => (
                                            <div
                                                key={i}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${score >= 80 ? 'bg-green-500/20 text-green-400' :
                                                        score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-red-500/20 text-red-400'
                                                    }`}
                                            >
                                                {score}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setGameState('menu')}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Pick Another Topic
                                </Button>
                                <Button
                                    onClick={() => startGame(selectedCategory!)}
                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Play Again
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ShadowingGame;
