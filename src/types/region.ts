export interface IRegion {
    id: number
    code: string
    name: string
    descr: string
    ord: number
    areas: IArea[]
}

export interface IArea {
    id: number
    name: string
    descr: string
    impact: string
    ord: number
}

export interface IRegionSelect {
    regionId: number
    areaId: number
}