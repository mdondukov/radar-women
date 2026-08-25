import {makeAutoObservable} from "mobx";

import {IStep} from "../types/step";

export class StepStore {
    private _steps: IStep[]
    private _complete: number[]
    private _activeStep: IStep | null
    private _resume: boolean
    private _loading: boolean
    private _error: string | null

    constructor() {
        this._steps = []
        this._complete = []
        this._activeStep = null
        this._resume = false
        this._loading = true
        this._error = null

        makeAutoObservable(this)
    }

    public setSteps = (steps: IStep[]) => {
        this._steps = steps
    }

    public setActive = (stepId: number) => {
        const nextStep = this._steps.find(step => step.id === stepId)

        if (nextStep) {
            this._activeStep = nextStep
            this._resume = false
        }
    }

    public setResume = (resume: boolean) => {
        this._resume = resume
    }

    public setLoading = (loading: boolean) => {
        this._loading = loading
    }

    public setError = (error: string) => {
        this._error = error
    }

    public setCompleteStep = (stepId: number) => {
        const find = this._complete.find(id => id === stepId)
        if (!find) this._complete.push(stepId)
    }

    public setIncompleteStep = (stepId: number) => {
        this._complete = this._complete.filter(id => id === stepId)
    }

    public isCompleteStep = (stepId: number) => {
        const find = this._complete.find(id => id === stepId)
        return !!find
    }

    public resetSteps = () => {
        this._steps = []
            // this._steps.map(step => {
            //     step.isComplete = false
            //     step.questions.map(question => {
            //         question.selectAnswerId = -1
            //         return question
            //     })
            //     return step
            // })
    }

    public resetActiveStep = () => {
        this._activeStep = null
    }

    public get steps() {
        return this._steps
    }

    public get activeStep() {
        if (!this._activeStep) throw Error("Active step must not be a null")
        return this._activeStep
    }

    public get isResume() {
        return this._resume
    }

    public get isLoading() {
        return this._loading
    }

    public get error() {
        return this._error
    }
}