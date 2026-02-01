import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Rocket,
  BookOpen,
  LayoutDashboard,
  Settings as SettingsIcon,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCcw,
  BookMarked,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: RefreshCcw, label: "SRS Review", path: "/srs-review" },
  { icon: BookMarked, label: "Reading Mode", path: "/reading" },
  { icon: FileText, label: "Rephrase Analyzer", path: "/rephrase-analyzer" },
  { icon: BookOpen, label: "Word List", path: "/word-list" },
  { icon: Info, label: "About", path: "/about" },
];

export const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) => {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
          width: collapsed ? 80 : 280
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-card border-r border-border",
          "flex flex-col overflow-hidden",
          "lg:sticky lg:top-0 lg:translate-x-0 lg:h-screen"
        )}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo & Collapse Toggle */}
        <div className={cn(
          "p-4 flex items-center shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-neon-pink flex items-center justify-center neon-glow shrink-0">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <h1 className="font-display font-bold text-lg tracking-wide neon-text">
                  BONDIFY
                </h1>
                <p className="text-xs text-muted-foreground">Learn English</p>
              </motion.div>
            )}
          </div>

          {/* Collapse toggle - Desktop */}
          <button
            onClick={onToggleCollapse}
            className={cn(
              "hidden lg:flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
              "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 py-6 space-y-2 overflow-y-auto", collapsed ? "px-2" : "px-4")}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const linkContent = (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 py-3 rounded-xl transition-all duration-300",
                  "hover:bg-secondary/50 group relative",
                  collapsed ? "px-3 justify-center" : "px-4",
                  isActive && "bg-primary/20 border border-primary/30"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/30"
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors relative z-10 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && (
                  <span
                    className={cn(
                      "font-medium relative z-10 transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                )}
                {isActive && !collapsed && (
                  <div className="absolute right-3 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                )}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* Settings */}
        <div className={cn(
          "border-t border-border/30 shrink-0 py-4",
          collapsed ? "px-2" : "px-4"
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-center py-3 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-0",
                      isActive
                        ? "bg-secondary/50 text-foreground"
                        : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                    )
                  }
                >
                  <SettingsIcon className="w-5 h-5 mx-auto" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Settings
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-colors",
                  isActive
                    ? "bg-secondary/60 text-foreground"
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                )
              }
            >
              <SettingsIcon className="w-5 h-5 shrink-0" />
              <span className="font-medium">Settings</span>
            </NavLink>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};
