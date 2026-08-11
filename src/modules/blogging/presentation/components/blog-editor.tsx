"use client"

import React, {useCallback, useEffect, useRef, useState} from "react"
import {cn} from "@/core/infrastructure/utilities/utils"
import {Button} from "@/core/presentation/ui/button"
import {Separator} from "@/core/presentation/ui/separator"
import {Input} from "@/core/presentation/ui/input"
import {Progress} from "@/core/presentation/ui/progress"
import {useUploadStore} from "@/core/infrastructure/stores/upload.store"
import {MediaStorageInterface, MediaUploadOptions} from "@/core/domain/entities/media"
import {
    BoldIcon,
    ItalicIcon,
    UnderlineIcon,
    StrikethroughIcon,
    Heading2Icon,
    Heading3Icon,
    ListIcon,
    ListOrderedIcon,
    QuoteIcon,
    Code2Icon,
    LinkIcon,
    ImageIcon,
    EraserIcon,
    UploadIcon,
    Loader2Icon,
    XIcon,
} from "lucide-react"

interface ToolbarAction {
    id: string
    label: string
    icon: React.ReactNode
    command: string
    value?: string
}

const inlineActions: ToolbarAction[] = [
    {id: "bold", label: "Gras", icon: <BoldIcon className="size-4"/>, command: "bold"},
    {id: "italic", label: "Italique", icon: <ItalicIcon className="size-4"/>, command: "italic"},
    {id: "underline", label: "Souligné", icon: <UnderlineIcon className="size-4"/>, command: "underline"},
    {id: "strikethrough", label: "Barré", icon: <StrikethroughIcon className="size-4"/>, command: "strikeThrough"},
]

const blockActions: ToolbarAction[] = [
    {id: "h2", label: "Titre 2", icon: <Heading2Icon className="size-4"/>, command: "formatBlock", value: "H2"},
    {id: "h3", label: "Titre 3", icon: <Heading3Icon className="size-4"/>, command: "formatBlock", value: "H3"},
    {id: "ul", label: "Liste", icon: <ListIcon className="size-4"/>, command: "insertUnorderedList"},
    {id: "ol", label: "Ordonnée", icon: <ListOrderedIcon className="size-4"/>, command: "insertOrderedList"},
    {id: "quote", label: "Citation", icon: <QuoteIcon className="size-4"/>, command: "formatBlock", value: "BLOCKQUOTE"},
    {id: "code", label: "Code", icon: <Code2Icon className="size-4"/>, command: "formatBlock", value: "PRE"},
]

export interface BlogEditorProps {
    value?: string
    onChange?: (html: string) => void
    placeholder?: string
    className?: string
    minHeight?: string
}

export function BlogEditor({value = "", onChange, placeholder = "Commencez à rédiger...", className, minHeight = "400px"}: BlogEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkUrl, setLinkUrl] = useState("")
    const [showImageUpload, setShowImageUpload] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const uploadFile = useUploadStore((state) => state.uploadFile)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (editorRef.current && !isInitialized) {
            editorRef.current.innerHTML = value
            setIsInitialized(true)
        }
    }, [value, isInitialized])

    const saveSelection = useCallback((): Range | null => {
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return null
        return sel.getRangeAt(0).cloneRange()
    }, [])

    const restoreSelection = useCallback((range: Range | null) => {
        if (!range) return
        const sel = window.getSelection()
        if (sel) {
            sel.removeAllRanges()
            sel.addRange(range)
        }
    }, [])

    const focusEditor = useCallback(() => {
        if (editorRef.current && document.activeElement !== editorRef.current) {
            editorRef.current.focus()
        }
    }, [])

    const exec = useCallback((command: string, value?: string) => {
        focusEditor()
        document.execCommand(command, false, value)
    }, [focusEditor])

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange?.(editorRef.current.innerHTML)
        }
    }, [onChange])

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault()
        const text = e.clipboardData.getData("text/plain")
        const html = e.clipboardData.getData("text/html")
        if (html) {
            const sanitized = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            document.execCommand("insertHTML", false, sanitized)
        } else {
            document.execCommand("insertText", false, text)
        }
    }, [])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Tab") {
            e.preventDefault()
            document.execCommand("insertHTML", false, "&emsp;")
        }
    }, [])

    const handleInsertLink = useCallback(() => {
        if (!linkUrl.trim()) return
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return
        const selectedText = sel.toString() || linkUrl
        focusEditor()
        restoreSelection(saveSelection())
        document.execCommand("createLink", false, linkUrl)
        setLinkUrl("")
        setShowLinkInput(false)
    }, [linkUrl, focusEditor, restoreSelection, saveSelection])

    const handleImageUpload = useCallback(async (file: File) => {
        setIsUploading(true)
        setUploadProgress(0)
        try {
            const options: MediaUploadOptions = {module: "blogging", type: "image"}
            const media = await uploadFile(file, options, (event) => {
                setUploadProgress(event.total ? (event.loaded / event.total) * 100 : 0)
            }) as MediaStorageInterface | undefined
            if (!media) throw new Error("Échec du téléversement")

            const imgSrc = `${process.env.NEXT_PUBLIC_API_HOST}/storage/${media.id}`
            focusEditor()
            restoreSelection(saveSelection())
            const imgHtml = `<img src="${imgSrc}" alt="${media.label || media.filename || ''}" style="max-width:100%;height:auto;border-radius:8px;" />`
            document.execCommand("insertHTML", false, imgHtml)
            handleInput()
        } catch {
            // handled silently
        } finally {
            setIsUploading(false)
            setShowImageUpload(false)
        }
    }, [uploadFile, focusEditor, restoreSelection, saveSelection, handleInput])

    const handleClearFormat = useCallback(() => {
        focusEditor()
        document.execCommand("removeFormat")
    }, [focusEditor])

    return (
        <div className={cn("flex flex-col border rounded-lg bg-background overflow-hidden", className)}>
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30 overflow-x-auto shrink-0">
                {inlineActions.map((action) => (
                    <Button
                        key={action.id}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => exec(action.command, action.value)}
                        title={action.label}
                        className="h-8 w-8"
                    >
                        {action.icon}
                    </Button>
                ))}

                <Separator orientation="vertical" className="mx-1 h-6"/>

                {blockActions.map((action) => (
                    <Button
                        key={action.id}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => exec(action.command, action.value)}
                        title={action.label}
                        className="h-8 w-8"
                    >
                        {action.icon}
                    </Button>
                ))}

                <Separator orientation="vertical" className="mx-1 h-6"/>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowLinkInput(true)}
                    title="Insérer un lien"
                    className="h-8 w-8"
                >
                    <LinkIcon className="size-4"/>
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowImageUpload(true)}
                    title="Insérer une image"
                    className="h-8 w-8"
                >
                    <ImageIcon className="size-4"/>
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6"/>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleClearFormat}
                    title="Effacer le formatage"
                    className="h-8 w-8"
                >
                    <EraserIcon className="size-4"/>
                </Button>

                <div className="flex-1"/>
            </div>

            {showLinkInput && (
                <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/20 shrink-0">
                    <LinkIcon className="size-4 text-muted-foreground shrink-0"/>
                    <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="h-8 text-sm flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleInsertLink()
                            if (e.key === "Escape") setShowLinkInput(false)
                        }}
                    />
                    <Button size="sm" onClick={handleInsertLink} disabled={!linkUrl.trim()}>
                        Insérer
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setShowLinkInput(false)}>
                        <XIcon className="size-4"/>
                    </Button>
                </div>
            )}

            {showImageUpload && (
                <div className="flex flex-col gap-2 px-3 py-3 border-b bg-muted/20 shrink-0">
                    {isUploading ? (
                        <div className="flex items-center gap-3">
                            <Loader2Icon className="size-4 animate-spin text-muted-foreground"/>
                            <Progress value={uploadProgress} className="h-1.5 flex-1"/>
                            <span className="text-xs text-muted-foreground w-11 text-right">
                                {Math.round(uploadProgress)}%
                            </span>
                            <Button variant="ghost" size="icon-sm" onClick={() => setShowImageUpload(false)}>
                                <XIcon className="size-4"/>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(file)
                                    e.target.value = ""
                                }}
                            />
                            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <UploadIcon className="size-3.5 mr-1.5"/>
                                Choisir un fichier
                            </Button>
                            <span className="text-xs text-muted-foreground">ou coller une URL</span>
                            <Input
                                placeholder="https://...image.jpg"
                                className="h-8 text-sm flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        const url = (e.target as HTMLInputElement).value.trim()
                                        if (url) {
                                            focusEditor()
                                            restoreSelection(saveSelection())
                                            document.execCommand("insertHTML", false, `<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;" />`)
                                            handleInput()
                                            setShowImageUpload(false)
                                        }
                                    }
                                    if (e.key === "Escape") setShowImageUpload(false)
                                }}
                            />
                            <Button variant="ghost" size="icon-sm" onClick={() => setShowImageUpload(false)}>
                                <XIcon className="size-4"/>
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                data-placeholder={placeholder}
                style={{minHeight}}
                className={cn(
                    "flex-1 p-4 outline-none text-sm leading-relaxed",
                    "prose prose-sm dark:prose-invert max-w-none",
                    "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3",
                    "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2",
                    "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4",
                    "[&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:overflow-x-auto [&_pre]:my-4",
                    "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2",
                    "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2",
                    "[&_li]:my-1",
                    "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
                    "[&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full",
                    "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:pointer-events-none",
                )}
            />
        </div>
    )
}
