"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import {useThemePreferColorSchemeStore} from "@/core/infrastructure/stores/theme.store"
import {PreferColorSchemeEnum} from "@/core/domain/enums/theme.enum"

const Toaster = ({ position = "top-center", ...props }: ToasterProps) => {
  const { colorScheme } = useThemePreferColorSchemeStore()
  const theme = colorScheme ?? PreferColorSchemeEnum.Light

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={position}
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          error: "!bg-destructive !text-destructive-foreground !border-destructive",
          success: "!bg-emerald-500 !text-white",
          warning: "!bg-amber-500 !text-white",
          info: "!bg-sky-500 !text-white",
          loading: "!bg-muted !text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
