export const DEFAULT_LOCALE = "ru"
export const HEADER_LOCALE = "locale"

export const getDefaultUserLocale = () => {
    const locale = localStorage.getItem(HEADER_LOCALE)
    return locale != null ? locale : DEFAULT_LOCALE
}