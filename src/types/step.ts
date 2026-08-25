export interface IStep {
    id: number
    code: string
    name: string
    intro: string | null
    descr: string | null
    type: StepType
    nextStepId: number | null
}

export enum StepType {
    REGION = "REGION",
    ASSESSMENT = "ASSESSMENT",
    RADAR = "RADAR"
}