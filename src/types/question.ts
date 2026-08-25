export interface IQuestion {
    id: number
    stepId: number
    content: string
    answers: IAnswer[]
}

export interface IAnswer {
    id: number
    content: string
    descr: string | null
    weight: number
}

export interface IAnswerSelect {
    stepId: number
    questionId: number
    answerId: number
}