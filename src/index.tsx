import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import {LocaleProvider} from "./i18n/LocaleProvider";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <LocaleProvider>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </LocaleProvider>
    </React.StrictMode>
);
