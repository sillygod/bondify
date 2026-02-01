import { useEffect, useState } from "react";
import {
    Plus,
    Check,
    Zap,
    Trash2,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    ExternalLink,
    Cpu
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types
interface Provider {
    id: number;
    name: string;
    provider_type: "gemini" | "mistral";
    api_key_masked: string;
    model: string | null;
    is_active: boolean;
    last_used_at: string | null;
    created_at: string;
    updated_at: string;
}

interface ProviderStatus {
    source: "database" | "environment";
    provider_id: number | null;
    provider_name: string | null;
    provider_type: string | null;
    model: string | null;
    last_used_at: string | null;
    available_from_env?: string[];
}

interface UsageStats {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    success_rate: number;
    total_tokens: number;
    period_days: number;
}

interface TestResult {
    success: boolean;
    message: string;
    models: { id: string; name: string }[];
}

// Add/Edit Provider Modal
const ProviderModal = ({
    isOpen,
    onClose,
    onSave,
    provider,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    provider?: Provider | null;
}) => {
    const [name, setName] = useState("");
    const [providerType, setProviderType] = useState<"gemini" | "mistral">("gemini");
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("");
    const [setActive, setSetActive] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (provider) {
            setName(provider.name);
            setProviderType(provider.provider_type);
            setModel(provider.model || "");
            setApiKey("");
        } else {
            setName("");
            setProviderType("gemini");
            setApiKey("");
            setModel("");
            setSetActive(false);
        }
        setTestResult(null);
    }, [provider, isOpen]);

    const handleTest = async () => {
        if (!apiKey) {
            toast({ title: "API Key required", description: "Please enter an API key to test", variant: "destructive" });
            return;
        }
        setTesting(true);
        try {
            const result = await api.post<TestResult>("/api/admin/ai-providers/test", {
                provider_type: providerType,
                api_key: apiKey,
            });
            setTestResult(result);
            if (result.success) {
                toast({ title: "Connection successful!", description: result.message });
            } else {
                toast({ title: "Connection failed", description: result.message, variant: "destructive" });
            }
        } catch (error: any) {
            setTestResult({ success: false, message: error.message, models: [] });
            toast({ title: "Test failed", description: error.message, variant: "destructive" });
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            toast({ title: "Name required", variant: "destructive" });
            return;
        }
        if (!provider && !apiKey) {
            toast({ title: "API Key required", variant: "destructive" });
            return;
        }

        onSave({
            name: name.trim(),
            provider_type: providerType,
            api_key: apiKey || undefined,
            model: model || undefined,
            set_active: setActive,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d1321] border border-[#1a2744] rounded-2xl w-full max-w-lg">
                <div className="p-6 border-b border-[#1a2744]">
                    <h2 className="text-xl font-semibold text-white">
                        {provider ? "Edit Provider" : "Add New Provider"}
                    </h2>
                </div>

                <div className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Production Gemini"
                            className="w-full px-4 py-3 bg-[#1a2744] border border-[#2a3754] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    {/* Provider Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Provider</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(["gemini", "mistral"] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setProviderType(type)}
                                    disabled={!!provider}
                                    className={`p-4 rounded-xl border transition-all ${providerType === type
                                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                                        : "border-[#2a3754] bg-[#1a2744] text-gray-400 hover:border-gray-600"
                                        } ${provider ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                    <div className="font-medium capitalize">{type}</div>
                                    <div className="text-xs mt-1 text-gray-500">
                                        {type === "gemini" ? "Google AI" : "Mistral AI"}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            API Key {provider && <span className="text-gray-600">(leave empty to keep current)</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={provider ? "••••••••••••" : "Enter API key"}
                                className="w-full px-4 py-3 pr-24 bg-[#1a2744] border border-[#2a3754] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Test Connection - moved before Model selection */}
                    {apiKey && (
                        <div className="bg-[#1a2744] rounded-xl p-4">
                            <button
                                onClick={handleTest}
                                disabled={testing}
                                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                            >
                                <Zap className={`w-4 h-4 ${testing ? "animate-pulse" : ""}`} />
                                <span>{testing ? "Testing..." : "Test Connection"}</span>
                            </button>
                            {testResult && (
                                <div className={`mt-3 flex items-start gap-2 text-sm ${testResult.success ? "text-emerald-400" : "text-red-400"}`}>
                                    {testResult.success ? <CheckCircle className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
                                    <span>{testResult.message}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Model Selection - shows dropdown after successful test */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Model <span className="text-gray-600">(optional, uses default if empty)</span>
                        </label>
                        {testResult?.success && testResult.models.length > 0 ? (
                            <div className="relative">
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#1a2744] border border-[#2a3754] rounded-xl text-white appearance-none focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                                >
                                    <option value="">Use default model</option>
                                    {testResult.models.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name || m.id}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder={providerType === "gemini" ? "gemini-2.0-flash" : "mistral-large-latest"}
                                    className="w-full px-4 py-3 bg-[#1a2744] border border-[#2a3754] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                                {apiKey && !testResult?.success && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        💡 Test connection first to see available models
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Set Active */}
                    {!provider && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={setActive}
                                onChange={(e) => setSetActive(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 bg-[#1a2744] text-cyan-500 focus:ring-cyan-500"
                            />
                            <span className="text-gray-300">Set as active provider</span>
                        </label>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#1a2744] flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
                    >
                        {provider ? "Save Changes" : "Add Provider"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Component
export const AISettings = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [status, setStatus] = useState<ProviderStatus | null>(null);
    const [usageStats, setUsageStats] = useState<Record<number, UsageStats>>({});
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const { toast } = useToast();

    const fetchData = async () => {
        try {
            const [providersRes, statusRes] = await Promise.all([
                api.get<{ providers: Provider[] }>("/api/admin/ai-providers"),
                api.get<ProviderStatus>("/api/admin/ai-providers/status"),
            ]);
            setProviders(providersRes.providers);
            setStatus(statusRes);

            // Fetch usage for each provider
            const usagePromises = providersRes.providers.map((p) =>
                api.get<UsageStats>(`/api/admin/ai-providers/${p.id}/usage`).then((stats) => ({ id: p.id, stats }))
            );
            const usageResults = await Promise.all(usagePromises);
            const usageMap: Record<number, UsageStats> = {};
            usageResults.forEach(({ id, stats }) => {
                usageMap[id] = stats;
            });
            setUsageStats(usageMap);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddProvider = () => {
        setEditingProvider(null);
        setModalOpen(true);
    };

    const handleEditProvider = (provider: Provider) => {
        setEditingProvider(provider);
        setModalOpen(true);
    };

    const handleSaveProvider = async (data: any) => {
        try {
            if (editingProvider) {
                await api.patch(`/api/admin/ai-providers/${editingProvider.id}`, data);
                toast({ title: "Provider updated" });
            } else {
                await api.post("/api/admin/ai-providers", data);
                toast({ title: "Provider added" });
            }
            setModalOpen(false);
            await fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteProvider = async (provider: Provider) => {
        if (!confirm(`Delete "${provider.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/api/admin/ai-providers/${provider.id}`);
            toast({ title: "Provider deleted" });
            await fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleActivate = async (provider: Provider) => {
        try {
            await api.post(`/api/admin/ai-providers/${provider.id}/activate`);
            toast({ title: `${provider.name} is now active` });
            await fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">AI Configuration</h1>
                <p className="text-gray-500">Manage AI provider API keys and monitor usage</p>
            </div>

            {/* Current Status */}
            <div className="bg-[#0d1321] border border-[#1a2744] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-white">Current Status</h2>
                </div>
                {status && (
                    <div className="flex items-center gap-3">
                        {status.source === "database" ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <span className="text-gray-300">
                                    Using <span className="text-cyan-400 font-medium">"{status.provider_name}"</span>
                                    {status.model && <span className="text-gray-500"> ({status.model})</span>}
                                </span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-5 h-5 text-amber-400" />
                                <span className="text-gray-300">
                                    Using environment variable
                                    {status.provider_type && (
                                        <span className="text-gray-500"> ({status.provider_type})</span>
                                    )}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Add Provider Button */}
            <button
                onClick={handleAddProvider}
                className="w-full p-4 border-2 border-dashed border-[#2a3754] rounded-2xl text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                <span>Add Provider</span>
            </button>

            {/* Provider List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                </div>
            ) : providers.length === 0 ? (
                <div className="bg-[#0d1321] border border-[#1a2744] rounded-2xl p-8 text-center">
                    <Cpu className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No AI providers configured</p>
                    <p className="text-sm text-gray-600 mt-1">Add a provider to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {providers.map((provider) => {
                        const usage = usageStats[provider.id];
                        return (
                            <div
                                key={provider.id}
                                className={`bg-[#0d1321] border rounded-2xl p-6 transition-all ${provider.is_active
                                    ? "border-cyan-500/50 bg-gradient-to-r from-cyan-500/5 to-transparent"
                                    : "border-[#1a2744]"
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${provider.is_active ? "bg-emerald-400" : "bg-gray-600"}`} />
                                        <div>
                                            <h3 className="font-semibold text-white">{provider.name}</h3>
                                            <p className="text-sm text-gray-500 capitalize">
                                                {provider.provider_type} • {provider.model || "Default model"}
                                            </p>
                                        </div>
                                        {provider.is_active && (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Last used: {formatDate(provider.last_used_at)}
                                    </div>
                                </div>

                                {/* API Key */}
                                <div className="bg-[#1a2744] rounded-xl px-4 py-3 mb-4">
                                    <span className="text-gray-500 text-sm">API Key: </span>
                                    <span className="text-gray-300 font-mono">{provider.api_key_masked}</span>
                                </div>

                                {/* Usage Stats */}
                                {usage && (
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <div className="text-2xl font-bold text-white">{usage.total_requests}</div>
                                            <div className="text-xs text-gray-500">Requests (30d)</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-emerald-400">{usage.success_rate}%</div>
                                            <div className="text-xs text-gray-500">Success Rate</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white">{usage.failed_requests}</div>
                                            <div className="text-xs text-gray-500">Failed</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white">{usage.total_tokens.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">Tokens</div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-[#1a2744]">
                                    <button
                                        onClick={() => handleEditProvider(provider)}
                                        className="px-4 py-2 rounded-lg bg-[#1a2744] text-gray-300 hover:bg-[#2a3754] transition-colors text-sm"
                                    >
                                        Edit
                                    </button>
                                    {!provider.is_active && (
                                        <button
                                            onClick={() => handleActivate(provider)}
                                            className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm flex items-center gap-1"
                                        >
                                            <Check className="w-4 h-4" />
                                            Set Active
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteProvider(provider)}
                                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm flex items-center gap-1 ml-auto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <ProviderModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveProvider}
                provider={editingProvider}
            />
        </div>
    );
};

export default AISettings;
