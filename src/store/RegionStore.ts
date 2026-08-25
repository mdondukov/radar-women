import {IArea, IRegion, IRegionSelect} from "../types/region";
import {makeAutoObservable} from "mobx";

export class RegionStore {
    private _regions: IRegion[]
    private _selectRegion: IRegionSelect
    private _loading: boolean
    private _error: string | null

    constructor() {
        this._regions = []
        this._selectRegion = {regionId: -1, areaId: -1}
        this._loading = true
        this._error = null

        makeAutoObservable(this)
    }

    public setRegions = (regions: IRegion[]) => {
        this._regions = regions
    }

    public setSelectRegion = (select: IRegionSelect) => {
        this._selectRegion = select
    }

    public setLoading = (loading: boolean) => {
        this._loading = loading
    }

    public setError = (error: string) => {
        this._error = error
    }

    public getRegion = (regionId: number): IRegion => {
        const region = this._regions.find(r => r.id === regionId)
        if (!region) throw Error(`Region not found (id: ${regionId})`)
        return region
    }

    public getRegionIdByCode = (code: string): number => {
        const region = this._regions.find(r => r.code === code)
        return region ? region.id : -1
    }

    public getArea = (areaId: number): IArea => {
        const area = this._regions.flatMap(r => r.areas).find(a => a.id === areaId)
        if (!area) throw Error(`Area not found (id: ${areaId})`)
        return area
    }

    public get selectRegion() {
        return this._selectRegion
    }

    public get isLoading() {
        return this._loading
    }

    public get error() {
        return this._error
    }
}