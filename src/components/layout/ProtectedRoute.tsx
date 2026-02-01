import { Navigate, Outlet } from "react-router-dom";
import { useStats } from "@/contexts/StatsContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    requiredRole?: 'user' | 'admin';
}

export const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useStats();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // If user is logged in but doesn't have the required role, redirect to home
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
