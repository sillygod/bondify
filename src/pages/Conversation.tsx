import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, RotateCcw, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ConversationMessage,
  sendMessage,
  getOpeningMessage,
  generateFeedback,
  startConversation,
  clearSession,
} from "@/lib/api/conversation";
import { useLayoutControl } from "@/hooks/useLayoutControl";

const Conversation = () => {
  const navigate = useNavigate();
  const { setHideHeader } = useLayoutControl();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide header/sidebar for immersive conversation
  useEffect(() => {
    setHideHeader(true);
    return () => setHideHeader(false);
  }, [setHideHeader]);

  useEffect(() => {
    // Start conversation with opening message
    const initConversation = async () => {
      try {
        const response = await startConversation();
        const opening: ConversationMessage = {
          id: 'opening',
          role: 'assistant',
          content: response.opening_message,
        };
        setMessages([opening]);
      } catch (error) {
        console.error("Error starting conversation:", error);
        // Fallback to local opening message
        const opening = getOpeningMessage();
        setMessages([opening]);
      }
    };
    initConversation();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      // Show error message to user
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

  const handleReset = async () => {
    setShowFeedback(false);
    setFeedback(null);
    clearSession();
    try {
      const response = await startConversation();
      const opening: ConversationMessage = {
        id: 'opening',
        role: 'assistant',
        content: response.opening_message,
      };
      setMessages([opening]);
    } catch (error) {
      console.error("Error resetting conversation:", error);
      const opening = getOpeningMessage();
      setMessages([opening]);
    }
  };

  const handleEndConversation = async () => {
    setShowFeedback(true);
    setIsFeedbackLoading(true);
    try {
      const feedbackText = await generateFeedback();
      setFeedback(feedbackText);
    } catch (error) {
      console.error("Error generating feedback:", error);
      // Generate local feedback as fallback
      const userMessages = messages.filter(m => m.role === "user");
      const corrections = messages.filter(m => m.correction).map(m => m.correction!);
      
      let fallbackFeedback = "## Conversation Summary\n\n";
      fallbackFeedback += `Great job! You exchanged ${userMessages.length} messages in this conversation.\n\n`;
      
      if (corrections.length > 0) {
        fallbackFeedback += "### Areas for Improvement\n\n";
        corrections.forEach((c, i) => {
          fallbackFeedback += `${i + 1}. **"${c.original}"** → **"${c.corrected}"**\n`;
          fallbackFeedback += `   _${c.explanation}_\n\n`;
        });
      } else {
        fallbackFeedback += "### Great News!\n\nNo major grammar mistakes detected. Keep up the good work!\n\n";
      }
      
      fallbackFeedback += "### Tips for More Natural Speaking\n\n";
      fallbackFeedback += "- Use contractions like \"I'm\", \"don't\", \"can't\" for casual conversation\n";
      fallbackFeedback += "- Add filler words like \"well\", \"actually\", \"you know\" to sound more natural\n";
      fallbackFeedback += "- Ask questions back to keep conversations flowing\n";
      
      setFeedback(fallbackFeedback);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  if (showFeedback) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-2xl neon-text">Session Feedback</h1>
            <p className="text-sm text-muted-foreground">Review your conversation</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6"
        >
          {isFeedbackLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating feedback...</p>
            </div>
          ) : feedback ? (
            <>
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:font-display prose-headings:text-foreground
                prose-h2:text-xl prose-h2:text-neon-cyan prose-h2:mt-4 prose-h2:mb-2
                prose-h3:text-lg prose-h3:text-neon-pink prose-h3:mt-4 prose-h3:mb-2
                prose-p:text-muted-foreground prose-p:my-2
                prose-li:text-muted-foreground prose-li:my-1
                prose-strong:text-foreground prose-strong:font-semibold
                prose-em:text-muted-foreground/80
                prose-ul:my-2 prose-ol:my-2
              ">
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleReset} className="flex-1 rounded-xl">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start New Conversation
                </Button>
                <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl">
                  Back to Dashboard
                </Button>
              </div>
            </>
          ) : null}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl neon-text">Conversation Practice</h1>
          <p className="text-sm text-muted-foreground">Practice natural English conversation</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEndConversation}
          disabled={messages.length < 3}
          className="rounded-xl"
        >
          <FileText className="w-4 h-4 mr-2" />
          End & Review
        </Button>
      </div>

      {/* Chat Area */}
      <div className="glass-card rounded-3xl flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
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
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      message.role === "assistant"
                        ? "bg-neon-cyan/20 text-neon-cyan"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {message.role === "assistant" ? "AI" : "You"}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                    <div
                      className={`inline-block rounded-2xl px-4 py-3 ${
                        message.role === "assistant"
                          ? "bg-muted/50 text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.correction && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/20 text-left"
                      >
                        <p className="text-xs text-neon-pink font-medium mb-1">📝 Quick tip:</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="line-through text-muted-foreground/50">{message.correction.original}</span>
                          {" → "}
                          <span className="text-neon-cyan font-medium">{message.correction.corrected}</span>
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1 italic">
                          {message.correction.explanation}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs font-bold text-neon-cyan">
                  AI
                </div>
                <div className="bg-muted/50 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-neon-cyan"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-neon-cyan"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-neon-cyan"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
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
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-2 text-center">
            Just chat naturally! The AI will gently correct any mistakes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
