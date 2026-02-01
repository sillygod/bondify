import { motion } from "framer-motion";
import { LucideIcon, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GameCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  color: "purple" | "cyan" | "pink" | "green" | "orange";
  delay?: number;
}

const colorMap = {
  purple: {
    gradient: "from-primary via-primary/80 to-neon-pink",
    glow: "group-hover:shadow-[0_0_40px_hsl(270_100%_65%/0.4)]",
  },
  cyan: {
    gradient: "from-neon-cyan via-neon-cyan/80 to-primary",
    glow: "group-hover:shadow-[0_0_40px_hsl(180_100%_50%/0.4)]",
  },
  pink: {
    gradient: "from-neon-pink via-neon-pink/80 to-neon-orange",
    glow: "group-hover:shadow-[0_0_40px_hsl(320_100%_60%/0.4)]",
  },
  green: {
    gradient: "from-neon-green via-neon-green/80 to-neon-cyan",
    glow: "group-hover:shadow-[0_0_40px_hsl(150_100%_50%/0.4)]",
  },
  orange: {
    gradient: "from-neon-orange via-neon-orange/80 to-neon-pink",
    glow: "group-hover:shadow-[0_0_40px_hsl(30_100%_50%/0.4)]",
  },
};

export const GameCard = ({ icon: Icon, title, description, path, color, delay = 0 }: GameCardProps) => {
  const navigate = useNavigate();
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(path)}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 cursor-pointer",
        "glass-card border border-border/30 transition-all duration-300",
        colors.glow
      )}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <div
            className={cn(
              "inline-flex p-3 rounded-xl mb-4",
              "bg-gradient-to-br",
              colors.gradient
            )}
          >
            <Icon className="w-6 h-6 text-background" />
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <motion.div
          whileHover={{ scale: 1.1 }}
          className={cn(
            "p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity",
            "bg-gradient-to-br",
            colors.gradient
          )}
        >
          <Play className="w-5 h-5 text-background" />
        </motion.div>
      </div>

      {/* Hover gradient effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
          "bg-gradient-to-br",
          colors.gradient
        )}
      />
    </motion.div>
  );
};
