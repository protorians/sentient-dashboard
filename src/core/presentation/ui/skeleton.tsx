import { cn } from "@/core/infrastructure/utilities/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted duration-1000", className)}
      {...props}
    />
  )
}

export { Skeleton }
