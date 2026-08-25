import React from "react";
import {Link} from "react-router-dom";

interface MainButtonProps {
    path: string
    name: string
}

export const MainButton: React.FC<MainButtonProps> = ({path, name}: MainButtonProps) => {
    return (
        <Link
            to={path}
            className="inline-flex items-center h-12 px-14 text-lg bg-lime-500 hover:bg-lime-400 text-white font-bold uppercase rounded-xl"
        >
            {name}
        </Link>
    )
}