export type Zone = "high" | "medium" | "low"

export interface AnswerDef {
    code: string
    content: string
    weight: number
    ord: number
}

export interface QuestionDef {
    code: string
    content: string
    ord: number
    is_multi_select: boolean
    answers: AnswerDef[]
}

export interface IndicatorDef {
    code: string
    step_code: string
    name: string
    ord: number
    high_risk_max: number | null
    medium_risk_max: number | null
    questions: QuestionDef[]
}

export interface RegionDef {
    code: string
    name: string
    areas: {code: string, name: string}[]
}

export interface SubmissionRow {
    id: number
    created_at: string
    session_id: string | null
    device_id: string | null
    source: "step" | "radar" | null
    is_complete: boolean
    locale: string
    device: "mobile" | "desktop" | null
    region_code: string | null
    area_code: string | null
    answers: [string, string][]
    indicators: Record<string, [number, Zone]>
}

export interface LogSession {
    started_at: string
    device: "mobile" | "desktop"
    minutes: number
    summaries: number
    reached_radar: boolean
}

export interface Stats {
    indicators: IndicatorDef[]
    regions: RegionDef[]
    submissions: SubmissionRow[]
    log_history: {until: string, sessions: LogSession[]}
}
