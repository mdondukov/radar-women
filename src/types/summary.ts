export interface ISummary {
    indicators: IIndicator[]
}

export interface IIndicator {
    stepId: number
    name: string
    nameSecondary: string | null
    value: number
    riskZone: "high" | "medium" | "low"
    riskText: string | null
    riskTextSecondary: string | null
}