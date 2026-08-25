import React from "react";
import {IntlProvider} from "react-intl";

import {useStores} from "../hooks/use-stores";
import {getDefaultUserLocale} from "../utils";
import {observer} from "mobx-react-lite";

interface LocaleProviderProps {
    children: React.ReactNode
}

export const LocaleProvider: React.FC<LocaleProviderProps> = observer(({children}) => {
    const {locale} = useStores().uiStore
    const {messages} = useStores().messageStore

    return (
        <IntlProvider
            key={locale}
            locale={locale}
            defaultLocale={getDefaultUserLocale()}
            messages={messages[locale]}
        >
            {children}
        </IntlProvider>
    )
})