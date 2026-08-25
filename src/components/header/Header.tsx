import React from "react";
import {Link} from "react-router-dom";
import {useIntl} from "react-intl";

import logoPng from "../../assets/img/logo.png";
import partnersPng from "../../assets/img/partners.png";

export const Header: React.FC = () => {
    const intl = useIntl()
    return (
        <div className="md:flex print:flex md:gap-20 print:gap-20 md:justify-between print:justify-between md:items-center print:items-center mb-6 lg:mb-12">
            <div className="lg:mb-0 print:mb-0 mb-6 mx-auto md:mx-0 print:mx-0">
                <Link to="/">
                    <img
                        src={logoPng}
                        alt={intl.formatMessage({id: "label.project.name"})}
                        className="h-[72px] w-auto"
                    />
                </Link>
            </div>
            <div>
                <img
                    src={partnersPng}
                    alt={intl.formatMessage({id: "label.project.partners"})}
                    className="h-[86px] w-auto"
                />
            </div>
        </div>
    )
}