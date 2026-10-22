import {makeAutoObservable, observable} from "mobx";
import {getDefaultUserLocale, HEADER_LOCALE, SECONDARY_LOCALE} from "../utils";

const HEADER_HEIGHT = 100.6

export interface IWindowDimensions {
    width: number
    height: number
}

export class UIStore {
    private _locale: string
    private _contentLocale: string
    private _windowDimensions: IWindowDimensions
    private _pollOutdated: boolean

    constructor() {
        this._locale = getDefaultUserLocale()
        this._contentLocale = this._locale
        this._pollOutdated = false
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
        this._contentLocale = locale
        localStorage.setItem(HEADER_LOCALE, locale)
    }

    /** Language of the information and recommendation blocks, switched by the
     *  reader per block set without changing the language of the whole site. */
    public setContentLocale = (locale: string) => {
        this._contentLocale = locale
    }

    public setPollOutdated = (outdated: boolean) => {
        this._pollOutdated = outdated
    }

    public setWindowDimensions = (dimensions: IWindowDimensions) => {
        this._windowDimensions = dimensions
    }

    public get locale(): string {
        return this._locale
    }

    /** The other language — shown as a mirror under every question and answer. */
    public get secondaryLocale(): string {
        return SECONDARY_LOCALE[this._locale] ?? "ky"
    }

    public get contentLocale(): string {
        return this._contentLocale
    }

    public get isSecondaryContent(): boolean {
        return this._contentLocale !== this._locale
    }

    /** The questionnaire changed on the server after this page loaded it. */
    public get pollOutdated(): boolean {
        return this._pollOutdated
    }

    public get windowDimensions(): IWindowDimensions {
        return this._windowDimensions
    }

    public get bodyHeight(): number {
        return this._windowDimensions.height - HEADER_HEIGHT
    }
}