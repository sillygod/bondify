/**
 * Waveform Visualizer Component
 * Real-time audio visualization with neon cyberpunk style
 */

import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
    isActive: boolean;
    color?: string;
    barCount?: number;
    className?: string;
}

export function WaveformVisualizer({
    isActive,
    color = '#22d3ee',
    barCount = 40,
    className = '',
}: WaveformVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / barCount;
        const gap = 2;
        const maxBarHeight = canvas.height * 0.8;

        // Sample the frequency data
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
            const dataIndex = i * step;
            const value = dataArray[dataIndex] || 0;
            const barHeight = (value / 255) * maxBarHeight;
            const x = i * barWidth + gap / 2;
            const y = (canvas.height - barHeight) / 2;

            // Create gradient
            const gradient = ctx.createLinearGradient(x, y + barHeight, x, y);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, color);
            gradient.addColorStop(1, `${color}88`);

            ctx.fillStyle = gradient;

            // Draw bar with rounded corners
            const radius = Math.min(barWidth / 2 - gap, 4);
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth - gap, barHeight, radius);
            ctx.fill();

            // Glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        animationRef.current = requestAnimationFrame(draw);
    }, [barCount, color]);

    const drawIdleAnimation = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const time = Date.now() / 1000;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / barCount;
        const gap = 2;

        for (let i = 0; i < barCount; i++) {
            // Idle wave animation
            const phase = (i / barCount) * Math.PI * 2;
            const wave = Math.sin(time * 2 + phase) * 0.3 + 0.3;
            const barHeight = wave * canvas.height * 0.3 + 5;

            const x = i * barWidth + gap / 2;
            const y = (canvas.height - barHeight) / 2;

            ctx.fillStyle = `${color}44`;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth - gap, barHeight, 2);
            ctx.fill();
        }

        animationRef.current = requestAnimationFrame(drawIdleAnimation);
    }, [barCount, color]);

    useEffect(() => {
        if (!isActive) {
            // Stop media stream
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
            analyserRef.current = null;

            // Run idle animation
            drawIdleAnimation();
            return;
        }

        // Start microphone capture
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaStreamRef.current = stream;
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                analyserRef.current = analyser;

                draw();
            })
            .catch(err => {
                console.error('Microphone access denied:', err);
            });

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isActive, draw, drawIdleAnimation]);

    // Handle canvas resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                canvas.width = entry.contentRect.width * window.devicePixelRatio;
                canvas.height = entry.contentRect.height * window.devicePixelRatio;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                }
            }
        });

        resizeObserver.observe(canvas);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <motion.div
            className={`relative ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Glow backdrop */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 blur-2xl opacity-30"
                    style={{ backgroundColor: color }}
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
            />
        </motion.div>
    );
}
