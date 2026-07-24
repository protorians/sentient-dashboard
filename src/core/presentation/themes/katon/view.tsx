"use client"

import { motion } from "motion/react"

export interface ScreenViewProps {
    children: React.ReactNode
}

export function View({children}: ScreenViewProps) {
    return (
        <div className="relative max-w-screen w-full min-h-screen h-full">
            {/* back */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 80, -40, 0],
                        y: [0, -60, 40, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute aspect-square -top-[5%] -left-[5%] w-[30%] rounded-full bg-primary-500/10 blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 50, 0],
                        y: [0, 80, -50, 0],
                        scale: [1, 0.9, 1.1, 1],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute aspect-square top-[20%] -right-[10%] w-[25%] rounded-full bg-secondary/15 blur-[150px]"
                />
                <motion.div
                    animate={{
                        x: [0, 60, -80, 0],
                        y: [0, 120, -60, 0],
                        scale: [1, 1.05, 0.95, 1],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute aspect-square -bottom-[25%] left-[10%] w-[25%] rounded-full bg-primary-500/15 blur-[180px]"
                />
            </div>

            {/* fore */}
            <div className="static max-w-screen w-full min-h-screen h-full flex flex-col gap-0 z-1">
                {children}
            </div>
        </div>
    )
}