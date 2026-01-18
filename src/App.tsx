import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsProvider } from "@/contexts/StatsContext";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import RocketGame from "./pages/RocketGame";
import RecallGame from "./pages/RecallGame";
import WordParts from "./pages/WordParts";
import Conversation from "./pages/Conversation";
import WordList from "./pages/WordList";
import Clarity from "./pages/Clarity";
import Diction from "./pages/Diction";
import Pronunciation from "./pages/Pronunciation";
import SpeedReading from "./pages/SpeedReading";
import Brevity from "./pages/Brevity";
import Transitions from "./pages/Transitions";
import Rephrase from "./pages/Rephrase";
import RephraseAnalyzer from "./pages/RephraseAnalyzer";

import Punctuation from "./pages/Punctuation";
import ContextGame from "./pages/ContextGame";
import ListeningGame from "./pages/ListeningGame";
import Settings from "./pages/Settings";
import Attention from "./pages/Attention";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Admin imports
import { AdminLayout, AdminDashboard, QuestionManager, GenerateQuestions, NotificationManager } from "./admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StatsProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />

            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/questions" element={<QuestionManager />} />
              <Route path="/admin/generate" element={<GenerateQuestions />} />
              <Route path="/admin/notifications" element={<NotificationManager />} />
            </Route>

            {/* Main App Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rocket-game" element={<RocketGame />} />
              <Route path="/recall-game" element={<RecallGame />} />
              <Route path="/word-parts" element={<WordParts />} />
              <Route path="/conversation" element={<Conversation />} />
              <Route path="/word-list" element={<WordList />} />
              <Route path="/clarity" element={<Clarity />} />
              <Route path="/diction" element={<Diction />} />
              <Route path="/pronunciation" element={<Pronunciation />} />
              <Route path="/speed-reading" element={<SpeedReading />} />
              <Route path="/brevity" element={<Brevity />} />
              <Route path="/transitions" element={<Transitions />} />
              <Route path="/rephrase" element={<Rephrase />} />
              <Route path="/rephrase-analyzer" element={<RephraseAnalyzer />} />
              <Route path="/vocabulary-lookup" element={<WordList />} />
              <Route path="/punctuation" element={<Punctuation />} />
              <Route path="/context-game" element={<ContextGame />} />
              <Route path="/listening-game" element={<ListeningGame />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/attention" element={<Attention />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </StatsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

