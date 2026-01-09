import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  color: "purple" | "cyan" | "pink" | "green" | "orange";
  delay?: number;
  onClick?: () => void;
}

const colorMap = {
  purple: {
    bg: "from-primary/20 to-primary/5",
    border: "border-primary/30",
    icon: "text-primary",
    glow: "shadow-[0_0_20px_hsl(270_100%_65%/0.3)]",
  },
  cyan: {
    bg: "from-neon-cyan/20 to-neon-cyan/5",
    border: "border-neon-cyan/30",
    icon: "text-neon-cyan",
    glow: "shadow-[0_0_20px_hsl(180_100%_50%/0.3)]",
  },
  pink: {
    bg: "from-neon-pink/20 to-neon-pink/5",
    border: "border-neon-pink/30",
    icon: "text-neon-pink",
    glow: "shadow-[0_0_20px_hsl(320_100%_60%/0.3)]",
  },
  green: {
    bg: "from-neon-green/20 to-neon-green/5",
    border: "border-neon-green/30",
    icon: "text-neon-green",
    glow: "shadow-[0_0_20px_hsl(150_100%_50%/0.3)]",
  },
  orange: {
    bg: "from-neon-orange/20 to-neon-orange/5",
    border: "border-neon-orange/30",
    icon: "text-neon-orange",
    glow: "shadow-[0_0_20px_hsl(30_100%_55%/0.3)]",
  },
};

export const StatCard = ({ icon: Icon, label, value, change, color, delay = 0, onClick }: StatCardProps) => {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-gradient-to-br backdrop-blur-xl border",
        colors.bg,
        colors.border,
        colors.glow,
        onClick && "cursor-pointer"
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-xl bg-card/50", colors.border)}>
            <Icon className={cn("w-6 h-6", colors.icon)} />
          </div>
          {change && (
            <span className="text-sm text-neon-green font-medium">{change}</span>
          )}
        </div>
        <p className="text-3xl font-display font-bold mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      
      {/* Decorative gradient blob */}
      <div
        className={cn(
          "absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30",
          color === "purple" && "bg-primary",
          color === "cyan" && "bg-neon-cyan",
          color === "pink" && "bg-neon-pink",
          color === "green" && "bg-neon-green",
          color === "orange" && "bg-neon-orange"
        )}
      />
    </motion.div>
  );
};
