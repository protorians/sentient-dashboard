import type {MediaSection, MediaUploadOptions} from "@/core/domain/entities/media";

type SectionSource = string | { mime?: string; extension?: string };

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "avi", "mkv", "m4v"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "flac", "aac", "m4a"];
const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "rtf", "odt"];

export class MediaLabelService {
    static sectionFor(source: SectionSource): MediaSection {
        const mime = typeof source === "string" ? source.toLowerCase() : source?.mime?.toLowerCase();
        const extension = typeof source === "string"
            ? ""
            : source?.extension?.toLowerCase().replace(/^\./, "") ?? "";

        if (mime) {
            if (mime.startsWith("image/")) return "image";
            if (mime.startsWith("video/")) return "video";
            if (mime.startsWith("audio/")) return "audio";
            if (mime === "application/pdf" || mime.startsWith("text/") || mime.includes("document")) return "document";
        }

        if (extension) {
            if (IMAGE_EXTENSIONS.includes(extension)) return "image";
            if (VIDEO_EXTENSIONS.includes(extension)) return "video";
            if (AUDIO_EXTENSIONS.includes(extension)) return "audio";
            if (DOCUMENT_EXTENSIONS.includes(extension)) return "document";
        }

        return "autre";
    }

    static build(module: string, section: MediaSection, type?: string): string {
        const label = `${module.toLowerCase()}:${section.toLowerCase()}`;
        return type ? `${label}.${type.toLowerCase()}` : label;
    }

    static resolve(module: string, options: MediaUploadOptions, type?: string): string {
        const section = options.section
            ? options.section.toLowerCase()
            : options.isDocument
                ? "document"
                : this.sectionFor(options.type ?? options.module ?? "");
        return this.build(module, section as MediaSection, type);
    }
}
