import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { analyzeAndRephrase, RephraseAnalysis } from "@/lib/api/rephrase";

const RephraseAnalyzer = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState<RephraseAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter a sentence to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const result = await analyzeAndRephrase(inputText);
      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing sentence:", error);
      toast.error("Failed to analyze sentence. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Rephrase Analyzer</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-4 space-y-4"
        >
          <div>
            <h2 className="font-medium mb-2">Enter your sentence</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Type a sentence you want to sound more natural, and I'll provide comprehensive grammar analysis and rephrasing options.
            </p>
          </div>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., I found that when I answer correctly, the rocket moves up too less."
            className="min-h-[100px] resize-none"
          />
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze & Rephrase
              </>
            )}
          </Button>
        </motion.div>

        {/* Analysis Results */}
        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Original Sentence */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold text-lg mb-2">Original Sentence</h3>
                <p className="text-muted-foreground italic">"{analysis.originalSentence}"</p>
              </div>

              {/* Grammar Issues */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-destructive">⚠</span> Grammar & Clarity Issues
                </h3>
                <div className="space-y-4">
                  {analysis.issues.map((issue, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-muted/50 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <span className="bg-destructive/20 text-destructive text-xs font-medium px-2 py-0.5 rounded">
                          {issue.type}
                        </span>
                      </div>
                      <p className="font-medium">
                        <span className="text-destructive line-through">"{issue.problematic}"</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{issue.explanation}</p>
                      <div className="pt-2 border-t border-border">
                        <p className="text-sm font-medium text-primary">Correct alternatives:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                          {issue.corrections.map((correction, i) => (
                            <li key={i}>{correction}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Rephrasing Options */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-primary">✨</span> Improved Rephrasing Options
                </h3>
                <div className="space-y-3">
                  {analysis.rephrasedOptions.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-primary/5 border border-primary/20 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-0.5 rounded">
                          {option.context}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => copyToClipboard(option.sentence, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-foreground font-medium mb-2">"{option.sentence}"</p>
                      <p className="text-sm text-muted-foreground">{option.whyItWorks}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span>📝</span> Key Takeaways
                </h3>
                <ul className="space-y-2">
                  {analysis.keyTakeaways.map((takeaway, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary mt-0.5">•</span>
                      {takeaway}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Best Recommendation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/30 p-4"
              >
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span>🏆</span> Best Recommendation
                </h3>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground font-medium">"{analysis.bestRecommendation}"</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(analysis.bestRecommendation, -1)}
                  >
                    {copiedIndex === -1 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RephraseAnalyzer;
