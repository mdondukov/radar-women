import {makeAutoObservable} from "mobx";
import {IIndicator} from "../types/summary";

export class SummaryStore {
    private _indicators: IIndicator[]
    private _loading: boolean
    private _error: string | null

    constructor() {
        this._indicators = []
        this._loading = true
        this._error = null

        makeAutoObservable(this)
    }

    public setIndicators = (indicators: IIndicator[]) => {
        this._indicators = indicators
    }

    public setLoading = (loading: boolean) => {
        this._loading = loading
    }

    public setError = (error: string) => {
        this._error = error
    }

    public get indicators() {
        return this._indicators
    }

    public get isLoading() {
        return this._loading
    }

    public get error() {
        return this._error
    }
}