import React from "react";
import {observer} from "mobx-react-lite";

import {useStores} from "../../hooks/use-stores";
import {LOCALE_LABEL} from "../../utils";

/** Language switch for one block of prose — the intro, the risk-zone text, the
 *  recommendations, the "География" card. It changes only what the reader is
 *  reading, not the language of the site, so someone can keep the interface in
 *  Russian and still read a recommendation in Kyrgyz (and print it that way).
 */
export const ContentLangButton: React.FC = observer(() => {
    const {uiStore} = useStores()
    const locales = [uiStore.locale, uiStore.secondaryLocale]

    return (
        <div className="print:hidden inline-flex rounded-lg overflow-hidden border border-blue-200 mb-4">
            {
                locales.map(locale =>
                    <button
                        key={locale}
                        type="button"
                        onClick={() => uiStore.setContentLocale(locale)}
                        className={
                            `px-3 py-1 text-sm font-medium ` +
                            (uiStore.contentLocale === locale
                                ? `bg-blue-800 text-white`
                                : `bg-white text-blue-800 hover:bg-blue-50`)
                        }
                    >
                        {LOCALE_LABEL[locale] ?? locale}
                    </button>
                )
            }
        </div>
    )
})
