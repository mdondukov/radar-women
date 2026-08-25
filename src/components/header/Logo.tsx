import React from "react"
import {useIntl} from "react-intl";

import logoSvg from "../../assets/img/logo_green.svg"

export const Logo: React.FC = () => {
    const intl = useIntl()
    return (
        <div className="w-[300px]">
            <img src={logoSvg} alt={intl.formatMessage({id: "label.project.name"})}/>
        </div>
    )
}