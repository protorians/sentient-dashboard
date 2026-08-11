import { motion } from "framer-motion"
import { elasticEnter } from "@/core/presentation/motion-utils"
import {CSSProperties} from "react";

export function WaitingBar() {
    return (
        <div className="w-full h-2 relative bg-background rounded-xl overflow-hidden">
            <motion.div
                className="absolute top-0 -left-[100%] w-full h-full bg-primary rounded-xl"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{
                    type: "spring",
                    stiffness: 170,
                    damping: 26,
                    repeat: Infinity,
                }}
                style={{ '--delay': 750 } as CSSProperties}
            ></motion.div>
            <motion.div
                className="absolute top-0 -left-[100%] w-full h-full bg-(--chart-2) rounded-xl"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{
                    type: "spring",
                    stiffness: 170,
                    damping: 26,
                    repeat: Infinity,
                }}
                style={{ '--delay': 0 } as CSSProperties}
            ></motion.div>
            <motion.div
                className="absolute top-0 -left-[100%] w-full h-full bg-(--chart-3) rounded-xl"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{
                    type: "spring",
                    stiffness: 170,
                    damping: 26,
                    repeat: Infinity,
                }}
                style={{ '--delay': 100 } as CSSProperties}
            ></motion.div>
            <motion.div
                className="absolute top-0 -left-[100%] w-full h-full bg-(--chart-4) rounded-xl"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{
                    type: "spring",
                    stiffness: 170,
                    damping: 26,
                    repeat: Infinity,
                }}
                style={{ '--delay': 300 } as CSSProperties}
            ></motion.div>
        </div>
    )
}