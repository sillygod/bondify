import { Bell, BookOpen, Trophy, Zap, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, useMarkAsRead } from "@/hooks/useNotifications";
import type { Notification } from "@/lib/api/notifications";

// Map notification types to icons
const iconMap = {
  achievement: Trophy,
  streak: Zap,
  wordlist: BookOpen,
  reminder: Calendar,
};

// Map notification types to colors
const colorMap = {
  achievement: "text-neon-orange",
  streak: "text-neon-pink",
  wordlist: "text-neon-cyan",
  reminder: "text-primary",
};

// Format relative time from ISO string
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  };

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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => {
              const Icon = iconMap[notification.type] || Bell;
              const color = colorMap[notification.type] || "text-primary";

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer focus:bg-secondary/50 ${!notification.isRead ? "bg-secondary/30" : ""
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`p-2 rounded-lg bg-secondary ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-neon-cyan rounded-full mt-2" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
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
