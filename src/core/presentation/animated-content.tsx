"use client"

import { motion, AnimatePresence } from "framer-motion"
import { elasticContainer, elasticChild, elasticEnter, elasticScaleEnter } from "@/core/presentation/motion-utils"
import { cn } from "@/core/infrastructure/utilities/utils"
import { Children, isValidElement, cloneElement, ReactNode } from "react"

export interface AnimatedContentProps {
  children: ReactNode
  className?: string
  variant?: "enter" | "scale" | "container" | "none"
  stagger?: number
  delay?: number
  animateChildren?: boolean
}

export function AnimatedContent({
  children,
  className,
  variant = "enter",
  stagger = 0.08,
  delay = 0,
  animateChildren = false,
}: AnimatedContentProps) {
  if (variant === "none") {
    return <>{children}</>
  }

  if (animateChildren && variant === "container") {
    const childrenArray = Children.toArray(children)
    return (
      <motion.div
        className={cn('flex flex-col w-full', className, '')}
        variants={elasticContainer(delay, stagger)}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        {childrenArray.map((child, i) => {
          // if (!isValidElement(child))
            return child
          // return (
          //   <motion.div
          //       key={i}
          //       variants={elasticChild()}
          //   >
          //     {child}
          //   </motion.div>
          // )
        })}
      </motion.div>
    )
  }

  const variantMap = {
    enter: elasticEnter(delay),
    scale: elasticScaleEnter(),
    container: elasticContainer(delay, stagger),
  }

  return (
    <motion.div
      className={cn("w-full", className)}
      variants={variantMap[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

export function AnimatedPresenceWrapper({
  children,
  className,
  mode = "wait",
}: {
  children: ReactNode
  className?: string
  mode?: "wait" | "sync" | "popLayout"
}) {
  return (
    <AnimatePresence mode={mode}>
      <motion.div key={Date.now()} className={cn(className)}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
