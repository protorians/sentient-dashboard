"use client"

import { cn } from "@/core/infrastructure/utilities/utils"
import { motion } from "framer-motion"
import { elasticEnter } from "@/core/presentation/motion-utils"

export interface MainProps {
  className?: string
  children?: React.ReactNode
}

export function Main({ className, children }: MainProps) {
  return (
    <motion.main
      variants={elasticEnter()}
      initial="initial"
      animate="animate"
      className={cn(
        "flex-auto min-h-[100dvh-64px] w-full",
        className
      )}
    >
      {children}
    </motion.main>
  )
}
