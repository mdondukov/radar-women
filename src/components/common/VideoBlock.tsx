import React from "react";

// Videos are not in the repository or the image: production serves them from
// a directory on the host (host nginx, location /video/); locally, put the
// files in public/video/ (ignored by git and docker). See README.
const VIDEO_BASE = "/video"

export type VideoName = "intro" | "tutorial"

interface VideoBlockProps {
    name: VideoName
    locale: string
    title: string
    className?: string
}

export const VideoBlock: React.FC<VideoBlockProps> = ({name, locale, title, className}: VideoBlockProps) => {
    const base = `${VIDEO_BASE}/${name}-${locale}`

    return (
        <div className={className}>
            {/* key: a new source for a new locale; React does not reload a
                <video> when only its src changes. */}
            <video
                key={base}
                src={`${base}.mp4`}
                poster={`${base}.jpg`}
                controls
                playsInline
                preload="none"
                aria-label={title}
                className="w-full aspect-video rounded-xl bg-black shadow"
            />
        </div>
    )
}
