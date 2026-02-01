import { motion } from "framer-motion";
import { Info, Coffee, AlertTriangle, Sparkles, BookOpen, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const About = () => {
    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                        <Info className="w-6 h-6 text-neon-purple" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold neon-text">About Bondify</h1>
                        <p className="text-muted-foreground">
                            Connect through Language
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-border/30 aspect-[21/9] w-full"
            >
                <img
                    src="/assets/about-hero.png"
                    alt="Futuristic Digital Library"
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col justify-end p-8">
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
                        Empower Your Learning with AI
                    </h2>
                    <p className="text-white/80 max-w-2xl drop-shadow-md">
                        Bondify combines advanced artificial intelligence with proven learning methodologies to create a personalized, immersive English learning experience.
                    </p>
                </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Mission Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <Card className="glass-card border-border/30 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-neon-cyan" />
                                Our Mission
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>
                                At Bondify, we believe that language learning should be engaging, efficient, and accessible. Traditional methods often feel static and repetitive. We are changing that by integrating:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <BrainCircuit className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-foreground">AI-Powered Context</span>
                                        <p className="text-sm">Dynamic content generation that adapts to your level and interests.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-neon-pink/10 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4 text-neon-pink" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-foreground">Interactive Practice</span>
                                        <p className="text-sm">Real-time feedback on writing, pronunciation, and comprehension.</p>
                                    </div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Disclaimer & Support */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    {/* AI Disclaimer */}
                    <Alert className="border-yellow-500/20 bg-yellow-500/5 text-yellow-500">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle className="font-semibold text-foreground">AI Limitations</AlertTitle>
                        <AlertDescription className="text-muted-foreground mt-2">
                            Please note that while our AI models are advanced, they can occasionally produce incorrect or misleading information ("hallucinations"). Always verify critical information and use this tool as a learning companion rather than an absolute authority. Context matters!
                        </AlertDescription>
                    </Alert>

                    {/* Support */}
                    <Card className="glass-card border-border/30 bg-gradient-to-br from-[#FFDD00]/5 to-transparent">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coffee className="w-5 h-5 text-[#FFDD00]" />
                                Support the Project
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Bondify is an open-source project built with passion. If you find it helpful and want to support its development, consider buying me a coffee!
                            </p>
                            <Button
                                className="w-full bg-[#FFDD00] text-black hover:bg-[#FFDD00]/90 font-bold"
                                asChild
                            >
                                <a
                                    href="https://buymeacoffee.com/jgebang"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2"
                                >
                                    <Coffee className="w-5 h-5" />
                                    Buy me a coffee
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
