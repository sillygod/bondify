import { useState, useEffect } from "react";
import { Menu, Zap, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { NotificationDropdown } from "./NotificationDropdown";
import { tokenManager } from "@/lib/api";
import { getCurrentUser, UserProfile } from "@/lib/api/user";
import { getStats, LearningStats } from "@/lib/api/progress";

interface HeaderProps {
  onMenuClick: () => void;
  onStreakClick?: () => void;
}

export const Header = ({ onMenuClick, onStreakClick }: HeaderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (tokenManager.isAuthenticated()) {
        try {
          const [userData, statsData] = await Promise.all([
            getCurrentUser(),
            getStats(),
          ]);
          setUser(userData);
          setStats(statsData);
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    };
    loadUserData();
  }, []);

  const displayName = user?.displayName || user?.email?.charAt(0).toUpperCase() || "?";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const currentStreak = stats?.currentStreak || 0;
  const isAuthenticated = tokenManager.isAuthenticated();

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-border/30 px-4 lg:px-6 py-4" style={{ borderRadius: 0 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="font-display font-semibold text-lg tracking-wide">
              {isAuthenticated && user ? `Welcome back, ${displayName}!` : "Welcome back, Learner!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Continue your journey to fluency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Vocabulary Lookup */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/vocabulary-lookup")}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
            title="Vocabulary Lookup"
          >
            <Search className="w-5 h-5 text-neon-cyan" />
          </motion.button>

          {/* Streak */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={onStreakClick}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-orange/20 to-neon-pink/20 border border-neon-orange/30 cursor-pointer"
          >
            <Zap className="w-5 h-5 text-neon-orange" />
            <span className="font-display font-semibold text-neon-orange">{currentStreak}</span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </motion.button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Avatar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(isAuthenticated ? "/profile" : "/auth")}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-primary flex items-center justify-center font-display font-bold text-sm cursor-pointer"
          >
            {avatarLetter}
          </motion.button>
        </div>
      </div>
    </header>
  );
};
