import React from "react";

const URL_PATTERN = /(https?:\/\/[^\s]+)/g
const IS_URL = /^https?:\/\//

interface LinkifyProps {
    text: string
}

// Plain-text content (e.g. answer.recommendation) sometimes embeds a bare URL —
// unlike ReactMarkdown output, it never gets auto-linked, so it renders as
// inert text. This turns any http(s) URL found in the string into a real link.
export const Linkify: React.FC<LinkifyProps> = ({text}) => {
    const parts = text.split(URL_PATTERN)
    return (
        <>
            {
                parts.map((part, index) =>
                    IS_URL.test(part)
                        ? <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
                        : <React.Fragment key={index}>{part}</React.Fragment>
                )
            }
        </>
    )
}
