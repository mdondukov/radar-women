import React from "react";
import {useIntl} from "react-intl";

import {useStores} from "../../hooks/use-stores";

interface NextButtonProps {
    nextStepId: number
    enable: boolean
}

export const NextButton: React.FC<NextButtonProps> = ({nextStepId, enable}) => {
    const intl = useIntl()
    const {stepStore} = useStores()

    return <button
        type="button"
        onClick={() => stepStore.setActive(nextStepId)}
        className={
            `inline-flex items-center text-lg text-white font-bold uppercase` +
            ` h-12 px-14 rounded-xl hover:bg-lime-400` +
            `${enable ? ` bg-lime-500` : ` bg-lime-400 cursor-not-allowed`}`
        }
        disabled={!enable}
    >
        {intl.formatMessage({id: "label.next"})}
    </button>
}