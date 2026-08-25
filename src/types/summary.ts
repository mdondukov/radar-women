export interface ISummary {
    indicators: IIndicator[]
}

export interface IIndicator {
    stepId: number
    name: string
    value: number
    riskZone: "high" | "medium" | "low"
    riskText: string | null
}