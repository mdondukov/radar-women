import React from "react";
import {Route, Routes} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Poll from "./pages/Poll";
import Instruction from "./pages/Instruction";

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout/>}>
                <Route index element={<Home/>}/>
                <Route path="instruction" element={<Instruction/>}/>
                <Route path="poll" element={<Poll/>}/>
            </Route>
        </Routes>
    );
}

export default App;
