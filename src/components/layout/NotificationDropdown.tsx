import { Bell, BookOpen, Trophy, Zap, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
  {
    id: 1,
    icon: Trophy,
    title: "Achievement Unlocked!",
    message: "You've completed 10 vocabulary exercises",
    time: "2 min ago",
    unread: true,
    color: "text-neon-orange",
  },
  {
    id: 2,
    icon: Zap,
    title: "Streak Milestone",
    message: "You're on a 7-day streak! Keep it up!",
    time: "1 hour ago",
    unread: true,
    color: "text-neon-pink",
  },
  {
    id: 3,
    icon: BookOpen,
    title: "New Words Added",
    message: "5 new words added to your word list",
    time: "3 hours ago",
    unread: false,
    color: "text-neon-cyan",
  },
  {
    id: 4,
    icon: Calendar,
    title: "Daily Reminder",
    message: "Don't forget to practice today!",
    time: "Yesterday",
    unread: false,
    color: "text-primary",
  },
];

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-neon-pink rounded-full" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-card border-border/50 shadow-xl"
      >
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <span className="font-display font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-neon-pink/20 text-neon-pink px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex items-start gap-3 p-3 cursor-pointer focus:bg-secondary/50 ${
                notification.unread ? "bg-secondary/30" : ""
              }`}
            >
              <div className={`p-2 rounded-lg bg-secondary ${notification.color}`}>
                <notification.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {notification.time}
                </p>
              </div>
              {notification.unread && (
                <span className="w-2 h-2 bg-neon-cyan rounded-full mt-2" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem 
          className="justify-center py-3 text-sm text-primary hover:text-primary cursor-pointer focus:bg-secondary/50"
          onClick={() => navigate("/notifications")}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
