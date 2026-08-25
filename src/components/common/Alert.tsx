import React from "react";
import {AiOutlineClose} from "react-icons/ai";
import {AlertType, IAlert} from "../../types/alert";

interface AlertProps {
    alert: IAlert
    setOpen: (open: boolean) => void
}

export const Alert: React.FC<AlertProps> = ({alert, setOpen}) => {
    return (
        <div className="absolute top-0 left-0 w-full h-full z-50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 xl:w-2/5 lg:w-3/5 rounded-xl bg-white p-10 shadow-2xl">
                <AiOutlineClose
                    size={22}
                    onClick={() => setOpen(false)}
                    className="text-blue-800 hover:opacity-75 absolute top-4 right-4 cursor-pointer"
                />
                <h1
                    className={
                        `text-lg font-bold uppercase mb-4 ` +
                        getNameColor(alert.type)
                    }
                >
                    {alert.name}
                </h1>
                <p>
                    {alert.desc}
                </p>
            </div>
        </div>
    )
}

const getNameColor = (type: AlertType): string => {
    switch (type) {
        case AlertType.ERROR:
            return "text-red-600"
        case AlertType.WARN:
            return "text-blue-800"
    }
}