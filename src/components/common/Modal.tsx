import React from "react";
import {AiOutlineClose} from "react-icons/ai";

type ModalProps = {
    setOpen: (open: boolean) => void
    children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({setOpen, children}) => {
    return (
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-md z-50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 rounded-xl bg-white p-10 shadow-2xl">
                <AiOutlineClose
                    size={22}
                    onClick={() => setOpen(false)}
                    className="text-blue-800 hover:opacity-75 absolute top-4 right-4 cursor-pointer"
                />
                {children}
            </div>
        </div>
    )
}