export interface IStep {
    id: number
    code: string
    name: string
    nameSecondary: string | null
    intro: string | null
    introSecondary: string | null
    descr: string | null
    descrSecondary: string | null
    type: StepType
    nextStepId: number | null
}

export enum StepType {
    REGION = "REGION",
    ASSESSMENT = "ASSESSMENT",
    RADAR = "RADAR"
}