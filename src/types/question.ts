export interface IQuestion {
    id: number
    stepId: number
    content: string
    contentSecondary: string | null
    isMultiSelect: boolean
    answers: IAnswer[]
}

export interface IAnswer {
    id: number
    content: string
    contentSecondary: string | null
    descr: string | null
    weight: number
    recommendation: string | null
    recommendationSecondary: string | null
}

export interface IAnswerSelect {
    stepId: number
    questionId: number
    answerId: number
}