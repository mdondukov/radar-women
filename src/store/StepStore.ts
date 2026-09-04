import {makeAutoObservable} from "mobx";

import {IStep, StepType} from "../types/step";

export class StepStore {
    private _steps: IStep[]
    private _complete: number[]
    private _furthestIndex: number
    private _activeStep: IStep | null
    private _resume: boolean
    private _loading: boolean
    private _error: string | null

    constructor() {
        this._steps = []
        this._complete = []
        this._furthestIndex = 0
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
            this._furthestIndex = Math.max(this._furthestIndex, this.indexOf(stepId))
        }
    }

    public indexOf = (stepId: number) => {
        return this._steps.findIndex(step => step.id === stepId)
    }

    public getStep = (stepId: number) => {
        return this._steps.find(step => step.id === stepId)
    }

    /** Steps up to the furthest one the reader has reached are open in both
     *  directions: going back to fix an answer must not cost the way forward
     *  again. Anything past that edge stays closed — the flow is meant to be
     *  answered in order. */
    public isReachable = (stepId: number) => {
        const index = this.indexOf(stepId)
        return index >= 0 && index <= this._furthestIndex
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
        this._complete = this._complete.filter(id => id !== stepId)
    }

    public isCompleteStep = (stepId: number) => {
        const find = this._complete.find(id => id === stepId)
        return !!find
    }

    /** The radar averages every indicator, so it may only open once all of them
     *  are answered — otherwise the empty ones would be scored as zero and the
     *  chart would show a result the reader never gave. */
    public get isAllAssessmentComplete(): boolean {
        return this._steps.filter(step => step.type === StepType.ASSESSMENT).length > 0
            && this.incompleteAssessments.length === 0
    }

    /** Names of the показатели still missing answers — shown to the reader who
     *  tries to open the radar early, so they know where to go back to. */
    public get incompleteAssessments(): string[] {
        return this._steps
            .filter(step => step.type === StepType.ASSESSMENT && !this.isCompleteStep(step.id))
            .map(step => step.name)
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
        this._furthestIndex = 0
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