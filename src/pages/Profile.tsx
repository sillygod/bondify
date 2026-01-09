import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Trophy, Target, BookOpen, Settings, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser, UserProfile } from "@/lib/api/user";
import { getStats, getAchievements, LearningStats, Achievement } from "@/lib/api/progress";
import { logout } from "@/lib/api/auth";
import { tokenManager } from "@/lib/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = tokenManager.isAuthenticated();

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        // Not authenticated - will show login prompt
        setIsLoading(false);
        return;
      }

      try {
        const [userData, statsData, achievementsData] = await Promise.all([
          getCurrentUser(),
          getStats(),
          getAchievements(),
        ]);
        setUser(userData);
        setStats(statsData);
        setAchievements(achievementsData);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayName = user?.displayName || "User";
  const email = user?.email || "";
  const createdAt = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "";

  const statItems = [
    { label: "Words Learned", value: stats?.wordsLearned || 0, icon: BookOpen, color: "text-neon-cyan" },
    { label: "Current Streak", value: stats?.currentStreak || 0, icon: Target, color: "text-neon-orange" },
    { label: "Achievements", value: achievements.filter(a => a.unlocked).length, icon: Trophy, color: "text-neon-pink" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[400px] text-center"
        >
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Sign in to view your profile</h2>
          <p className="text-muted-foreground mb-6">
            Create an account or sign in to track your learning progress
          </p>
          <Button onClick={() => navigate("/auth")} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign In / Register
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold tracking-wide">Profile</h1>
          <p className="text-muted-foreground">Manage your account and view progress</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="glass-card border-border/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-cyan to-primary flex items-center justify-center font-display font-bold text-3xl mb-4">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-display font-semibold">{displayName}</h2>
                <p className="text-muted-foreground text-sm">{email}</p>
                
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {createdAt}</span>
                </div>

                <div className="w-full mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Level Progress</span>
                    <span className="font-medium">Level {Math.floor((stats?.totalXp || 0) / 500) + 1}</span>
                  </div>
                  <Progress value={((stats?.totalXp || 0) % 500) / 5} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {(stats?.totalXp || 0) % 500} / 500 XP
                  </p>
                </div>

                <div className="w-full mt-6 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => navigate("/settings")}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats and Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statItems.map((stat) => (
                <Card key={stat.label} className="glass-card border-border/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-display font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-neon-orange" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.name}
                      className={`p-4 rounded-xl border transition-all ${
                        achievement.unlocked
                          ? "bg-secondary/50 border-neon-cyan/30"
                          : "bg-secondary/20 border-border/30 opacity-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.unlocked 
                            ? "bg-neon-cyan/20 text-neon-cyan" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Learning Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-neon-cyan" />
                  Learning Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-secondary/30">
                    <p className="text-2xl font-display font-bold text-neon-cyan">{stats?.lessonsDone || 0}</p>
                    <p className="text-sm text-muted-foreground">Lessons Done</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-secondary/30">
                    <p className="text-2xl font-display font-bold text-neon-orange">{stats?.timeSpentHours || 0}h</p>
                    <p className="text-sm text-muted-foreground">Time Spent</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-secondary/30">
                    <p className="text-2xl font-display font-bold text-neon-pink">{Math.round((stats?.accuracyRate || 0) * 100)}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-secondary/30">
                    <p className="text-2xl font-display font-bold text-primary">{stats?.bestStreak || 0}</p>
                    <p className="text-sm text-muted-foreground">Best Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
