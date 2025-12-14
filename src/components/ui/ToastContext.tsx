"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Toast, ToastType } from "./Toast";
import { AnimatePresence } from "framer-motion";

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end pointer-events-none">
                <div className="pointer-events-auto">
                    <AnimatePresence>
                        {toasts.map((toast) => (
                            <Toast key={toast.id} {...toast} onDismiss={removeToast} />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}
