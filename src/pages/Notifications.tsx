import { Bell, BookOpen, Trophy, Zap, Calendar, Check, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const initialNotifications = [
  {
    id: 1,
    icon: Trophy,
    title: "Achievement Unlocked!",
    message: "You've completed 10 vocabulary exercises. Keep up the great work!",
    time: "2 min ago",
    unread: true,
    color: "text-neon-orange",
    bgColor: "bg-neon-orange/10",
  },
  {
    id: 2,
    icon: Zap,
    title: "Streak Milestone",
    message: "You're on a 7-day streak! Keep it up to unlock special rewards.",
    time: "1 hour ago",
    unread: true,
    color: "text-neon-pink",
    bgColor: "bg-neon-pink/10",
  },
  {
    id: 3,
    icon: BookOpen,
    title: "New Words Added",
    message: "5 new words have been added to your word list. Review them now!",
    time: "3 hours ago",
    unread: false,
    color: "text-neon-cyan",
    bgColor: "bg-neon-cyan/10",
  },
  {
    id: 4,
    icon: Calendar,
    title: "Daily Reminder",
    message: "Don't forget to practice today! Your daily goal is waiting.",
    time: "Yesterday",
    unread: false,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 5,
    icon: Trophy,
    title: "New Badge Earned",
    message: "You've earned the 'Word Master' badge for learning 50 words!",
    time: "2 days ago",
    unread: false,
    color: "text-neon-orange",
    bgColor: "bg-neon-orange/10",
  },
  {
    id: 6,
    icon: Zap,
    title: "Level Up!",
    message: "Congratulations! You've reached Level 5 in vocabulary mastery.",
    time: "3 days ago",
    unread: false,
    color: "text-neon-pink",
    bgColor: "bg-neon-pink/10",
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Notifications</h1>
            <p className="text-muted-foreground text-sm">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-card rounded-2xl border border-border/50"
          >
            <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
          </motion.div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-2xl border transition-all ${
                notification.unread
                  ? "bg-card border-primary/20 shadow-lg shadow-primary/5"
                  : "bg-card/50 border-border/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${notification.bgColor} ${notification.color}`}
                >
                  <notification.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {notification.title}
                        {notification.unread && (
                          <span className="w-2 h-2 bg-neon-cyan rounded-full" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {notification.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {notification.unread && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
