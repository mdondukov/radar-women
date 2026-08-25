import React from "react";

import {MdOutlineLanguage} from "react-icons/md";
import {useStores} from "../../hooks/use-stores";

export const LangButton: React.FC = () => {
    const {uiStore} = useStores()

    return (
        <div className="text-blue-800 text-sm font-medium flex items-center">
            <div className="flex-none mr-2">
                <MdOutlineLanguage size={18} className="text-blue-800"/>
            </div>
            <div className="flex-auto align-middle">
                <span
                    onClick={() => uiStore.setLocale("ky")}
                    className={
                        `cursor-pointer hover:opacity-75 ` +
                        `${uiStore.locale === `ky` ? `font-bold` : ``}`
                    }>
                    Кыргызча</span>
                <span className="ml-2 mr-2">|</span>
                <span
                    onClick={() => uiStore.setLocale("ru")}
                    className={
                        `cursor-pointer hover:opacity-75 ` +
                        `${uiStore.locale === `ru` ? `font-bold` : ``}`
                    }>
                    Русский</span>
            </div>
        </div>
    )
}