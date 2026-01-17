import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Volume2,
  Puzzle,
  Lightbulb,
  MessageSquare,
  Users,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { lookupWord, WordDefinition } from "@/lib/api/vocabulary";
import {
  getUserWordlist,
  addToWordlist,
  removeFromWordlist,
  WordlistEntry,
} from "@/lib/api/wordlist";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const difficultyColors: Record<number, string> = {
  1: "bg-neon-green/20 text-neon-green border-neon-green/30",
  2: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
  3: "bg-primary/20 text-primary border-primary/30",
  4: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
  5: "bg-neon-pink/20 text-neon-pink border-neon-pink/30",
};

const WordList = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<WordlistEntry | null>(null);
  const [wordData, setWordData] = useState<WordDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isApiSearch, setIsApiSearch] = useState(false);

  // User's wordlist from backend
  const [wordlist, setWordlist] = useState<WordlistEntry[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Load user's wordlist on mount
  useEffect(() => {
    loadWordlist();
  }, []);

  const loadWordlist = async () => {
    setIsLoadingList(true);
    try {
      const response = await getUserWordlist();
      setWordlist(response.words);
    } catch (error) {
      console.error("Error loading wordlist:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Auto-select word from URL query parameter
  useEffect(() => {
    const wordParam = searchParams.get("word");
    if (wordParam && wordlist.length > 0) {
      const foundWord = wordlist.find(
        (w) => w.word.toLowerCase() === wordParam.toLowerCase()
      );
      if (foundWord) {
        handleSelectWord(foundWord);
      } else {
        setSearchQuery(wordParam);
        handleSearchWord(wordParam);
      }
    }
  }, [searchParams, wordlist]);

  const filteredWords = wordlist.filter(
    (word) =>
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectWord = async (word: WordlistEntry) => {
    setSelectedWord(word);
    setSearchError(null);
    setIsApiSearch(false);
    setIsLoading(true);
    try {
      const result = await lookupWord(word.word);
      setWordData(result);
    } catch (error) {
      console.error("Error looking up word:", error);
      setWordData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchWord = async (word?: string) => {
    const searchTerm = word || searchQuery.trim();
    if (!searchTerm) return;

    setSearchError(null);
    setIsLoading(true);
    setSelectedWord(null);
    setIsApiSearch(true);

    try {
      const result = await lookupWord(searchTerm);
      if (result) {
        setWordData(result);
      } else {
        setSearchError(`Could not find "${searchTerm}". Please try another word.`);
        setWordData(null);
      }
    } catch (error: unknown) {
      console.error("Error searching word:", error);
      const errorDetail = (error as { detail?: string })?.detail;
      setSearchError(errorDetail || `Error looking up "${searchTerm}". Please try again.`);
      setWordData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWordlist = async () => {
    if (!wordData) return;

    setIsAddingWord(true);
    setAddSuccess(null);

    try {
      const newEntry = await addToWordlist(wordData.word);
      setWordlist(prev => [newEntry, ...prev]);
      setAddSuccess(wordData.word);
      setTimeout(() => setAddSuccess(null), 3000);
    } catch (error: unknown) {
      console.error("Error adding word:", error);
      const errorDetail = (error as { detail?: { detail?: string } })?.detail?.detail;
      setSearchError(errorDetail || "Failed to add word to list");
    } finally {
      setIsAddingWord(false);
    }
  };

  const handleRemoveFromWordlist = async (word: string) => {
    try {
      await removeFromWordlist(word);
      setWordlist(prev => prev.filter(w => w.word !== word));
      if (selectedWord?.word === word) {
        setSelectedWord(null);
        setWordData(null);
      }
    } catch (error) {
      console.error("Error removing word:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchWord();
    }
  };

  const getInterchangeableIcon = (value: "yes" | "sometimes" | "no") => {
    switch (value) {
      case "yes": return "✅";
      case "sometimes": return "⚠️";
      case "no": return "🚫";
    }
  };

  const isWordInList = useCallback((word: string) => {
    return wordlist.some(w => w.word.toLowerCase() === word.toLowerCase());
  }, [wordlist]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-neon-pink">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl neon-text">Word List</h1>
          <p className="text-sm text-muted-foreground">
            {isLoadingList ? "Loading..." : `${wordlist.length} words in your collection`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search words or type any English word to look up..."
          className="pl-12 pr-24 h-12 rounded-xl bg-secondary/50 border-border/50"
        />
        <Button
          onClick={() => handleSearchWord()}
          disabled={!searchQuery.trim() || isLoading}
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Look up"}
        </Button>
      </div>

      {/* Search Error */}
      {searchError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{searchError}</p>
        </motion.div>
      )}

      {/* Add Success */}
      {addSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-2"
        >
          <Check className="w-5 h-5 shrink-0" />
          <p>"{addSuccess}" added to your word list!</p>
        </motion.div>
      )}

      <div className={cn(
        "grid gap-6",
        isApiSearch && wordData ? "grid-cols-1" : "lg:grid-cols-5"
      )}>
        {/* Word List */}
        {!(isApiSearch && wordData) && (
          <div className="lg:col-span-2 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {isLoadingList ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredWords.length === 0 ? (
              <Card className="glass-card border-border/50">
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {wordlist.length === 0
                      ? "Your word list is empty. Search for words and add them!"
                      : "No words match your search"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredWords.map((word, i) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleSelectWord(word)}
                  className={cn(
                    "glass-card rounded-xl p-4 cursor-pointer transition-all duration-200",
                    selectedWord?.id === word.id && "border-primary/50 shadow-[0_0_20px_hsl(270_100%_65%/0.2)]"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-lg">{word.word}</h3>
                        {word.difficulty && (
                          <Badge variant="outline" className={cn("text-xs", difficultyColors[word.difficulty] || difficultyColors[3])}>
                            Lv.{word.difficulty}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{word.definition}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(word.word);
                        }}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWordlist(word.word);
                        }}
                        className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Word Details */}
        <div className={cn(
          "lg:sticky lg:top-4 h-fit max-h-[calc(100vh-200px)] overflow-y-auto pr-2",
          isApiSearch && wordData ? "col-span-1" : "lg:col-span-3"
        )}>
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Looking up word...</p>
              </motion.div>
            )}

            {!isLoading && wordData && (selectedWord || isApiSearch) && (
              <motion.div
                key={wordData.word}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Add to List Button (for API search results) */}
                {isApiSearch && !isWordInList(wordData.word) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      onClick={handleAddToWordlist}
                      disabled={isAddingWord}
                      className="w-full rounded-xl bg-gradient-to-r from-primary to-neon-cyan"
                    >
                      {isAddingWord ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add "{wordData.word}" to My Word List
                    </Button>
                  </motion.div>
                )}

                {isApiSearch && isWordInList(wordData.word) && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center text-sm">
                    <Check className="w-4 h-4 inline mr-2" />
                    This word is already in your list
                  </div>
                )}

                {/* Definition Card */}
                <Card className="glass-card border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-3 neon-text">
                          <BookOpen className="h-6 w-6 text-primary" />
                          {wordData.word}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-2">{wordData.partOfSpeech}</Badge>
                      </div>
                      {selectedWord?.difficulty && (
                        <Badge variant="outline" className={cn("text-sm", difficultyColors[selectedWord.difficulty])}>
                          Level {selectedWord.difficulty}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-foreground">{wordData.definition}</p>
                  </CardContent>
                </Card>

                {/* Pronunciation Card */}
                <Card className="glass-card border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 justify-between text-base">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-5 w-5 text-primary" />
                        Pronunciation
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakWord(wordData.word)}
                        disabled={isSpeaking}
                        className="gap-2"
                      >
                        <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                        {isSpeaking ? 'Speaking...' : 'Listen'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">IPA</p>
                        <p className="text-lg font-mono">{wordData.pronunciation.ipa}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Phonetic Breakdown</p>
                        <p className="text-lg font-mono">{wordData.pronunciation.phoneticBreakdown}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Oxford Respelling</p>
                        <p className="text-lg font-mono">{wordData.pronunciation.oxfordRespelling}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Word Structure Card */}
                <Card className="glass-card border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Puzzle className="h-5 w-5 text-primary" />
                      Word Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {wordData.wordStructure.prefix && (
                        <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-4 text-center">
                          <p className="text-sm text-muted-foreground">Prefix</p>
                          <p className="text-xl font-bold text-neon-cyan">{wordData.wordStructure.prefix}</p>
                          <p className="text-xs text-muted-foreground mt-1">{wordData.wordStructure.prefixMeaning}</p>
                        </div>
                      )}
                      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">Root</p>
                        <p className="text-xl font-bold text-primary">{wordData.wordStructure.root}</p>
                        <p className="text-xs text-muted-foreground mt-1">{wordData.wordStructure.rootMeaning}</p>
                      </div>
                      {wordData.wordStructure.suffix && (
                        <div className="bg-neon-orange/10 border border-neon-orange/30 rounded-lg p-4 text-center">
                          <p className="text-sm text-muted-foreground">Suffix</p>
                          <p className="text-xl font-bold text-neon-orange">{wordData.wordStructure.suffix}</p>
                          <p className="text-xs text-muted-foreground mt-1">{wordData.wordStructure.suffixMeaning}</p>
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Etymology</p>
                      <p className="text-foreground">{wordData.etymology}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Meanings Card */}
                <Card className="glass-card border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Meanings in Different Contexts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {wordData.meanings.map((meaning, index) => (
                      <div key={index} className="border-l-4 border-primary/50 pl-4 py-2">
                        <h4 className="font-semibold text-foreground">{meaning.context}</h4>
                        <p className="text-muted-foreground mb-2">{meaning.meaning}</p>
                        <p className="italic text-sm bg-muted/30 rounded p-3">"{meaning.example}"</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Collocations Card */}
                <Card className="glass-card border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-5 w-5 text-primary" />
                      Common Collocations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {wordData.collocations.map((collocation, index) => (
                        <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                          {collocation}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Synonyms Table */}
                <Card className="glass-card border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Synonyms & Differences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Synonym</TableHead>
                          <TableHead>Meaning</TableHead>
                          <TableHead>Context</TableHead>
                          <TableHead className="text-center">Interchangeable?</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {wordData.synonyms.map((synonym, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{synonym.word}</TableCell>
                            <TableCell>{synonym.meaning}</TableCell>
                            <TableCell className="text-muted-foreground">{synonym.context}</TableCell>
                            <TableCell className="text-center text-lg">
                              {getInterchangeableIcon(synonym.interchangeable)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Common Mistakes Card */}
                {wordData.commonMistakes && wordData.commonMistakes.length > 0 && (
                  <Card className="glass-card border-border/50 border-destructive/30 bg-destructive/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Common Mistakes to Avoid
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {wordData.commonMistakes.map((mistake, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-destructive font-bold shrink-0">❌</span>
                            <div>
                              <p className="text-foreground italic">"{mistake.incorrect}"</p>
                              <p className="text-sm text-destructive/80 mt-1">→ {mistake.issue}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 pl-6">
                            <span className="text-green-500 font-bold shrink-0">✅</span>
                            <p className="text-foreground italic">"{mistake.correct}"</p>
                          </div>
                          {index < wordData.commonMistakes!.length - 1 && <Separator className="mt-3" />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Learning Tips Card */}
                <Card className="glass-card border-border/50 bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      How to Think in English
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Learning Tip</p>
                      <p className="text-foreground font-medium">{wordData.learningTip}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Visual Trick</p>
                      <p className="text-foreground">{wordData.visualTrick}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Memory Phrase</p>
                      <p className="text-foreground italic">"{wordData.memoryPhrase}"</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!isLoading && !selectedWord && !wordData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="glass-card border-border/50">
                  <CardContent className="py-16 text-center">
                    <div className="inline-flex p-4 rounded-2xl bg-secondary/50 mb-4">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Select a word to see full details</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WordList;
