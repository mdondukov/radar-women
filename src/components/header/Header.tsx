import React from "react";
import {Link} from "react-router-dom";
import {useIntl} from "react-intl";

import logoSvg from "../../assets/img/logo_green.svg";
import partnersPng from "../../assets/img/partners.png";

export const Header: React.FC = () => {
    const intl = useIntl()
    return (
        <div className="md:flex md:gap-20 md:justify-between md:items-center mb-6 lg:mb-12">
            <div className="lg:mb-0 mb-6 w-[240px] mx-auto md:mx-0">
                <Link to="/">
                    <img
                        src={logoSvg}
                        alt={intl.formatMessage({id: "label.project.name"})}
                        className="w-[240px]"
                    />
                </Link>
            </div>
            <div>
                <img
                    src={partnersPng}
                    alt={intl.formatMessage({id: "label.project.partners"})}
                    className="w-[420px]"
                />
            </div>
        </div>
    )
}