import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { StreakModal } from "@/components/dashboard/StreakModal";
import { LayoutControlProvider, useLayoutControl } from "@/hooks/useLayoutControl";

const MainLayoutContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const { hideHeader } = useLayoutControl();

  return (
    <div className="min-h-screen flex w-full">
      {/* Desktop sidebar - collapsible */}
      {!hideHeader && (
        <div className="hidden lg:block">
          <Sidebar 
            isOpen={true} 
            onClose={() => {}} 
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      )}
      
      {/* Mobile sidebar */}
      {!hideHeader && (
        <div className="lg:hidden">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            collapsed={false}
            onToggleCollapse={() => {}}
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col min-h-screen">
        {!hideHeader && (
          <Header 
            onMenuClick={() => setSidebarOpen(true)} 
            onStreakClick={() => setStreakModalOpen(true)}
          />
        )}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <StreakModal isOpen={streakModalOpen} onClose={() => setStreakModalOpen(false)} />
    </div>
  );
};

export const MainLayout = () => {
  return (
    <LayoutControlProvider>
      <MainLayoutContent />
    </LayoutControlProvider>
  );
};
