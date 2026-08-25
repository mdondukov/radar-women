export interface IAlert {
    type: AlertType
    name: string
    desc: string
}

export enum AlertType {
    ERROR, WARN
}