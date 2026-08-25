import {makeAutoObservable} from "mobx";

import {IAnswerSelect, IQuestion} from "../types/question";

export class QuestionStore {
    private _questions: IQuestion[]
    private _selectAnswers: IAnswerSelect[]
    private _loading: boolean
    private _error: string | null

    constructor() {
        this._questions = []
        this._selectAnswers = []
        this._loading = true
        this._error = null

        makeAutoObservable(this)
    }

    public setQuestions = (questions: IQuestion[]) => {
        this._questions = questions
    }

    public setSelectAnswers = (selectAnswers: IAnswerSelect[]) => {
        this._selectAnswers = selectAnswers
    }

    public setSelectAnswer = (stepId: number, questionId: number, answerId: number) => {
        const selectAnswers = this._selectAnswers.filter(answer => answer.questionId !== questionId)
        selectAnswers.push({stepId: stepId, questionId: questionId, answerId: answerId})
        this._selectAnswers = selectAnswers
    }

    public setLoading = (loading: boolean) => {
        this._loading = loading
    }

    public setError = (error: string) => {
        this._error = error
    }

    public getQuestions = (stepId: number) => {
        return this._questions.filter(question => question.stepId === stepId)
    }

    public calcResult = (stepId: number) => {
        const selects = this._selectAnswers.filter(a => a.stepId === stepId)
        const answers = this._questions.flatMap(question => question.answers)
            .filter(answer => !!selects.find(select => select.answerId === answer.id))
        const result = answers.map(answer => answer.weight).reduce((a, b) => a + b, 0) / answers.length
        return Math.round(result * 10) / 10
    }

    public isAllQuestionsComplete = (stepId: number) => {
        const questionsLength = this._questions.filter(q => q.stepId === stepId).length
        const completeLength = this._selectAnswers.filter(a => a.stepId === stepId).length
        return questionsLength === completeLength
    }

    public isAnswerSelect = (questionId: number, answerId: number) => {
        return !!this._selectAnswers.find(answer => answer.questionId === questionId && answer.answerId === answerId)
    }

    public get selectAnswers() {
        return this._selectAnswers
    }

    public get isLoading() {
        return this._loading
    }

    public get error() {
        return this._error
    }
}