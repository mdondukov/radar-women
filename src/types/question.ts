export interface IQuestion {
    id: number
    stepId: number
    content: string
    isMultiSelect: boolean
    answers: IAnswer[]
}

export interface IAnswer {
    id: number
    content: string
    descr: string | null
    weight: number
    recommendation: string | null
}

export interface IAnswerSelect {
    stepId: number
    questionId: number
    answerId: number
}