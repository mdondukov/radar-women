import {LogSession, Stats, SubmissionRow, Zone} from "./types";

/** Calendar day in Bishkek time (UTC+6, no DST), as YYYY-MM-DD. */
export const bishkekDay = (iso: string): string =>
    new Date(new Date(iso).getTime() + 6 * 3600 * 1000).toISOString().slice(0, 10)

/** Date and time in Bishkek, as YYYY-MM-DD HH:MM. */
export const bishkekTime = (iso: string): string =>
    new Date(new Date(iso).getTime() + 6 * 3600 * 1000).toISOString().slice(0, 16).replace("T", " ")

const indicatorOrd = (questionCode: string): number => Number(questionCode.split("-")[1])

/** One finished questionnaire: the last radar of a page session. */
export interface Completion {
    id: number
    at: string
    day: string
    sessionId: string | null
    deviceId: string | null
    locale: string
    device: string | null
    region: string | null
    area: string | null
    indicators: Record<string, {value: number, zone: Zone}>
    answers: Set<string>          // "questionCode|answerCode"
    avg: number
}

/** One visit, finished or not, from stored submissions or from the old logs. */
export interface Visit {
    key: string
    day: string
    deviceId: string | null       // unknown before 24 Oct 2026 and for log visits
    device: string | null
    locale: string | null         // unknown for log visits
    region: string | null         // unknown for log visits
    blocks: number                // indicators finished, 0..9
    reachedRadar: boolean
    origin: "db" | "log"
}

export interface Model {
    completions: Completion[]
    visits: Visit[]
}

const answerKey = (q: string, a: string) => `${q}|${a}`

export const buildModel = (stats: Stats): Model => {
    const indicatorCount = stats.indicators.length
    const bySession = new Map<string, SubmissionRow[]>()
    stats.submissions.forEach(s => {
        const key = s.session_id ?? `row-${s.id}`
        bySession.set(key, [...(bySession.get(key) ?? []), s])
    })

    const completions: Completion[] = []
    const visits: Visit[] = []
    bySession.forEach((rows, key) => {
        const radars = rows.filter(r => r.source === "radar" || (r.source === null && r.is_complete))
        const last = radars[radars.length - 1]
        const first = rows[0]
        const blocks = new Set<number>()
        rows.forEach(r => r.answers.forEach(([q]) => blocks.add(indicatorOrd(q))))
        if (last) {
            const indicators: Completion["indicators"] = {}
            Object.entries(last.indicators).forEach(([code, [value, zone]]) => {
                indicators[code] = {value, zone}
            })
            const values = Object.values(indicators).map(i => i.value)
            completions.push({
                id: last.id,
                at: last.created_at,
                day: bishkekDay(last.created_at),
                sessionId: last.session_id,
                deviceId: last.device_id,
                locale: last.locale,
                device: last.device,
                region: last.region_code,
                area: last.area_code,
                indicators,
                answers: new Set(last.answers.map(([q, a]) => answerKey(q, a))),
                avg: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
            })
        }
        visits.push({
            key,
            day: bishkekDay(first.created_at),
            deviceId: first.device_id,
            device: first.device,
            locale: first.locale,
            region: first.region_code,
            blocks: last ? indicatorCount : Math.min(blocks.size, indicatorCount),
            reachedRadar: !!last,
            origin: "db",
        })
    })

    stats.log_history.sessions.forEach((s: LogSession, i) => {
        visits.push({
            key: `log-${i}`,
            day: bishkekDay(s.started_at),
            deviceId: null,
            device: s.device,
            locale: null,
            region: null,
            // one /summary per finished block, one more for the radar
            blocks: Math.min(s.summaries, indicatorCount),
            reachedRadar: s.reached_radar,
            origin: "log",
        })
    })

    completions.sort((a, b) => b.at.localeCompare(a.at))
    return {completions, visits}
}

export interface Filters {
    from?: string
    to?: string
    region?: string
    area?: string
    locale?: string
    device?: string
    zone?: {indicator: string, zone: Zone}
    answers: {question: string, answer: string}[]
    /** keep only the latest finished questionnaire of each device */
    latestPerDevice?: boolean
}

export const emptyFilters: Filters = {answers: []}

export const filtersFromParams = (p: URLSearchParams): Filters => {
    const zone = p.get("zone")?.split(":")
    return {
        from: p.get("from") ?? undefined,
        to: p.get("to") ?? undefined,
        region: p.get("region") ?? undefined,
        area: p.get("area") ?? undefined,
        locale: p.get("locale") ?? undefined,
        device: p.get("device") ?? undefined,
        zone: zone && zone.length === 2 ? {indicator: zone[0], zone: zone[1] as Zone} : undefined,
        latestPerDevice: p.get("latest") === "1" || undefined,
        answers: p.getAll("ans").map(v => {
            const [question, answer] = v.split("|")
            return {question, answer}
        }),
    }
}

export const filtersToParams = (f: Filters): URLSearchParams => {
    const p = new URLSearchParams()
    if (f.from) p.set("from", f.from)
    if (f.to) p.set("to", f.to)
    if (f.region) p.set("region", f.region)
    if (f.area) p.set("area", f.area)
    if (f.locale) p.set("locale", f.locale)
    if (f.device) p.set("device", f.device)
    if (f.zone) p.set("zone", `${f.zone.indicator}:${f.zone.zone}`)
    f.answers.forEach(a => p.append("ans", answerKey(a.question, a.answer)))
    if (f.latestPerDevice) p.set("latest", "1")
    return p
}

const inPeriod = (day: string, f: Filters) =>
    (!f.from || day >= f.from) && (!f.to || day <= f.to)

/** Distinct devices among the items; items without a device id are not counted. */
export const countDevices = (items: {deviceId: string | null}[]): number =>
    new Set(items.map(i => i.deviceId).filter(Boolean)).size

/** Items are newest first, so the first one seen per device is its latest. */
const latestPerDevice = (items: Completion[]): Completion[] => {
    const seen = new Set<string>()
    return items.filter(c => {
        if (!c.deviceId) return true
        if (seen.has(c.deviceId)) return false
        seen.add(c.deviceId)
        return true
    })
}

export const filterCompletions = (items: Completion[], f: Filters): Completion[] => {
    const matched = matchCompletions(items, f)
    return f.latestPerDevice ? latestPerDevice(matched) : matched
}

const matchCompletions = (items: Completion[], f: Filters): Completion[] =>
    items.filter(c =>
        inPeriod(c.day, f)
        && (!f.region || c.region === f.region)
        && (!f.area || c.area === f.area)
        && (!f.locale || c.locale === f.locale)
        && (!f.device || c.device === f.device)
        && (!f.zone || c.indicators[f.zone.indicator]?.zone === f.zone.zone)
        && f.answers.every(a => c.answers.has(answerKey(a.question, a.answer)))
    )

/** Answer and zone filters only exist for finished visits; region and
 *  language are unknown for visits recovered from logs, so those drop out. */
export const filterVisits = (items: Visit[], f: Filters, completions: Completion[]): Visit[] => {
    const byContent = !!f.zone || f.answers.length > 0
    const sessions = new Set(completions.map(c => c.sessionId ?? `row-${c.id}`))
    return items.filter(v =>
        inPeriod(v.day, f)
        && (!f.device || v.device === f.device)
        && (!f.region || v.region === f.region)
        && (!f.locale || v.locale === f.locale)
        && (!byContent || (v.origin === "db" && sessions.has(v.key)))
    )
}

export const hasFilters = (f: Filters) =>
    !!(f.from || f.to || f.region || f.area || f.locale || f.device || f.zone || f.answers.length
        || f.latestPerDevice)
