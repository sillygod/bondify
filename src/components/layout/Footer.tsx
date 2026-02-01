import { Coffee, Heart } from "lucide-react";
import { motion } from "framer-motion";

const COFFEE_LINK = "https://buymeacoffee.com/jgebang";

interface FooterProps {
    className?: string;
    minimal?: boolean;
}

/**
 * Footer component with Buy Me a Coffee link
 * 
 * @param minimal - Show only the coffee link (for game end screens)
 */
export const Footer = ({ className = "", minimal = false }: FooterProps) => {
    if (minimal) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`flex items-center justify-center gap-2 text-sm text-muted-foreground ${className}`}
            >
                <span>喜歡 Bondify 嗎？</span>
                <a
                    href={COFFEE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFDD00]/20 hover:bg-[#FFDD00]/30 border border-[#FFDD00]/30 text-[#FFDD00] font-medium transition-all hover:scale-105"
                >
                    <Coffee className="w-4 h-4" />
                    <span>Buy me a coffee</span>
                </a>
            </motion.div>
        );
    }

    return (
        <footer className={`py-6 mt-8 border-t border-border/30 ${className}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <span>Made with</span>
                    <Heart className="w-4 h-4 text-neon-pink fill-neon-pink" />
                    <span>for learners</span>
                </div>

                <a
                    href={COFFEE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFDD00]/10 hover:bg-[#FFDD00]/20 border border-[#FFDD00]/20 hover:border-[#FFDD00]/40 text-foreground/70 hover:text-foreground transition-all group"
                >
                    <Coffee className="w-4 h-4 text-[#FFDD00] group-hover:scale-110 transition-transform" />
                    <span>Support this project</span>
                </a>
            </div>
        </footer>
    );
};

export default Footer;
