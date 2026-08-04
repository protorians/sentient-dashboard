import {Fragment, ReactNode, createElement} from "react";
import {cn} from "@/core/infrastructure/utilities/utils";

export interface MarkdownParserProps {
    text: string;
    className?: string;
}

type MarkdownBlock =
    | { type: "paragraph"; lines: string[] }
    | { type: "heading"; level: number; text: string }
    | { type: "list"; items: string[] }
    | { type: "quote"; lines: string[] }
    | { type: "code"; content: string };

const INLINE_SOURCE = "(?<bold>\\*\\*[^*]+\\*\\*)|(?<italic>\\*[^*]+\\*)|(?<code>`[^`]+`)|(?<link>\\[(?<linkText>[^\\]]+)\\]\\((?<linkUrl>[^)]+)\\))|(?<strike>~~[^~]+~~)";

function parseBlocks(text: string): MarkdownBlock[] {
    const lines = text.split(/\r?\n/);
    const blocks: MarkdownBlock[] = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index];
        const trimmed = line.trim();

        if (!trimmed) {
            index++;
            continue;
        }

        if (/^```/.test(trimmed)) {
            const content: string[] = [];
            index++;
            while (index < lines.length && !/^```/.test(lines[index].trim())) {
                content.push(lines[index]);
                index++;
            }
            index++;
            blocks.push({type: "code", content: content.join("\n")});
            continue;
        }

        const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
            blocks.push({type: "heading", level: heading[1].length, text: heading[2]});
            index++;
            continue;
        }

        const list = trimmed.match(/^[-*]\s+(.*)$/);
        if (list) {
            const items = [list[1]];
            index++;
            while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
                items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
                index++;
            }
            blocks.push({type: "list", items});
            continue;
        }

        const quote = trimmed.match(/^>\s?(.*)$/);
        if (quote) {
            const quoteLines = [quote[1]];
            index++;
            while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
                quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
                index++;
            }
            blocks.push({type: "quote", lines: quoteLines});
            continue;
        }

        const paragraph: string[] = [line];
        index++;
        while (
            index < lines.length &&
            lines[index].trim() !== "" &&
            !/^#{1,6}\s/.test(lines[index].trim()) &&
            !/^[-*]\s/.test(lines[index].trim()) &&
            !/^>\s?/.test(lines[index].trim()) &&
            !/^```/.test(lines[index].trim())
        ) {
            paragraph.push(lines[index]);
            index++;
        }
        blocks.push({type: "paragraph", lines: paragraph});
    }

    return blocks;
}

function renderInline(text: string): ReactNode[] {
    const regex = new RegExp(INLINE_SOURCE, "g");
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(text.slice(lastIndex, match.index));
        }

        const groups = match.groups ?? {};

        if (groups.bold) {
            nodes.push(<strong key={key++}>{renderInline(groups.bold.slice(2, -2))}</strong>);
        } else if (groups.italic) {
            nodes.push(<em key={key++}>{renderInline(groups.italic.slice(1, -1))}</em>);
        } else if (groups.strike) {
            nodes.push(<del key={key++}>{renderInline(groups.strike.slice(2, -2))}</del>);
        } else if (groups.code) {
            nodes.push(
                <code key={key++} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
                    {groups.code.slice(1, -1)}
                </code>
            );
        } else if (groups.link) {
            nodes.push(
                <a
                    key={key++}
                    href={groups.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                    {renderInline(groups.linkText)}
                </a>
            );
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return nodes;
}

const HEADING_CLASS: Record<number, string> = {
    1: "text-2xl font-bold",
    2: "text-xl font-bold",
    3: "text-lg font-semibold",
    4: "text-base font-semibold",
    5: "text-sm font-medium",
    6: "text-sm font-medium text-muted-foreground",
};

function renderBlock(block: MarkdownBlock, index: number): ReactNode {
    switch (block.type) {
        case "paragraph":
            return <p key={index} className="m-0">{renderInline(block.lines.join(" "))}</p>;
        case "heading":
            return createElement(
                `h${block.level}`,
                {key: index, className: cn("mt-0 mb-2", HEADING_CLASS[block.level])},
                renderInline(block.text)
            );
        case "list":
            return (
                <ul key={index} className="m-0 list-disc space-y-1 pl-5">
                    {block.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{renderInline(item)}</li>
                    ))}
                </ul>
            );
        case "quote":
            return (
                <blockquote key={index} className="m-0 border-l-2 border-primary pl-3 italic">
                    {block.lines.map((line, lineIndex) => (
                        <Fragment key={lineIndex}>
                            {renderInline(line)}
                            {lineIndex < block.lines.length - 1 && <br/>}
                        </Fragment>
                    ))}
                </blockquote>
            );
        case "code":
            return (
                <pre key={index} className="m-0 overflow-x-auto rounded-md bg-muted p-3">
                    <code className="font-mono text-sm">{block.content}</code>
                </pre>
            );
        default:
            return null;
    }
}

export function MarkdownParser({text, className}: MarkdownParserProps) {
    const content = parseBlocks(text).map(renderBlock);

    if (className) {
        return <div className={cn("text-sm", className)}>{content}</div>;
    }

    return <Fragment>{content}</Fragment>;
}
