import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";
import { useEffect } from "react";

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onDismiss: (id: string) => void;
}

export function Toast({ id, message, type, onDismiss }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(id), 5000);
        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    const icons = {
        success: <CheckCircle className="w-4 h-4 text-green-400" />,
        error: <AlertCircle className="w-4 h-4 text-red-400" />,
        info: <Info className="w-4 h-4 text-blue-400" />
    };

    const bgColors = {
        success: "bg-green-500/10 border-green-500/20",
        error: "bg-red-500/10 border-red-500/20",
        info: "bg-blue-500/10 border-blue-500/20"
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-2xl mb-2 min-w-[300px] ${bgColors[type]} text-white`}
        >
            {icons[type]}
            <span className="text-sm font-medium flex-1">{message}</span>
            <button onClick={() => onDismiss(id)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-3 h-3" />
            </button>
        </motion.div>
    );
}
