import {makeAutoObservable} from "mobx";

import messageRu from "../i18n/messages-ru.json"
import messageKy from "../i18n/messages-ky.json"

export class MessageStore {
    private readonly _messages: { [key: string]: { [id: string]: string } }

    constructor() {
        this._messages = {
            ru: messageRu,
            ky: messageKy
        }

        makeAutoObservable(this)
    }

    public get messages() {
        return this._messages
    }
}