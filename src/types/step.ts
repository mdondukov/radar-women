export interface IStep {
    id: number
    name: string
    descr: string | null
    type: StepType
    nextStepId: number | null
}

export enum StepType {
    REGION = "REGION",
    ASSESSMENT = "ASSESSMENT",
    RADAR = "RADAR"
}