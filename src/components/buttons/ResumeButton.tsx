import React from "react";
import {useIntl} from "react-intl";

import {useStores} from "../../hooks/use-stores";

interface ResumeButtonProps {
    enable: boolean
}

export const ResumeButton: React.FC<ResumeButtonProps> = ({enable}) => {
    const intl = useIntl()
    const {stepStore} = useStores()

    return <button
        type="button"
        onClick={() => stepStore.setResume(true)}
        className={
            `inline-flex items-center text-lg text-white font-bold uppercase` +
            ` h-12 px-14 rounded-xl hover:bg-lime-400` +
            `${enable ? ` bg-lime-500` : ` bg-lime-400 cursor-not-allowed`}`
        }
        disabled={!enable}
    >
        {intl.formatMessage({id: "label.resume"})}
    </button>
}