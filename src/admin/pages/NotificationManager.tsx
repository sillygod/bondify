import { useState } from "react";
import { Bell, Send, Users, Loader2, CheckCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

type NotificationType = "achievement" | "streak" | "wordlist" | "reminder";

interface BroadcastForm {
    type: NotificationType;
    title: string;
    message: string;
}

export const NotificationManager = () => {
    const [form, setForm] = useState<BroadcastForm>({
        type: "reminder",
        title: "",
        message: "",
    });
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; count: number } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) return;

        setSending(true);
        setResult(null);

        try {
            const response = await fetch(`${API_BASE}/api/notifications/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: form.type,
                    title: form.title,
                    message: form.message,
                    user_ids: null, // Send to all users
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setResult({ success: true, count: data.notificationsSent });
                setForm({ type: "reminder", title: "", message: "" });
            } else {
                setResult({ success: false, count: 0 });
            }
        } catch (error) {
            console.error("Failed to broadcast:", error);
            setResult({ success: false, count: 0 });
        } finally {
            setSending(false);
        }
    };

    const notificationTypes: { value: NotificationType; label: string; color: string }[] = [
        { value: "reminder", label: "Reminder", color: "text-blue-400" },
        { value: "achievement", label: "Achievement", color: "text-orange-400" },
        { value: "streak", label: "Streak", color: "text-pink-400" },
        { value: "wordlist", label: "Wordlist", color: "text-cyan-400" },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Notification Manager</h1>
                <p className="text-gray-500">Send notifications to all users</p>
            </div>

            {/* Broadcast Form */}
            <div className="bg-[#0d1321] border border-[#1a2744] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Broadcast Notification</h2>
                        <p className="text-sm text-gray-500">Send to all registered users</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">
                            Notification Type
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {notificationTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, type: type.value })}
                                    className={`px-4 py-2 rounded-xl border transition-all ${form.type === type.value
                                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                                            : "bg-[#1a2744] border-[#1a2744] text-gray-400 hover:border-gray-600"
                                        }`}
                                >
                                    <span className={form.type === type.value ? type.color : ""}>
                                        {type.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Notification title..."
                            className="w-full px-4 py-3 rounded-xl bg-[#1a2744] border border-[#1a2744] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            maxLength={200}
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Message
                        </label>
                        <textarea
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            placeholder="Notification message..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-[#1a2744] border border-[#1a2744] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-600 mt-1 text-right">
                            {form.message.length}/500
                        </p>
                    </div>

                    {/* Result Message */}
                    {result && (
                        <div
                            className={`p-4 rounded-xl flex items-center gap-3 ${result.success
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                        >
                            {result.success ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Successfully sent {result.count} notifications!</span>
                                </>
                            ) : (
                                <span>Failed to send notifications. Please try again.</span>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={sending || !form.title.trim() || !form.message.trim()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Broadcast to All Users
                                <Users className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NotificationManager;
