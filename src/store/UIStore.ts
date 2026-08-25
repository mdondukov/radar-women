import {makeAutoObservable, observable} from "mobx";
import {getDefaultUserLocale, HEADER_LOCALE} from "../utils";

const HEADER_HEIGHT = 100.6

export interface IWindowDimensions {
    width: number
    height: number
}

export class UIStore {
    private _locale: string
    private _windowDimensions: IWindowDimensions

    constructor() {
        this._locale = getDefaultUserLocale()
        this._windowDimensions = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        window.onresize = () => {
            this.setWindowDimensions({width: window.innerWidth, height: window.innerHeight})
        }

        makeAutoObservable(this, {setWindowDimensions: observable.struct})
    }

    public setLocale = (locale: string) => {
        this._locale = locale
        localStorage.setItem(HEADER_LOCALE, locale)
    }

    public setWindowDimensions = (dimensions: IWindowDimensions) => {
        this._windowDimensions = dimensions
    }

    public get locale(): string {
        return this._locale
    }

    public get windowDimensions(): IWindowDimensions {
        return this._windowDimensions
    }

    public get bodyHeight(): number {
        return this._windowDimensions.height - HEADER_HEIGHT
    }
}