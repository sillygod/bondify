import { Bell, Search, User } from "lucide-react";

export const AdminHeader = () => {
    return (
        <header className="h-16 bg-[#0d1321] border-b border-[#1a2744] flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        className="w-full bg-[#1a2744] border border-[#2a3a5a] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Status indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-400">System Online</span>
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-gray-400 hover:bg-[#1a2744] hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full" />
                </button>

                {/* User */}
                <button className="flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:bg-[#1a2744] hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                </button>
            </div>
        </header>
    );
};
