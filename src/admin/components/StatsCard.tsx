import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon: LucideIcon;
    iconColor?: string;
}

export const StatsCard = ({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor = "text-cyan-400",
}: StatsCardProps) => {
    return (
        <div className="bg-[#0d1321] border border-[#1a2744] rounded-2xl p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
                    <p className="text-3xl font-bold text-white tracking-tight">{value.toLocaleString()}</p>
                    {change && (
                        <p
                            className={cn(
                                "text-sm font-medium mt-2 flex items-center gap-1",
                                changeType === "positive" && "text-emerald-400",
                                changeType === "negative" && "text-red-400",
                                changeType === "neutral" && "text-gray-400"
                            )}
                        >
                            {changeType === "positive" && "↗"}
                            {changeType === "negative" && "↘"}
                            {change}
                        </p>
                    )}
                </div>
                <div className={cn("p-3 rounded-xl bg-[#1a2744]", iconColor)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};
