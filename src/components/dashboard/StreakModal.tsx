import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Calendar, Trophy, Target, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStreak, StreakData, StreakDay } from "@/lib/api/progress";
import { useStats } from "@/contexts/StatsContext";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate mock streak data for fallback
const generateMockStreakData = (): StreakDay[] => {
  const data: StreakDay[] = [];
  const today = new Date();

  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Simulate activity (more recent = higher chance of activity)
    const hasActivity = i < 7 ? true : Math.random() > 0.3;
    const intensity = hasActivity ? Math.floor(Math.random() * 4) + 1 : 0;

    data.push({
      date: date.toISOString().split('T')[0],
      hasActivity,
      intensity,
      xp: hasActivity ? Math.floor(Math.random() * 200) + 50 : 0,
    });
  }
  return data;
};

const intensityColors = [
  "bg-muted/50",
  "bg-neon-orange/30",
  "bg-neon-orange/50",
  "bg-neon-orange/70",
  "bg-neon-orange",
];

export const StreakModal = ({ isOpen, onClose }: StreakModalProps) => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useStats();

  useEffect(() => {
    const loadStreakData = async () => {
      if (!isOpen) return;

      setIsLoading(true);

      if (isAuthenticated) {
        try {
          const data = await getStreak();
          setStreakData(data);
        } catch (error) {
          console.error("Error loading streak data:", error);
          // Fallback to mock data
          setStreakData({
            currentStreak: 7,
            longestStreak: 14,
            totalDaysActive: 21,
            history: generateMockStreakData(),
          });
        }
      } else {
        // Use mock data if not authenticated
        setStreakData({
          currentStreak: 7,
          longestStreak: 14,
          totalDaysActive: 21,
          history: generateMockStreakData(),
        });
      }

      setIsLoading(false);
    };

    loadStreakData();
  }, [isOpen]);

  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const totalDaysActive = streakData?.totalDaysActive || 0;
  const history = streakData?.history || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg">
              {/* Header gradient */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-neon-orange/20 to-transparent" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-xl hover:bg-secondary/50 transition-colors z-10"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="relative p-6">
                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-neon-orange/20 border border-neon-orange/30">
                    <Flame className="w-6 h-6 text-neon-orange" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold">Streak History</h2>
                    <p className="text-sm text-muted-foreground">Keep the fire burning!</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/30 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Flame className="w-4 h-4 text-neon-orange" />
                          <span className="text-2xl font-display font-bold">{currentStreak}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Current</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/30 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Trophy className="w-4 h-4 text-primary" />
                          <span className="text-2xl font-display font-bold">{longestStreak}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Longest</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/30 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="w-4 h-4 text-neon-green" />
                          <span className="text-2xl font-display font-bold">{totalDaysActive}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Days Active</p>
                      </div>
                    </div>

                    {/* Calendar label */}
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Last 28 days</span>
                    </div>

                    {/* Streak calendar grid */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <div key={i} className="text-center text-xs text-muted-foreground font-medium">
                          {day}
                        </div>
                      ))}
                      {history.map((day, i) => {
                        const dateObj = new Date(day.date);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className={cn(
                              "aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all cursor-default",
                              intensityColors[day.intensity],
                              day.hasActivity && "hover:ring-2 hover:ring-neon-orange/50"
                            )}
                            title={`${dateObj.toLocaleDateString()} - ${day.xp} XP`}
                          >
                            {dateObj.getDate()}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Less</span>
                      <div className="flex gap-1">
                        {intensityColors.map((color, i) => (
                          <div
                            key={i}
                            className={cn("w-4 h-4 rounded", color)}
                          />
                        ))}
                      </div>
                      <span>More</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
