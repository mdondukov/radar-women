export const DEFAULT_LOCALE = "ru"
export const HEADER_LOCALE = "locale"

export const getDefaultUserLocale = () => {
    const locale = localStorage.getItem(HEADER_LOCALE)
    return locale != null ? locale : DEFAULT_LOCALE
}
export const SECONDARY_LOCALE: Record<string, string> = {ru: "ky", ky: "ru"}

export const LOCALE_LABEL: Record<string, string> = {ru: "Русский", ky: "Кыргызча"}

/** Text of a field in the language the reader picked for content blocks.
 *  Falls back to the primary text when the mirror translation is missing —
 *  an empty recommendation card would be worse than one in the other language. */
export const pickLocale = (
    primary: string | null,
    secondary: string | null | undefined,
    useSecondary: boolean
): string | null => (useSecondary ? (secondary ?? primary) : primary)
