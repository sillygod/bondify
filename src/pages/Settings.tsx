import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Volume2, VolumeX, GraduationCap, Save, Loader2, Bell, Clock, Cpu, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, updateUser, UserProfile } from "@/lib/api/user";
import { getAvailableModels, ModelInfo } from "@/lib/api";
import { useStats } from "@/contexts/StatsContext";

interface UserSettings {
  profile: {
    name: string;
    email: string;
  };
  sound: {
    enabled: boolean;
    notifications: boolean;
  };
  reminder: {
    enabled: boolean;
    time: string;
  };
  learningLevel: "beginner" | "intermediate" | "advanced";
  ai: {
    provider: string;
    apiKey: string;
    model: string;
  };
}

const defaultSettings: UserSettings = {
  profile: {
    name: "",
    email: "",
  },
  sound: {
    enabled: true,
    notifications: true,
  },
  reminder: {
    enabled: false,
    time: "09:00",
  },
  learningLevel: "intermediate",
  ai: {
    provider: "gemini",
    apiKey: "",
    model: "",
  },
};

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useStats();

  // AI Model Listing
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      // First try to load from localStorage
      const saved = localStorage.getItem("lexicon-settings");
      let currentSettings = defaultSettings;

      if (saved) {
        const parsed = JSON.parse(saved);
        currentSettings = {
          ...defaultSettings,
          ...parsed,
          ai: { ...defaultSettings.ai, ...(parsed.ai || {}) }
        };
        setSettings(currentSettings);
      }

      // If authenticated, load from API overrides
      if (isAuthenticated) {
        try {
          const user = await getCurrentUser();
          currentSettings = {
            ...currentSettings,
            profile: {
              name: user.displayName || "",
              email: user.email,
            },
            sound: {
              enabled: user.soundEnabled,
              notifications: user.notificationsEnabled,
            },
            reminder: {
              enabled: user.reminderEnabled,
              time: user.reminderTime || "09:00",
            },
            learningLevel: user.learningLevel,
          };
          setSettings(currentSettings);
        } catch (error) {
          console.error("Error loading user settings:", error);
        }
      }
      setIsLoading(false);

      // Trigger model fetch if key exists
      if (currentSettings.ai.apiKey && currentSettings.ai.provider) {
        debouncedFetchModels(currentSettings.ai.provider, currentSettings.ai.apiKey);
      }
    };

    loadSettings();
  }, []);

  // Debounced model fetch
  const fetchModels = async (provider: string, apiKey: string) => {
    if (!apiKey || apiKey.length < 5) return;

    setIsLoadingModels(true);
    try {
      const response = await getAvailableModels(provider, apiKey);
      setAvailableModels(response.models);

      // If current model is empty or not in list, maybe select first? 
      // Checking if strict matching is needed. For now keep existing or default.
    } catch (error) {
      console.error("Failed to fetch models:", error);
      // Optional: don't show toast on auto-fetch to avoid spam, show clear error in UI?
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Create a debounced version of fetchModels
  const debouncedFetchModels = useCallback((provider: string, apiKey: string) => {
    // We'll use a simple timeout approach inside useEffect for settings changes
    // But direct call here for initial load
    fetchModels(provider, apiKey);
  }, []);

  // Watch for provider/key changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (settings.ai.provider && settings.ai.apiKey) {
        fetchModels(settings.ai.provider, settings.ai.apiKey);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [settings.ai.provider, settings.ai.apiKey]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateAiSettings = (updates: Partial<UserSettings['ai']>) => {
    setSettings((prev) => ({
      ...prev,
      ai: { ...prev.ai, ...updates }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);

    // Save to localStorage
    localStorage.setItem("lexicon-settings", JSON.stringify(settings));

    // If authenticated, save to API
    if (isAuthenticated) {
      try {
        await updateUser({
          display_name: settings.profile.name || undefined,
          learning_level: settings.learningLevel,
          sound_enabled: settings.sound.enabled,
          notifications_enabled: settings.sound.notifications,
          reminder_enabled: settings.reminder.enabled,
          reminder_time: settings.reminder.time,
        });
      } catch (error) {
        console.error("Error saving settings to API:", error);
        toast({
          title: "Warning",
          description: "Settings saved locally but failed to sync with server.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
    }

    setHasChanges(false);
    setIsSaving(false);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-display font-bold neon-text">Settings</h1>
        <p className="text-muted-foreground">
          Customize your learning experience
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={settings.profile.name}
                  onChange={(e) =>
                    updateSettings({
                      profile: { ...settings.profile, name: e.target.value },
                    })
                  }
                  className="bg-secondary/50 border-border/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={settings.profile.email}
                  onChange={(e) =>
                    updateSettings({
                      profile: { ...settings.profile, email: e.target.value },
                    })
                  }
                  disabled={isAuthenticated}
                  className="bg-secondary/50 border-border/30"
                />
                {isAuthenticated && (
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sound Preferences Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                  {settings.sound.enabled ? (
                    <Volume2 className="w-5 h-5 text-neon-cyan" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <CardTitle>Sound & Notifications</CardTitle>
                  <CardDescription>Audio and alert preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds during games
                  </p>
                </div>
                <Switch
                  checked={settings.sound.enabled}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      sound: { ...settings.sound, enabled: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive learning reminders
                  </p>
                </div>
                <Switch
                  checked={settings.sound.notifications}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      sound: { ...settings.sound, notifications: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Reminder Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-orange/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-neon-orange" />
                </div>
                <div>
                  <CardTitle>Daily Reminder</CardTitle>
                  <CardDescription>Get reminded to study every day</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Daily Reminder</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a reminder to study at your preferred time
                  </p>
                </div>
                <Switch
                  checked={settings.reminder.enabled}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      reminder: { ...settings.reminder, enabled: checked },
                    })
                  }
                />
              </div>
              {settings.reminder.enabled && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Reminder Time
                  </Label>
                  <Input
                    type="time"
                    value={settings.reminder.time}
                    onChange={(e) =>
                      updateSettings({
                        reminder: { ...settings.reminder, time: e.target.value },
                      })
                    }
                    className="bg-secondary/50 border-border/30 w-40"
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll receive a notification at this time to remind you to study
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Learning Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2"
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-neon-pink" />
                </div>
                <div>
                  <CardTitle>Learning Level</CardTitle>
                  <CardDescription>
                    Adjust content difficulty to match your skill
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.learningLevel}
                onValueChange={(value) =>
                  updateSettings({
                    learningLevel: value as UserSettings["learningLevel"],
                  })
                }
                className="grid gap-4 md:grid-cols-3"
              >
                <Label
                  htmlFor="beginner"
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${settings.learningLevel === "beginner"
                    ? "border-primary bg-primary/10"
                    : "border-border/30 hover:border-border/50"
                    }`}
                >
                  <RadioGroupItem value="beginner" id="beginner" className="sr-only" />
                  <div className="text-3xl">🌱</div>
                  <div className="text-center">
                    <p className="font-semibold">Beginner</p>
                    <p className="text-sm text-muted-foreground">
                      Basic vocabulary and simple sentences
                    </p>
                  </div>
                </Label>

                <Label
                  htmlFor="intermediate"
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${settings.learningLevel === "intermediate"
                    ? "border-primary bg-primary/10"
                    : "border-border/30 hover:border-border/50"
                    }`}
                >
                  <RadioGroupItem value="intermediate" id="intermediate" className="sr-only" />
                  <div className="text-3xl">🌿</div>
                  <div className="text-center">
                    <p className="font-semibold">Intermediate</p>
                    <p className="text-sm text-muted-foreground">
                      Complex grammar and varied vocabulary
                    </p>
                  </div>
                </Label>

                <Label
                  htmlFor="advanced"
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${settings.learningLevel === "advanced"
                    ? "border-primary bg-primary/10"
                    : "border-border/30 hover:border-border/50"
                    }`}
                >
                  <RadioGroupItem value="advanced" id="advanced" className="sr-only" />
                  <div className="text-3xl">🌳</div>
                  <div className="text-center">
                    <p className="font-semibold">Advanced</p>
                    <p className="text-sm text-muted-foreground">
                      Nuanced expressions and idioms
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Config Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-neon-purple" />
                </div>
                <div>
                  <CardTitle>AI Configuration</CardTitle>
                  <CardDescription>Bring your own API key</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <RadioGroup
                  value={settings.ai?.provider || "gemini"}
                  onValueChange={(val) => updateAiSettings({ provider: val })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gemini" id="gemini" />
                    <Label htmlFor="gemini">Gemini</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mistral" id="mistral" />
                    <Label htmlFor="mistral">Mistral</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API Key"
                    value={settings.ai?.apiKey || ""}
                    onChange={(e) => updateAiSettings({ apiKey: e.target.value })}
                    className="bg-secondary/50 border-border/30 pr-10"
                  />
                  {isLoadingModels && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your key is stored locally and sent only to the AI provider.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="model">Model Name</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => fetchModels(settings.ai.provider, settings.ai.apiKey)}
                    disabled={isLoadingModels || !settings.ai.apiKey}
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingModels ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                <Select
                  value={settings.ai.model}
                  onValueChange={(val) => updateAiSettings({ model: val })}
                  disabled={isLoadingModels}
                >
                  <SelectTrigger className="bg-secondary/50 border-border/30">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.length === 0 && settings.ai.model && (
                      <SelectItem value={settings.ai.model}>{settings.ai.model} (Custom)</SelectItem>
                    )}
                    {availableModels.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                    {availableModels.length === 0 && !settings.ai.model && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {settings.ai.apiKey ? "No models found" : "Enter API Key first"}
                      </div>
                    )}
                  </SelectContent>
                </Select>

                {settings.ai.model && (
                  <p className="text-xs text-muted-foreground">
                    Currently selected: {settings.ai.model}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <Button
          onClick={saveSettings}
          disabled={!hasChanges || isSaving}
          className="gap-2"
          size="lg"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </motion.div>
    </div>
  );
};

export default Settings;
