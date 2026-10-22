import React from "react";
import {useIntl} from "react-intl";

export const OutdatedNotice: React.FC = () => {
    const intl = useIntl()
    return (
        <div className="bg-white rounded-xl p-10 mb-6 lg:mb-12">
            <p className="sm:text-xl text-red-600 font-medium mb-6">
                {intl.formatMessage({id: "label.error.poll.outdated"})}
            </p>
            <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center h-12 px-14 text-lg bg-lime-500 hover:bg-lime-400 text-white font-bold uppercase rounded-xl"
            >
                {intl.formatMessage({id: "label.reload"})}
            </button>
        </div>
    )
}
