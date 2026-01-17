import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    Sparkles,
    ArrowLeft,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/questions", icon: FileText, label: "Questions" },
    { path: "/admin/generate", icon: Sparkles, label: "Generate" },
];

export const AdminSidebar = () => {
    const location = useLocation();

    return (
        <aside className="w-64 bg-[#0d1321] border-r border-[#1a2744] flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-[#1a2744]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-lg">Bondify</h1>
                        <p className="text-xs text-gray-500">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                    : "text-gray-400 hover:bg-[#1a2744] hover:text-white"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[#1a2744]">
                <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-[#1a2744] hover:text-white transition-all duration-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to App</span>
                </Link>
            </div>
        </aside>
    );
};
