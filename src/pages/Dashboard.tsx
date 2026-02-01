import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { tokenManager } from "@/lib/api";

import {
  BookOpen,
  Target,
  Flame,
  Trophy,
  Rocket,
  Brain,
  MessageSquare,
  Puzzle,
  Sparkles,
  BookCheck,
  Mic,
  Zap,
  PenTool,
  Scissors,
  Link2,
  Type,
  Headphones,
  Focus,
  PenLine,
  LogIn,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { GameCard } from "@/components/dashboard/GameCard";
import { LearningCurve } from "@/components/dashboard/LearningCurve";
import { WeaknessReport } from "@/components/dashboard/WeaknessReport";
import { SRSReviewCard } from "@/components/dashboard/SRSReviewCard";
import { Button } from "@/components/ui/button";
import { useStats } from "@/contexts/StatsContext";
import { Footer } from "@/components/layout/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats, isLoading } = useStats();
  const [isAuthenticated, setIsAuthenticated] = useState(() => tokenManager.isAuthenticated());

  // Re-check auth state whenever location changes or component mounts
  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(tokenManager.isAuthenticated());
    checkAuth();

    // Listen for storage changes (when tokens are saved in other tabs or after login)
    window.addEventListener('storage', checkAuth);

    // Also check periodically (handles same-tab token updates)
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, [location.key]);


  const handleWordClick = (word: string) => {
    navigate(`/word-list?word=${encodeURIComponent(word)}`);
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display font-semibold text-xl mb-6"
        >
          Your Progress
        </motion.h2>
        {isAuthenticated && stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BookOpen}
              label="Words Learned"
              value={stats.wordsLearned}
              change={stats.todayWordsLearned > 0 ? `+${stats.todayWordsLearned}` : undefined}
              color="purple"
              delay={0.1}
            />
            <StatCard
              icon={Target}
              label="Accuracy Rate"
              value={`${Math.round(stats.accuracyRate * 100)}%`}
              color="cyan"
              delay={0.2}
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={stats.currentStreak}
              color="orange"
              delay={0.3}
            />
            <StatCard
              icon={Trophy}
              label="Total XP"
              value={stats.totalXp.toLocaleString()}
              change={stats.todayXp > 0 ? `+${stats.todayXp}` : undefined}
              color="pink"
              delay={0.4}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <LogIn className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign in to track your progress</h3>
            <p className="text-muted-foreground mb-4">
              Create an account to save your learning progress, streaks, and achievements
            </p>
            <Button onClick={() => navigate("/auth")} className="gap-2">
              <LogIn className="w-4 h-4" />
              Sign In / Register
            </Button>
          </motion.div>
        )}
      </section>

      {/* Learning Curve - Only show when authenticated */}
      {isAuthenticated && (
        <section>
          <LearningCurve className="w-full" />
        </section>
      )}

      {/* Weakness Report - Only show when authenticated */}
      {isAuthenticated && (
        <section>
          <WeaknessReport className="w-full" />
        </section>
      )}

      {/* Reading Games Section */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display font-semibold text-xl mb-6 flex items-center gap-2"
        >
          <BookOpen className="w-5 h-5 text-primary" />
          Reading Games
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <GameCard
            icon={Rocket}
            title="Rocket Vocabulary"
            description="Keep the rocket flying by choosing correct synonyms"
            path="/rocket-game"
            color="purple"
            delay={0.4}
          />
          <GameCard
            icon={Brain}
            title="Recall Challenge"
            description="Fill in the blank with the correct vocabulary"
            path="/recall-game"
            color="cyan"
            delay={0.5}
          />
          <GameCard
            icon={Puzzle}
            title="Word Parts"
            description="Learn prefixes, roots, and suffixes"
            path="/word-parts"
            color="pink"
            delay={0.6}
          />
          <GameCard
            icon={Zap}
            title="Speed Reading"
            description="Enhance reading speed and comprehension"
            path="/speed-reading"
            color="orange"
            delay={0.7}
          />
          <GameCard
            icon={BookOpen}
            title="Context Match"
            description="Choose vocabulary that fits the sentence"
            path="/context-game"
            color="green"
            delay={0.8}
          />
        </div>
      </section>

      {/* Speaking Games Section */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="font-display font-semibold text-xl mb-6 flex items-center gap-2"
        >
          <MessageSquare className="w-5 h-5 text-neon-green" />
          Speaking Games
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <GameCard
            icon={MessageSquare}
            title="Conversation Practice"
            description="Use vocabulary in real conversations"
            path="/conversation"
            color="green"
            delay={0.6}
          />
          <GameCard
            icon={BookCheck}
            title="Diction"
            description="Avoid embarrassing errors in conversations"
            path="/diction"
            color="cyan"
            delay={0.7}
          />
          <GameCard
            icon={Mic}
            title="Pronunciation"
            description="Master correct pronunciation and avoid mistakes"
            path="/pronunciation"
            color="purple"
            delay={0.8}
          />
          <GameCard
            icon={Link2}
            title="Transitions"
            description="Connect ideas with powerful transition phrases"
            path="/transitions"
            color="orange"
            delay={0.9}
          />
          <GameCard
            icon={Headphones}
            title="Shadowing Practice"
            description="Follow along and practice pronunciation with daily sentences"
            path="/shadowing"
            color="pink"
            delay={1.0}
          />
        </div>
      </section>

      {/* Writing Games Section */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="font-display font-semibold text-xl mb-6 flex items-center gap-2"
        >
          <PenTool className="w-5 h-5 text-neon-pink" />
          Writing Games
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <GameCard
            icon={Sparkles}
            title="Clarity"
            description="Identify wordy sentences and make them concise"
            path="/clarity"
            color="orange"
            delay={0.8}
          />
          <GameCard
            icon={Scissors}
            title="Brevity"
            description="Eliminate redundancy in your writing"
            path="/brevity"
            color="pink"
            delay={0.9}
          />
          <GameCard
            icon={Type}
            title="Punctuation"
            description="Master apostrophes, commas, hyphens, and more"
            path="/punctuation"
            color="purple"
            delay={1.0}
          />
          <GameCard
            icon={PenLine}
            title="Rephrase Master"
            description="Improve paragraphs with better conjunctions and flow"
            path="/rephrase"
            color="cyan"
            delay={1.1}
          />
        </div>
      </section>

      {/* Tools Section */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="font-display font-semibold text-xl mb-6 flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-primary" />
          Tools
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <GameCard
            icon={Sparkles}
            title="Rephrase Analyzer"
            description="Get comprehensive grammar analysis and natural rephrasing"
            path="/rephrase-analyzer"
            color="purple"
            delay={1.0}
          />
        </div>
      </section>

      {/* Listening & Comprehension Section */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="font-display font-semibold text-xl mb-6 flex items-center gap-2"
        >
          <Headphones className="w-5 h-5 text-accent" />
          Listening & Comprehension
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <GameCard
            icon={Focus}
            title="Attention"
            description="Match concepts while listening to articles"
            path="/attention"
            color="cyan"
            delay={1.0}
          />
          <GameCard
            icon={Headphones}
            title="Listening & Response"
            description="Choose the best response to conversations"
            path="/listening-game"
            color="purple"
            delay={1.1}
          />
        </div>
      </section>

      {/* SRS Review Section */}
      {isAuthenticated && (
        <section>
          <SRSReviewCard />
        </section>
      )}

      {/* Footer with Buy Me a Coffee */}
      <Footer />
    </div>
  );
};

export default Dashboard;
