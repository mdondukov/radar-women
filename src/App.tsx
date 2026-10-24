import React, {Suspense} from "react";
import {Route, Routes} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Poll from "./pages/Poll";
import Instruction from "./pages/Instruction";

// Loaded only on /admin, so the dashboard and its chart library stay out of
// the questionnaire's bundle.
const AdminApp = React.lazy(() => import("./admin/AdminApp"))

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout/>}>
                <Route index element={<Home/>}/>
                <Route path="instruction" element={<Instruction/>}/>
                <Route path="poll" element={<Poll/>}/>
            </Route>
            <Route path="admin" element={
                <Suspense fallback={null}><AdminApp/></Suspense>
            }/>
        </Routes>
    );
}

export default App;
