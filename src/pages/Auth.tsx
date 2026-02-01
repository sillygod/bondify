import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { login, register } from "@/lib/api/auth";
import { useStats } from "@/contexts/StatsContext";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login: contextLogin } = useStats();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await login({
          email: formData.email,
          password: formData.password,
        });
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      } else {
        response = await register({
          email: formData.email,
          password: formData.password,
          display_name: formData.displayName || undefined,
        });
        toast({
          title: "Account created!",
          description: "Welcome to Bondify. Let's start learning!",
        });
      }
      contextLogin(response.access_token, response.refresh_token);
      navigate("/");
    } catch (error: any) {
      // Handle different error formats
      let errorMessage = "Something went wrong. Please try again.";

      if (error.detail) {
        // Check if detail is an array (Pydantic validation errors)
        if (Array.isArray(error.detail)) {
          errorMessage = error.detail
            .map((err: any) => err.msg || err.message || JSON.stringify(err))
            .join(". ");
        } else if (typeof error.detail === "string") {
          errorMessage = error.detail;
        } else if (typeof error.detail === "object") {
          errorMessage = error.detail.detail || error.detail.msg || JSON.stringify(error.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-neon-cyan flex items-center justify-center">
              <span className="text-2xl font-display font-bold">B</span>
            </div>
            <span className="text-2xl font-display font-bold">BONDIFY</span>
          </motion.div>
          <p className="text-muted-foreground">Learn English with AI</p>
        </div>

        <Card className="glass-card border-border/30">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-display">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to continue your learning journey"
                : "Start your English learning adventure"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder="Your name"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Continue as guest (with demo data)
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
