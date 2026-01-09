import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Volume2, VolumeX, GraduationCap, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, updateUser, UserProfile } from "@/lib/api/user";
import { tokenManager } from "@/lib/api";

interface UserSettings {
  profile: {
    name: string;
    email: string;
  };
  sound: {
    enabled: boolean;
    notifications: boolean;
  };
  learningLevel: "beginner" | "intermediate" | "advanced";
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
  learningLevel: "intermediate",
};

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      // First try to load from localStorage
      const saved = localStorage.getItem("lexicon-settings");
      if (saved) {
        setSettings(JSON.parse(saved));
      }

      // If authenticated, load from API
      if (tokenManager.isAuthenticated()) {
        try {
          const user = await getCurrentUser();
          setSettings({
            profile: {
              name: user.displayName || "",
              email: user.email,
            },
            sound: {
              enabled: user.soundEnabled,
              notifications: user.notificationsEnabled,
            },
            learningLevel: user.learningLevel,
          });
        } catch (error) {
          console.error("Error loading user settings:", error);
        }
      }
      setIsLoading(false);
    };

    loadSettings();
  }, []);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem("lexicon-settings", JSON.stringify(settings));

    // If authenticated, save to API
    if (tokenManager.isAuthenticated()) {
      try {
        await updateUser({
          display_name: settings.profile.name || undefined,
          learning_level: settings.learningLevel,
          sound_enabled: settings.sound.enabled,
          notifications_enabled: settings.sound.notifications,
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
                  disabled={tokenManager.isAuthenticated()}
                  className="bg-secondary/50 border-border/30"
                />
                {tokenManager.isAuthenticated() && (
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
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.learningLevel === "beginner"
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
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.learningLevel === "intermediate"
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
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.learningLevel === "advanced"
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
