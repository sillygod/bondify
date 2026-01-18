import { useState, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "default";
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog = ({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: "bg-red-500/20 text-red-400",
            button: "bg-red-500 hover:bg-red-600 text-white",
        },
        warning: {
            icon: "bg-amber-500/20 text-amber-400",
            button: "bg-amber-500 hover:bg-amber-600 text-white",
        },
        default: {
            icon: "bg-cyan-500/20 text-cyan-400",
            button: "bg-cyan-500 hover:bg-cyan-600 text-white",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-[#0d1321] border border-[#1a2744] rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start gap-4 p-6">
                    <div className={cn("p-3 rounded-xl", styles.icon)}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a3a5a] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1a2744] bg-[#1a2744]/30">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#2a3a5a] transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            "px-4 py-2 rounded-lg font-medium transition-colors",
                            styles.button
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Custom hook for easier usage
export function useConfirmDialog() {
    const [state, setState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: "danger" | "warning" | "default";
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        variant: "danger",
        onConfirm: () => { },
    });

    const confirm = useCallback(
        (options: { title: string; message: string; variant?: "danger" | "warning" | "default" }) =>
            new Promise<boolean>((resolve) => {
                setState({
                    isOpen: true,
                    title: options.title,
                    message: options.message,
                    variant: options.variant || "danger",
                    onConfirm: () => {
                        setState((prev) => ({ ...prev, isOpen: false }));
                        resolve(true);
                    },
                });
            }),
        []
    );

    const handleCancel = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const dialogProps = {
        isOpen: state.isOpen,
        title: state.title,
        message: state.message,
        variant: state.variant,
        onConfirm: state.onConfirm,
        onCancel: handleCancel,
    };

    return { confirm, dialogProps };
}
