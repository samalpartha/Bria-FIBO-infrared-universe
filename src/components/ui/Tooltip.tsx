import { ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
    children: ReactNode;
    content: string;
    side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const getPosition = () => {
        switch (side) {
            case "top": return "-top-2 -translate-y-full left-1/2 -translate-x-1/2";
            case "bottom": return "-bottom-2 translate-y-full left-1/2 -translate-x-1/2";
            case "left": return "-left-2 -translate-x-full top-1/2 -translate-y-1/2";
            case "right": return "-right-2 translate-x-full top-1/2 -translate-y-1/2";
            default: return "-top-2 -translate-y-full left-1/2 -translate-x-1/2";
        }
    };

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${getPosition()} px-2 py-1 bg-black/90 border border-white/10 text-[10px] text-white rounded whitespace-nowrap z-50 shadow-lg pointer-events-none`}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
