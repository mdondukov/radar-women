import React from "react";
import {Outlet} from "react-router-dom";

import {Header} from "../components";

const MainLayout: React.FC = () => {
    return (
        <div className="md:py-12 py-8">
            <div className="lg:w-4/5 md:w-10/12 w-11/12 mx-auto">
                <Header/>
                <Outlet/>
            </div>
        </div>
    )
}

export default MainLayout