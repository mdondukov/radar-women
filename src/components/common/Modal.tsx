import React from "react";
import {AiOutlineClose} from "react-icons/ai";

type ModalProps = {
    setOpen: (open: boolean) => void
    children: React.ReactNode
    // Accessible name of the dialog.
    label?: string
    // Accessible name of the close button.
    closeLabel?: string
    // Classes of the panel; the default is a white card.
    className?: string
}

// A dialog over the page: closes by the close button, Escape or a click
// outside the panel; the page under it does not scroll while it is open.
export const Modal: React.FC<ModalProps> = ({setOpen, children, label, closeLabel = "Close", className}) => {
    const close = React.useCallback(() => setOpen(false), [setOpen])
    // Close on a click outside only when the press also started outside: a
    // drag from the video that ends on the backdrop is not a click outside.
    const pressedOutside = React.useRef(false)

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Escape in native fullscreen leaves fullscreen, not the dialog.
            if (e.key === "Escape" && !document.fullscreenElement) close()
        }
        document.addEventListener("keydown", onKey)
        const overflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.removeEventListener("keydown", onKey)
            document.body.style.overflow = overflow
        }
    }, [close])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onMouseDown={(e) => {
                pressedOutside.current = e.target === e.currentTarget
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && pressedOutside.current) close()
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={label}
                className={`relative w-full ${className ?? "max-w-3xl rounded-xl bg-white p-10 shadow-2xl"}`}
            >
                <button
                    type="button"
                    autoFocus
                    aria-label={closeLabel}
                    onClick={close}
                    className="absolute -top-12 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-800 shadow hover:opacity-75"
                >
                    <AiOutlineClose size={22}/>
                </button>
                {children}
            </div>
        </div>
    )
}
