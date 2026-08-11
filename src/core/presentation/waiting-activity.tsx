import { motion } from "framer-motion"
import { elasticPulse } from "@/core/presentation/motion-utils"
import {LoaderIcon} from "lucide-react"

export interface WaitingActivityProps {
    size?: number
}

export function WaitingActivity({size = 24}: WaitingActivityProps){
    return (
        <div className="flex-auto flex flex-col items-center justify-center">
            <motion.div
                variants={elasticPulse()}
                initial="initial"
                animate="animate"
            >
                <LoaderIcon size={size} />
            </motion.div>
        </div>
    )
}