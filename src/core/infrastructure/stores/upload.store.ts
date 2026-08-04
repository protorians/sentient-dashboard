"use client"

import { create } from "zustand"
import { StorageApiService } from "@/modules/storage/application/service/storage-api-service"
import type { MediaUploadOptions } from "@/core/domain/entities/media"
import type { AxiosProgressEvent } from "axios"

export type UploadStatus = "idle" | "uploading" | "done" | "error" | "cancelled"

export interface UploadItem {
    id: string
    name: string
    size: number
    progress: number
    speed: number
    eta: number | null
    status: UploadStatus
    error?: string
    result?: any
}

interface UploadStoreState {
    uploads: UploadItem[]
    isExpanded: boolean
    hasActiveUploads: boolean
    expand: () => void
    collapse: () => void
    toggle: () => void
    addFiles: (files: File[], options?: MediaUploadOptions) => void
    uploadFile: (file: File, options?: MediaUploadOptions, onProgress?: (event: AxiosProgressEvent) => void) => Promise<any>
    removeFile: (id: string) => void
    retryFile: (id: string) => void
    cancelAll: () => void
    clearCompleted: () => void
}

const filesById = new Map<string, File>()
const optionsById = new Map<string, MediaUploadOptions>()
const speedTrackers = new Map<string, { loaded: number; timestamp: number }>()
const controllers = new Map<string, AbortController>()

export const useUploadStore = create<UploadStoreState>((set, get) => {
    const recomputeActive = (uploads: UploadItem[]) =>
        uploads.some((u) => u.status === "uploading")

    const updateUpload = (id: string, patch: Partial<UploadItem>) => {
        const uploads = get().uploads.map((u) => (u.id === id ? { ...u, ...patch } : u))
        set({ uploads, hasActiveUploads: recomputeActive(uploads) })
    }

    const trackProgress = (id: string, loaded: number) => {
        const now = Date.now()
        const prev = speedTrackers.get(id)
        const speed = prev
            ? (loaded - prev.loaded) / Math.max((now - prev.timestamp) / 1000, 0.001)
            : 0
        speedTrackers.set(id, { loaded, timestamp: now })
        const item = get().uploads.find((u) => u.id === id)
        if (!item) return
        const remaining = item.size - loaded
        const eta = speed > 0 ? remaining / speed : null
        updateUpload(id, { speed, eta, progress: item.size ? (loaded / item.size) * 100 : 0 })
    }

    const startUpload = async (id: string, onProgress?: (event: AxiosProgressEvent) => void) => {
        const file = filesById.get(id)
        const item = get().uploads.find((u) => u.id === id)
        const options = optionsById.get(id)
        if (!file || !item) return

        const controller = new AbortController()
        controllers.set(id, controller)
        updateUpload(id, { status: "uploading", progress: 0, speed: 0, eta: null, error: undefined })

        try {
            const response = await StorageApiService.uploadFile(file, options, (event) => {
                trackProgress(id, event.loaded)
                onProgress?.(event)
            }, { signal: controller.signal })
            const result = response.data?.data
            updateUpload(id, { status: "done", progress: 100, eta: null, result })
            return result
        } catch (error: any) {
            const cancelled = controller.signal.aborted
            updateUpload(id, {
                status: cancelled ? "cancelled" : "error",
                eta: null,
                error: cancelled
                    ? undefined
                    : error?.response?.data?.message || error?.message || "Une erreur est survenue",
            })
            throw error
        } finally {
            speedTrackers.delete(id)
            controllers.delete(id)
        }
    }

    const abortUpload = (id: string) => {
        controllers.get(id)?.abort()
    }

    return {
        uploads: [],
        isExpanded: false,
        hasActiveUploads: false,

        expand: () => set({ isExpanded: true }),
        collapse: () => set({ isExpanded: false }),
        toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),

        addFiles: (files, options) => {
            if (!files.length) return
            const newUploads: UploadItem[] = files.map((file) => {
                const id = crypto.randomUUID()
                filesById.set(id, file)
                if (options) optionsById.set(id, options)
                return {
                    id,
                    name: file.name,
                    size: file.size,
                    progress: 0,
                    speed: 0,
                    eta: null,
                    status: "idle",
                }
            })
            set((state) => ({
                uploads: [...state.uploads, ...newUploads],
                isExpanded: true,
                hasActiveUploads: true,
            }))
            newUploads.forEach((upload) => {
                startUpload(upload.id).catch(() => {})
            })
        },

        uploadFile: (file, options, onProgress) => {
            const id = crypto.randomUUID()
            filesById.set(id, file)
            if (options) optionsById.set(id, options)
            const newUpload: UploadItem = {
                id,
                name: file.name,
                size: file.size,
                progress: 0,
                speed: 0,
                eta: null,
                status: "idle",
            }
            set((state) => ({
                uploads: [...state.uploads, newUpload],
                isExpanded: true,
                hasActiveUploads: true,
            }))
            return startUpload(id, onProgress)
        },

        removeFile: (id) => {
            abortUpload(id)
            filesById.delete(id)
            optionsById.delete(id)
            speedTrackers.delete(id)
            const uploads = get().uploads.filter((u) => u.id !== id)
            set({ uploads, hasActiveUploads: recomputeActive(uploads) })
        },

        retryFile: (id) => {
            if (!filesById.has(id)) return
            updateUpload(id, { status: "idle", progress: 0, speed: 0, eta: null, error: undefined })
            set({ hasActiveUploads: true })
            startUpload(id).catch(() => {})
        },

        cancelAll: () => {
            get().uploads.forEach((u) => abortUpload(u.id))
            const uploads = get().uploads.map((u) =>
                u.status === "uploading" || u.status === "idle"
                    ? { ...u, status: "cancelled" as const, eta: null }
                    : u
            )
            set({ uploads, hasActiveUploads: recomputeActive(uploads) })
        },

        clearCompleted: () => {
            const uploads = get().uploads.filter(
                (u) => u.status === "uploading" || u.status === "idle"
            )
            get().uploads.forEach((u) => {
                if (u.status === "done" || u.status === "cancelled" || u.status === "error") {
                    filesById.delete(u.id)
                    optionsById.delete(u.id)
                }
            })
            set({ uploads, hasActiveUploads: recomputeActive(uploads) })
        },
    }
})
