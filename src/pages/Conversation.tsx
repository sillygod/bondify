import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Send,
  RotateCcw,
  FileText,
  Loader2,
  MessageCircle,
  Sparkles,
  Film,
  UtensilsCrossed,
  Plane,
  Briefcase,
  Gamepad2,
  GraduationCap,
  BookOpen,
  Plus,
  Check,
  AlertCircle,
  Lightbulb,
  Target,
  Hotel,
  Stethoscope,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ConversationMessage,
  sendMessage,
  getOpeningMessage,
  generateFeedback,
  startConversation,
  clearSession,
  ConversationOptions,
  ScenarioInfo,
  getScenarios,
} from "@/lib/api/conversation";
import { addToWordlist } from "@/lib/api/wordlist";
import { useLayoutControl } from "@/hooks/useLayoutControl";
import { cn } from "@/lib/utils";

type GameState = "ready" | "chatting" | "feedback";

// Predefined conversation topics
const TOPICS = [
  { id: "movies", label: "Movies & TV", icon: Film, color: "from-red-500 to-pink-500" },
  { id: "food", label: "Food & Cooking", icon: UtensilsCrossed, color: "from-orange-500 to-amber-500" },
  { id: "travel", label: "Travel", icon: Plane, color: "from-blue-500 to-cyan-500" },
  { id: "work", label: "Work & Career", icon: Briefcase, color: "from-purple-500 to-indigo-500" },
  { id: "hobbies", label: "Hobbies", icon: Gamepad2, color: "from-green-500 to-emerald-500" },
  { id: "education", label: "Education", icon: GraduationCap, color: "from-yellow-500 to-orange-500" },
];

// Scenario icons mapping
const SCENARIO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  job_interview: Briefcase,
  restaurant: UtensilsCrossed,
  airport: Plane,
  hotel: Hotel,
  doctor: Stethoscope,
};

const SCENARIO_COLORS: Record<string, string> = {
  job_interview: "from-purple-500 to-indigo-500",
  restaurant: "from-orange-500 to-amber-500",
  airport: "from-blue-500 to-cyan-500",
  hotel: "from-emerald-500 to-teal-500",
  doctor: "from-rose-500 to-pink-500",
};

// Parse feedback into structured sections
interface FeedbackSection {
  title: string;
  type: "summary" | "grammar" | "vocabulary" | "recommendations" | "encouragement";
  content: string[];
  corrections?: { original: string; corrected: string; explanation: string }[];
  recommendations?: { word: string; definition: string; example: string }[];
}

function parseFeedback(feedbackText: string): FeedbackSection[] {
  const sections: FeedbackSection[] = [];
  const lines = feedbackText.split("\n");

  let currentSection: FeedbackSection | null = null;
  let currentContent: string[] = [];
  let inRecommendations = false;
  let currentRec: { word: string; definition: string; example: string } | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for section headers
    if (trimmedLine.startsWith("## ") || trimmedLine.startsWith("# ")) {
      // Save previous section
      if (currentSection) {
        if (currentRec && currentSection.recommendations) {
          currentSection.recommendations.push(currentRec);
          currentRec = null;
        }
        currentSection.content = currentContent;
        sections.push(currentSection);
      }

      const title = trimmedLine.replace(/^#+\s*/, "");
      let type: FeedbackSection["type"] = "summary";

      if (title.toLowerCase().includes("grammar") || title.toLowerCase().includes("language")) {
        type = "grammar";
        inRecommendations = false;
      } else if (title.toLowerCase().includes("vocabulary usage")) {
        type = "vocabulary";
        inRecommendations = false;
      } else if (title.toLowerCase().includes("recommend") || title.toLowerCase().includes("learn") || title.toLowerCase().includes("words to")) {
        type = "recommendations";
        inRecommendations = true;
      } else if (title.toLowerCase().includes("encouragement") || title.toLowerCase().includes("keep") || title.toLowerCase().includes("great")) {
        type = "encouragement";
        inRecommendations = false;
      }

      currentSection = { title, type, content: [] };
      if (type === "recommendations") {
        currentSection.recommendations = [];
      }
      currentContent = [];
    } else if (currentSection) {
      // Parse recommendation items - support multiple formats
      if (inRecommendations && currentSection.type === "recommendations") {
        // Format: "- **word** - definition" or "* **word**: definition" or "1. **word** - definition"
        const boldWordMatch = trimmedLine.match(/^[-*\d.]+\s*\*\*([^*]+)\*\*\s*[-:]?\s*(.*)/);
        if (boldWordMatch) {
          // Save previous recommendation
          if (currentRec && currentSection.recommendations) {
            currentSection.recommendations.push(currentRec);
          }
          currentRec = {
            word: boldWordMatch[1].trim(),
            definition: boldWordMatch[2].trim(),
            example: ""
          };
        } else if (currentRec && trimmedLine) {
          // Additional lines for current recommendation
          const lowered = trimmedLine.toLowerCase();
          if (lowered.includes("example:") || lowered.startsWith('"') || lowered.startsWith("'")) {
            currentRec.example = trimmedLine.replace(/^[-*]\s*/, "").replace(/example:\s*/i, "").replace(/["']/g, "").trim();
          } else if (trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
            // Sub-bullet might be definition or example
            const content = trimmedLine.replace(/^[-*]\s*/, "");
            if (!currentRec.definition) {
              currentRec.definition = content;
            } else if (!currentRec.example) {
              currentRec.example = content;
            }
          } else if (!currentRec.definition) {
            currentRec.definition = trimmedLine;
          }
        }
      } else if (trimmedLine) {
        currentContent.push(trimmedLine);
      }
    }
  }

  // Push last recommendation
  if (currentRec && currentSection?.recommendations) {
    currentSection.recommendations.push(currentRec);
  }

  // Save last section
  if (currentSection) {
    currentSection.content = currentContent;
    sections.push(currentSection);
  }

  return sections;
}


const Conversation = () => {
  const navigate = useNavigate();
  const { setHideHeader } = useLayoutControl();
  const [gameState, setGameState] = useState<GameState>("ready");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackSections, setFeedbackSections] = useState<FeedbackSection[]>([]);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Ready screen state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");

  // Scenario mode state
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<{
    id: string;
    name: string;
    userRole: string;
    userGoal: string;
  } | null>(null);
  const [practiceMode, setPracticeMode] = useState<"topic" | "scenario">("topic");

  // Target words
  const [targetWords, setTargetWords] = useState<string[]>([]);

  // Words added to list
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set());
  const [addingWord, setAddingWord] = useState<string | null>(null);

  // Load scenarios on mount
  useEffect(() => {
    getScenarios()
      .then(setScenarios)
      .catch(console.error);
  }, []);

  // Hide header when chatting
  useEffect(() => {
    setHideHeader(gameState === "chatting");
    return () => setHideHeader(false);
  }, [gameState, setHideHeader]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleStartConversation = async () => {
    setGameState("chatting");
    setIsLoading(true);

    const topic = customTopic || TOPICS.find(t => t.id === selectedTopic)?.label || undefined;
    const options: ConversationOptions = {
      topic: practiceMode === "topic" ? topic : undefined,
      scenario: practiceMode === "scenario" ? selectedScenario ?? undefined : undefined,
    };

    try {
      const response = await startConversation(options);
      const opening: ConversationMessage = {
        id: 'opening',
        role: 'assistant',
        content: response.opening_message,
      };
      setMessages([opening]);

      // Set scenario context if in scenario mode
      if (response.scenario && response.scenario_name) {
        setActiveScenario({
          id: response.scenario,
          name: response.scenario_name,
          userRole: response.user_role || "",
          userGoal: response.user_goal || "",
        });
      }

      if (response.target_words && response.target_words.length > 0) {
        setTargetWords(response.target_words);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      const opening = getOpeningMessage();
      setMessages([opening]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage.content);
      const assistantContent = response.reply + " " + response.followUp;

      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        correction: response.correction,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    clearSession();
    setMessages([]);
    setFeedback(null);
    setFeedbackSections([]);
    setSelectedTopic(null);
    setCustomTopic("");
    setTargetWords([]);
    setAddedWords(new Set());
    setGameState("ready");
  };

  const handleEndConversation = async () => {
    setGameState("feedback");
    setIsFeedbackLoading(true);
    try {
      const feedbackText = await generateFeedback();
      setFeedback(feedbackText);
      setFeedbackSections(parseFeedback(feedbackText));
    } catch (error) {
      console.error("Error generating feedback:", error);
      setFeedback("Unable to generate feedback. Please try again.");
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleAddWord = async (word: string) => {
    setAddingWord(word);
    try {
      await addToWordlist(word);
      setAddedWords(prev => new Set([...prev, word.toLowerCase()]));
    } catch (error) {
      console.error("Error adding word:", error);
    } finally {
      setAddingWord(null);
    }
  };

  // Ready Screen
  if (gameState === "ready") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-2xl neon-text">Conversation Practice</h1>
            <p className="text-sm text-muted-foreground">Practice natural English conversation</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Mode Tabs */}
          <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl">
            <button
              onClick={() => { setPracticeMode("topic"); setSelectedScenario(null); }}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                practiceMode === "topic"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              Free Conversation
            </button>
            <button
              onClick={() => { setPracticeMode("scenario"); setSelectedTopic(null); setCustomTopic(""); }}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                practiceMode === "scenario"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="w-4 h-4" />
              Role-Play Scenarios
            </button>
          </div>

          {/* Topic Mode Content */}
          {practiceMode === "topic" && (
            <>
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Choose a Topic
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    const isSelected = selectedTopic === topic.id;
                    return (
                      <motion.button
                        key={topic.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setSelectedTopic(isSelected ? null : topic.id); setCustomTopic(""); }}
                        className={cn(
                          "p-4 rounded-xl border transition-all duration-200 text-left",
                          isSelected ? "border-primary bg-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.3)]" : "border-border/50 bg-secondary/30 hover:border-primary/50"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2", topic.color)}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-sm">{topic.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <Input
                  value={customTopic}
                  onChange={(e) => { setCustomTopic(e.target.value); setSelectedTopic(null); }}
                  placeholder="Or type a custom topic..."
                  className="rounded-xl bg-background/50"
                />
              </div>

              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-neon-cyan/5 to-primary/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-neon-cyan/20">
                    <Sparkles className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">Smart Vocabulary Practice</h3>
                    <p className="text-sm text-muted-foreground">
                      The AI will automatically select relevant vocabulary from your word list and help you use them naturally.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Scenario Mode Content */}
          {practiceMode === "scenario" && (
            <>
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-neon-pink" />
                  Choose a Scenario
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios.map((scenario) => {
                    const Icon = SCENARIO_ICONS[scenario.id] || MessageCircle;
                    const color = SCENARIO_COLORS[scenario.id] || "from-gray-500 to-gray-600";
                    const isSelected = selectedScenario === scenario.id;
                    return (
                      <motion.button
                        key={scenario.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedScenario(isSelected ? null : scenario.id)}
                        className={cn(
                          "p-5 rounded-xl border transition-all duration-200 text-left",
                          isSelected
                            ? "border-neon-pink bg-neon-pink/20 shadow-[0_0_20px_hsl(320_100%_60%/0.3)]"
                            : "border-border/50 bg-secondary/30 hover:border-neon-pink/50"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn("w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", color)}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-base mb-1">{scenario.name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              You: <span className="text-foreground">{scenario.userRole}</span>
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{scenario.userGoal}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 pt-4 border-t border-border/50"
                          >
                            <p className="text-xs text-muted-foreground mb-2">Practice vocabulary:</p>
                            <div className="flex flex-wrap gap-1">
                              {scenario.vocabulary.slice(0, 5).map((word) => (
                                <span key={word} className="px-2 py-0.5 text-xs rounded-full bg-neon-pink/10 text-neon-pink border border-neon-pink/30">
                                  {word}
                                </span>
                              ))}
                              {scenario.vocabulary.length > 5 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-muted-foreground">
                                  +{scenario.vocabulary.length - 5} more
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-neon-pink/5 to-primary/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-neon-pink/20">
                    <Target className="w-5 h-5 text-neon-pink" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">Real-World Practice</h3>
                    <p className="text-sm text-muted-foreground">
                      Practice realistic conversations in common situations. The AI will play a role and guide you through the scenario.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={handleStartConversation}
            disabled={(practiceMode === "scenario" && !selectedScenario)}
            className="w-full py-6 text-lg font-display bg-gradient-to-r from-primary to-neon-cyan hover:opacity-90 rounded-xl disabled:opacity-50"
          >
            {practiceMode === "scenario" ? (
              <>
                <Users className="w-5 h-5 mr-2" />
                Start Role-Play
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Conversation
              </>
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Feedback Screen with structured UI
  if (gameState === "feedback") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-2xl neon-text">Session Feedback</h1>
            <p className="text-sm text-muted-foreground">Review your conversation</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {isFeedbackLoading ? (
            <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analyzing your conversation...</p>
            </div>
          ) : (
            <>
              {/* Session Summary Card */}
              {feedbackSections.find(s => s.type === "summary") && (
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-neon-cyan" />
                    <h2 className="font-display font-semibold text-lg text-neon-cyan">Session Summary</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {feedbackSections.find(s => s.type === "summary")?.content.join(" ")}
                  </p>
                </div>
              )}

              {/* Grammar & Language Card - with individual correction bubbles */}
              {feedbackSections.find(s => s.type === "grammar") && (() => {
                // Parse grammar content into individual corrections
                const grammarContent = feedbackSections.find(s => s.type === "grammar")?.content.join("\n") || "";
                const corrections: { original: string; corrected: string; explanation: string }[] = [];
                let tips: string[] = [];

                // Match patterns like "Original: ... Corrected: ... Explanation: ..."
                const lines = grammarContent.split("\n");
                let current: { original: string; corrected: string; explanation: string } | null = null;

                for (const line of lines) {
                  const originalMatch = line.match(/\*?\*?Original:?\*?\*?\s*[""]?(.+?)[""]?$/i);
                  const correctedMatch = line.match(/\*?\*?Corrected:?\*?\*?\s*[""]?(.+?)[""]?$/i);
                  const explanationMatch = line.match(/\*?\*?Explanation:?\*?\*?\s*(.+)$/i);
                  const tipMatch = line.match(/^[-*]\s*(.+)$/) || line.match(/^Tips?\s*for.+:/i);

                  if (originalMatch) {
                    if (current && current.original) {
                      corrections.push(current);
                    }
                    current = { original: originalMatch[1].replace(/[""]$/g, "").trim(), corrected: "", explanation: "" };
                  } else if (correctedMatch && current) {
                    current.corrected = correctedMatch[1].replace(/[""]$/g, "").trim();
                  } else if (explanationMatch && current) {
                    current.explanation = explanationMatch[1].trim();
                  } else if (line.toLowerCase().includes("tips for") || line.toLowerCase().includes("tip:")) {
                    if (current && current.original) {
                      corrections.push(current);
                      current = null;
                    }
                    tips.push(line.replace(/^[-*]\s*/, "").replace(/\*\*/g, ""));
                  } else if (tipMatch && !current) {
                    tips.push(tipMatch[1] || line);
                  }
                }

                if (current && current.original) {
                  corrections.push(current);
                }

                return (
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-neon-pink" />
                      <h2 className="font-display font-semibold text-lg text-neon-pink">Grammar & Language</h2>
                    </div>

                    {/* Individual correction bubbles */}
                    <div className="space-y-3">
                      {corrections.map((correction, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 rounded-xl bg-background/50 border border-border/50"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-red-400 shrink-0">✗</span>
                            <p className="text-sm text-muted-foreground line-through">{correction.original}</p>
                          </div>
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-green-400 shrink-0">✓</span>
                            <p className="text-sm text-foreground font-medium">{correction.corrected}</p>
                          </div>
                          {correction.explanation && (
                            <div className="pl-6 pt-2 border-t border-border/30">
                              <p className="text-xs text-muted-foreground/80 italic">{correction.explanation}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Tips section */}
                    {tips.length > 0 && (
                      <div className="mt-4 p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20">
                        <p className="text-xs font-medium text-neon-cyan mb-2">💡 Tips for natural speaking:</p>
                        <ul className="space-y-1">
                          {tips.map((tip, i) => (
                            <li key={i} className="text-xs text-muted-foreground">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Fallback if no corrections parsed */}
                    {corrections.length === 0 && (
                      <div className="prose prose-sm prose-invert max-w-none prose-p:text-muted-foreground">
                        <ReactMarkdown>{grammarContent}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                );
              })()}


              {/* Vocabulary Usage Card */}
              {feedbackSections.find(s => s.type === "vocabulary") && (
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-primary" />
                    <h2 className="font-display font-semibold text-lg text-primary">Vocabulary Usage</h2>
                  </div>
                  <div className="space-y-2">
                    {feedbackSections.find(s => s.type === "vocabulary")?.content.map((line, i) => (
                      <p key={i} className="text-sm text-muted-foreground">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Words to Learn - with Add to Wordlist buttons */}
              {feedbackSections.find(s => s.type === "recommendations")?.recommendations?.length ? (
                <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-neon-cyan/5 to-primary/5">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-neon-cyan" />
                    <h2 className="font-display font-semibold text-lg text-neon-cyan">Add These Words to Your List</h2>
                  </div>
                  <div className="space-y-3">
                    {feedbackSections.find(s => s.type === "recommendations")?.recommendations?.map((rec, i) => {
                      const isAdded = addedWords.has(rec.word.toLowerCase());
                      const isAdding = addingWord === rec.word;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{rec.word}</p>
                            {rec.definition && <p className="text-sm text-muted-foreground mt-1">{rec.definition}</p>}
                            {rec.example && <p className="text-xs text-muted-foreground/70 italic mt-1">"{rec.example}"</p>}
                          </div>
                          <Button
                            size="sm"
                            variant={isAdded ? "outline" : "default"}
                            disabled={isAdded || isAdding}
                            onClick={() => handleAddWord(rec.word)}
                            className={cn("shrink-0 rounded-lg", isAdded && "border-green-500/50 text-green-400")}
                          >
                            {isAdding ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isAdded ? (
                              <><Check className="w-4 h-4 mr-1" /> Added</>
                            ) : (
                              <><Plus className="w-4 h-4 mr-1" /> Add</>
                            )}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Encouragement Card */}
              {feedbackSections.find(s => s.type === "encouragement") && (
                <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-green-500/10 to-neon-cyan/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-green-400" />
                    <h2 className="font-display font-semibold text-lg text-green-400">Keep Going!</h2>
                  </div>
                  <p className="text-muted-foreground">
                    {feedbackSections.find(s => s.type === "encouragement")?.content.join(" ")}
                  </p>
                </div>
              )}

              {/* Fallback: Raw Feedback if no sections parsed */}
              {feedbackSections.length === 0 && feedback && (
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-muted-foreground whitespace-pre-wrap">{feedback}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleReset} className="flex-1 rounded-xl">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Conversation
                </Button>
                <Button variant="outline" onClick={() => navigate("/wordlist")} className="rounded-xl">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Word List
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // Chatting Screen with fixed auto-scroll
  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl neon-text">Conversation Practice</h1>
          <p className="text-sm text-muted-foreground">
            {selectedTopic ? `Topic: ${TOPICS.find(t => t.id === selectedTopic)?.label}` : customTopic ? `Topic: ${customTopic}` : "Practice natural English conversation"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleEndConversation} disabled={messages.length < 3} className="rounded-xl">
          <FileText className="w-4 h-4 mr-2" />
          End & Review
        </Button>
      </div>

      {targetWords.length > 0 && (
        <div className="mb-3 p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs font-medium text-neon-cyan">Practice these words:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {targetWords.map(word => (
              <span key={word} className="px-2 py-0.5 text-xs rounded-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30">{word}</span>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area with proper scrolling */}
      <div className="glass-card rounded-3xl flex-1 flex flex-col overflow-hidden">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${message.role === "assistant" ? "bg-neon-cyan/20 text-neon-cyan" : "bg-primary/20 text-primary"}`}>
                    {message.role === "assistant" ? "AI" : "You"}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-2xl px-4 py-3 ${message.role === "assistant" ? "bg-muted/50 text-foreground" : "bg-primary text-primary-foreground"}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.correction && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/20 text-left">
                        <p className="text-xs text-neon-pink font-medium mb-1">📝 Quick tip:</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="line-through text-muted-foreground/50">{message.correction.original}</span>
                          {" → "}
                          <span className="text-neon-cyan font-medium">{message.correction.corrected}</span>
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1 italic">{message.correction.explanation}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs font-bold text-neon-cyan">AI</div>
                <div className="bg-muted/50 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 rounded-full bg-neon-cyan" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-neon-cyan" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-neon-cyan" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 rounded-xl bg-background/50"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="rounded-xl">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-2 text-center">Just chat naturally! The AI will gently correct any mistakes.</p>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
