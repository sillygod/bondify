import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Plus,
    Trash2,
    ArrowLeft,
    Loader2,
    FileText,
    Calendar,
    Hash,
    Link,
    Type,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useArticles, useArticle, useCreateArticle, useDeleteArticle, useArticleAnalysis } from "@/hooks/useReading";
import { useToast } from "@/hooks/use-toast";
import { ClickableText } from "@/components/reading/ClickableText";
import { WordPopover } from "@/components/reading/WordPopover";
import { ReadingAnalysisPanel } from "@/components/reading/ReadingAnalysisPanel";
import { lookupWord, WordDefinition } from "@/lib/api/vocabulary";
import { importFromUrl } from "@/lib/api/reading";

const difficultyColors: Record<string, string> = {
    beginner: "bg-neon-green/20 text-neon-green border-neon-green/30",
    intermediate: "bg-primary/20 text-primary border-primary/30",
    advanced: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
};

type ImportMode = 'text' | 'url';

const ReadingMode = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [importMode, setImportMode] = useState<ImportMode>('text');
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [importUrl, setImportUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);

    // Word lookup state
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [wordDefinition, setWordDefinition] = useState<WordDefinition | null>(null);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

    const { data: articleList, isLoading: isLoadingList } = useArticles();
    const { data: article, isLoading: isLoadingArticle } = useArticle(selectedArticleId);
    const { analysis, isAnalyzing, triggerAnalysis, hasAnalysis } = useArticleAnalysis(selectedArticleId);
    const createArticle = useCreateArticle();
    const deleteArticle = useDeleteArticle();

    const handleCreateArticle = async () => {
        if (!newTitle.trim() || !newContent.trim()) {
            toast({
                title: "Error",
                description: "Please fill in both title and content",
                variant: "destructive",
            });
            return;
        }

        try {
            await createArticle.mutateAsync({
                title: newTitle,
                content: newContent,
            });
            setIsCreateOpen(false);
            setNewTitle("");
            setNewContent("");
            setImportUrl("");
            setImportMode('text');
            toast({
                title: "Article created",
                description: "Your reading article has been saved",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create article",
                variant: "destructive",
            });
        }
    };

    const handleImportUrl = async () => {
        if (!importUrl.trim()) {
            toast({
                title: "Error",
                description: "Please enter a URL",
                variant: "destructive",
            });
            return;
        }

        setIsImporting(true);
        try {
            const result = await importFromUrl(importUrl);
            setNewTitle(result.title);
            setNewContent(result.content);
            setImportMode('text');
            toast({
                title: "Content extracted",
                description: `Extracted ${result.wordCount} words. You can now edit and save.`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.detail || "Failed to extract content from URL",
                variant: "destructive",
            });
        } finally {
            setIsImporting(false);
        }
    };

    const handleDeleteArticle = async (id: number) => {
        try {
            await deleteArticle.mutateAsync(id);
            if (selectedArticleId === id) {
                setSelectedArticleId(null);
            }
            toast({
                title: "Article deleted",
                description: "The article has been removed",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete article",
                variant: "destructive",
            });
        }
    };

    const handleWordClick = useCallback(async (word: string, rect: DOMRect) => {
        setSelectedWord(word);
        setPopoverPosition({ x: rect.left + rect.width / 2, y: rect.bottom });
        setIsLookingUp(true);
        setWordDefinition(null);

        try {
            const definition = await lookupWord(word);
            setWordDefinition(definition);
        } catch (error) {
            console.error("Failed to lookup word:", error);
        } finally {
            setIsLookingUp(false);
        }
    }, []);

    const handleClosePopover = useCallback(() => {
        setSelectedWord(null);
        setWordDefinition(null);
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Reading view
    if (selectedArticleId && article) {
        return (
            <div className="max-w-7xl mx-auto">
                {/* Reading Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedArticleId(null)}
                        className="rounded-xl"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-display font-bold text-2xl">{article.title}</h1>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Hash className="w-4 h-4" />
                                {article.word_count} words
                            </span>
                            <Badge className={difficultyColors[article.difficulty_level]}>
                                {article.difficulty_level}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Two column layout: Article + Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Article Content - takes 2/3 on large screens */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 glass-card rounded-2xl p-8 relative"
                    >
                        <p className="text-sm text-muted-foreground mb-4">
                            💡 Click any word to look up its definition and add to your wordlist
                        </p>
                        <div className="prose prose-lg prose-invert max-w-none leading-relaxed">
                            <ClickableText
                                text={article.content}
                                onWordClick={handleWordClick}
                            />
                        </div>
                    </motion.div>

                    {/* Analysis Panel - takes 1/3 on large screens */}
                    <div className="lg:col-span-1">
                        <ReadingAnalysisPanel
                            analysis={analysis}
                            isAnalyzing={isAnalyzing}
                            onAnalyze={triggerAnalysis}
                            hasAnalyzed={hasAnalysis}
                        />
                    </div>
                </div>

                {/* Word Popover */}
                {selectedWord && (
                    <WordPopover
                        word={selectedWord}
                        definition={wordDefinition}
                        isLoading={isLookingUp}
                        position={popoverPosition}
                        onClose={handleClosePopover}
                    />
                )}
            </div>
        );
    }

    // Articles list view
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/")}
                        className="rounded-xl"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-display font-bold text-2xl neon-text">Reading Mode</h1>
                        <p className="text-sm text-muted-foreground">
                            Import articles to practice reading and learn vocabulary
                        </p>
                    </div>
                </div>

                {/* Create Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-xl">
                            <Plus className="w-4 h-4" />
                            New Article
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Import New Article</DialogTitle>
                        </DialogHeader>

                        {/* Mode Toggle Tabs */}
                        <div className="flex gap-2 p-1 bg-muted rounded-lg">
                            <button
                                onClick={() => setImportMode('url')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${importMode === 'url'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted-foreground/10'
                                    }`}
                            >
                                <Link className="w-4 h-4" />
                                From URL
                            </button>
                            <button
                                onClick={() => setImportMode('text')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${importMode === 'text'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted-foreground/10'
                                    }`}
                            >
                                <Type className="w-4 h-4" />
                                Paste Text
                            </button>
                        </div>

                        <div className="space-y-4 mt-2">
                            {importMode === 'url' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Article URL</label>
                                        <Input
                                            placeholder="https://example.com/article..."
                                            value={importUrl}
                                            onChange={(e) => setImportUrl(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Enter a URL and we'll extract the article content automatically
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsCreateOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleImportUrl}
                                            disabled={isImporting}
                                        >
                                            {isImporting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Extracting...
                                                </>
                                            ) : (
                                                "Extract Content"
                                            )}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input
                                            placeholder="Enter article title..."
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Content</label>
                                        <Textarea
                                            placeholder="Paste your English text here..."
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                            rows={12}
                                            className="resize-none"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsCreateOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreateArticle}
                                            disabled={createArticle.isPending}
                                        >
                                            {createArticle.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save Article"
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Articles List */}
            <AnimatePresence mode="wait">
                {isLoadingList ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : !articleList?.articles.length ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 glass-card rounded-2xl"
                    >
                        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                        <h2 className="font-display text-xl font-semibold mb-2">No articles yet</h2>
                        <p className="text-muted-foreground mb-6">
                            Import your first English article to start learning
                        </p>
                        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Import Article
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        {articleList.articles.map((article, index) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group"
                                onClick={() => setSelectedArticleId(article.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-primary/10">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                {article.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Hash className="w-4 h-4" />
                                                    {article.word_count} words
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(article.created_at)}
                                                </span>
                                                <Badge className={difficultyColors[article.difficulty_level]}>
                                                    {article.difficulty_level}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteArticle(article.id);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReadingMode;
