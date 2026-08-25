import React from "react"
import {useIntl} from "react-intl";

import logoPng from "../../assets/img/logo.png"

export const Logo: React.FC = () => {
    const intl = useIntl()
    return (
        <div className="w-[300px]">
            <img src={logoPng} alt={intl.formatMessage({id: "label.project.name"})}/>
        </div>
    )
}