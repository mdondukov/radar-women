import React from "react";
import {flushSync} from "react-dom";
import {Modal} from "./Modal";
import {videoBase, VideoName} from "./VideoBlock";

// Durations of the files in /video/, per name and locale; update them when a
// file is re-encoded from a new source.
const DURATIONS: Record<VideoName, Record<string, string>> = {
    intro: {ru: "1:24", ky: "1:38"},
    tutorial: {ru: "5:47", ky: "6:16"},
}

interface VideoCardProps {
    name: VideoName
    locale: string
    title: string
    // "Видео", "Видео-инструкция": shown before the duration.
    kind: string
    closeLabel: string
}

// A compact card (poster, play icon, title, duration); a tap opens the video
// in a dialog and starts it. Closing the dialog unmounts the video, which
// stops the sound.
export const VideoCard: React.FC<VideoCardProps> = ({name, locale, title, kind, closeLabel}) => {
    const [open, setOpen] = React.useState(false)
    const cardRef = React.useRef<HTMLButtonElement>(null)
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const base = videoBase(name, locale)
    const duration = DURATIONS[name][locale]

    // iOS Safari plays a video with sound only when play() is called inside
    // the tap itself; the autoPlay attribute alone is ignored there. So the
    // dialog is rendered synchronously and play() is called in the handler;
    // autoPlay stays as a fallback.
    const openVideo = () => {
        flushSync(() => setOpen(true))
        videoRef.current?.play().catch(() => undefined)
    }

    const closeVideo = React.useCallback((value: boolean) => {
        setOpen(value)
        if (!value) cardRef.current?.focus()
    }, [])

    return (
        <>
            <button
                ref={cardRef}
                type="button"
                onClick={openVideo}
                className="flex sm:flex-col items-center sm:items-stretch gap-3 w-full p-2 sm:p-2.5 bg-white rounded-xl text-left shadow-sm hover:shadow-md transition-shadow"
            >
                <span className="relative flex-none w-32 sm:w-full aspect-video rounded-lg overflow-hidden bg-black">
                    <img src={`${base}.jpg`} alt="" className="w-full h-full object-cover"/>
                    <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/90">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]">
                                <path d="M8 5v14l11-7z" fill="#111827"/>
                            </svg>
                        </span>
                    </span>
                </span>
                <span className="flex flex-col gap-1 sm:gap-0.5 sm:px-1 sm:pb-1">
                    <span className="text-base sm:text-lg font-bold leading-tight text-gray-900">{title}</span>
                    <span className="text-sm text-gray-600">{duration ? `${kind} · ${duration}` : kind}</span>
                </span>
            </button>
            {open && (
                <Modal setOpen={closeVideo} label={title} closeLabel={closeLabel} className="max-w-5xl">
                    <video
                        ref={videoRef}
                        src={`${base}.mp4`}
                        poster={`${base}.jpg`}
                        controls
                        autoPlay
                        playsInline
                        aria-label={title}
                        className="w-full aspect-video max-h-[calc(100dvh-8rem)] object-contain rounded-xl bg-black shadow-2xl"
                    />
                </Modal>
            )}
        </>
    )
}
